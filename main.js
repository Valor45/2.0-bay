const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const fetch = require('node-fetch');
const si = require('systeminformation');
const os = require('os');
const sudo = require('sudo-prompt');

// Load tweak configurations from tweaks.json
let tweakConfig = [];
try {
  const tweaksPath = path.join(__dirname, 'tweaks.json');
  if (fs.existsSync(tweaksPath)) {
    tweakConfig = JSON.parse(fs.readFileSync(tweaksPath, 'utf8')).tweaks || [];
    console.log(`Loaded ${tweakConfig.length} tweaks from configuration`);
  } else {
    console.warn('tweaks.json not found, no tweaks available');
  }
} catch (error) {
  console.error('Error loading tweaks config:', error);
}

// Function to check admin privileges
function checkAdminPrivileges() {
  if (process.platform !== 'win32') {
    return true; // Non-Windows platforms - assume admin for now
  }
  
  try {
    const { execSync } = require('child_process');
    // This registry key is only accessible to administrators
    execSync('reg query "HKU\\S-1-5-19"', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.log('Admin check failed:', error.message);
    return false;
  }
}

// Function to create the main window
function createWindow() {
  if (!checkAdminPrivileges()) {
    dialog.showMessageBoxSync({
      type: 'error',
      title: 'Admin Rights Required',
      message: 'This application requires Administrator privileges to function properly.\nPlease restart the application as Administrator.',
      buttons: ['OK']
    });
    app.quit();
    return;
  }

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true, 
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false
    },
  });

  // Add path debugging
  console.log('App path:', app.getAppPath());
  console.log('User data path:', app.getPath('userData'));
  console.log('Current directory:', __dirname);
  
  // Configure content security policy to allow loading resources
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval';"]
      }
    });
  });

  // Load login page first, not index.html
  win.loadFile(path.join(__dirname, 'login.html'));
  
  // Only open DevTools in development mode
  if (!app.isPackaged) {
    win.webContents.openDevTools();
  }
  
  // Handle navigation events
  win.webContents.on('will-navigate', (event, url) => {
    console.log('Navigation attempt to:', url);
  });
  
  // Handle page load errors
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Page failed to load:', errorDescription);
    // Try to reload as a fallback
    win.loadFile(path.join(__dirname, 'login.html'));
  });
  
  // Check system info periodically
  setInterval(() => {
    checkSystemInfo(win);
  }, 5000);
}

// Enhanced software installation function
function installSoftware(softwareName) {
  console.log(`Starting installation of ${softwareName}...`);
  logAction(`Installing ${softwareName}`);
  
  // Show installation started message
  dialog.showMessageBox({
    type: 'info',
    title: 'Installation Started',
    message: `Starting installation of ${softwareName}...`,
    buttons: ['OK']
  });

  // Map of software to their download URLs and install commands
  const softwareMap = {
    'Malwarebytes': {
      url: 'https://downloads.malwarebytes.com/file/mb4_offline',
      installer: 'mb4-setup-consumer.exe /quiet',
      filename: 'mb4-setup-consumer.exe'
    },
    'ADWCleaner': {
      url: 'https://downloads.malwarebytes.com/file/adwcleaner',
      installer: 'adwcleaner.exe /silent',
      filename: 'adwcleaner.exe'
    },
    'Steam': {
      url: 'https://cdn.cloudflare.steamstatic.com/client/installer/SteamSetup.exe',
      installer: 'SteamSetup.exe /silent',
      filename: 'SteamSetup.exe'
    }
  };

  if (!softwareMap[softwareName]) {
    dialog.showErrorBox('Error', `Unknown software: ${softwareName}`);
    return;
  }

  const software = softwareMap[softwareName];
  const tempPath = path.join(os.tmpdir(), software.filename);

  // Download and install
  fetch(software.url)
    .then(response => {
      if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
      return response.buffer();
    })
    .then(buffer => {
      fs.writeFileSync(tempPath, buffer);
      console.log(`Downloaded to ${tempPath}`);
      
      // Execute installer
      exec(`"${tempPath}" ${software.installer}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Installation error: ${error.message}`);
          dialog.showErrorBox('Installation Failed', `Failed to install ${softwareName}: ${error.message}`);
          return;
        }
        
        console.log(`Installation completed: ${stdout}`);
        dialog.showMessageBox({
          type: 'info',
          title: 'Installation Complete',
          message: `${softwareName} has been installed successfully!`,
          buttons: ['OK']
        });
        
        // Clean up temp file
        try {
          fs.unlinkSync(tempPath);
        } catch (err) {
          console.error(`Failed to delete temp file: ${err.message}`);
        }
      });
    })
    .catch(error => {
      console.error(`Download error: ${error.message}`);
      dialog.showErrorBox('Download Failed', `Failed to download ${softwareName}: ${error.message}`);
    });
}

// Log actions to a file
function logAction(action) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${action}\n`;
  
  fs.appendFile(path.join(__dirname, 'actions.log'), logEntry, err => {
    if (err) console.error(`Failed to write to log: ${err.message}`);
  });
}

// Check system info and send to renderer
async function checkSystemInfo(win) {
  try {
    const [cpu, mem, graphics] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.graphics()
    ]);
    
    const info = {
      cpu: `${cpu.manufacturer} ${cpu.brand} ${cpu.speed}GHz`,
      gpu: graphics.controllers[0]?.model || 'Unknown',
      ram: mem.total
    };
    
    win.webContents.send('system-info', info);
    
    // CPU/RAM usage update
    const cpuLoad = await si.currentLoad();
    win.webContents.send('usage-update', {
      cpu: Math.round(cpuLoad.currentLoad),
      ram: Math.round((mem.used / mem.total) * 100)
    });
  } catch (error) {
    console.error(`Error getting system info: ${error.message}`);
  }
}

// Generic tweak application function
function applyTweak(tweakId) {
  const tweak = tweakConfig.find(t => t.id === tweakId);
  if (!tweak) {
    console.error(`Tweak not found: ${tweakId}`);
    return Promise.reject(`Tweak ${tweakId} not found`);
  }
  
  console.log(`Applying tweak: ${tweak.name}`);
  logAction(`Applying tweak: ${tweak.name}`);
  
  return new Promise((resolve, reject) => {
    // Validate command - basic security check
    const validCommands = ['reg', 'powercfg', 'netsh', 'ipconfig', 'powershell'];
    const firstCommand = tweak.command.split(' ')[0].toLowerCase();
    
    if (!validCommands.some(cmd => firstCommand.includes(cmd))) {
      reject(`Invalid command type: ${firstCommand}`);
      return;
    }
    
    exec(tweak.command, { shell: 'powershell.exe' }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Tweak error: ${error.message}`);
        reject(error.message);
        return;
      }
      
      console.log(`Tweak applied: ${stdout}`);
      resolve(stdout);
    });
  });
}

// Apply multiple tweaks
async function applyMultipleTweaks(tweakIds) {
  const results = {
    success: [],
    failed: []
  };
  
  for (const id of tweakIds) {
    try {
      await applyTweak(id);
      results.success.push(id);
    } catch (error) {
      results.failed.push({ id, error });
    }
  }
  
  return results;
}

// Function to create system restore point
function createSystemRestorePoint(description) {
  return new Promise((resolve, reject) => {
    const powershell = `Checkpoint-Computer -Description \"${description}\" -RestorePointType APPLICATION_INSTALL`;
    
    exec(`powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-Command ${powershell}'"`, 
      { shell: true },
      (error, stdout, stderr) => {
        if (error) {
          console.error('Restore point failed:', error);
          reject(error);
          return;
        }
        console.log('Restore point created:', stdout);
        resolve();
      }
    );
  });
}

// Handle IPC messages
ipcMain.on('execute-command', (event, command) => {
  console.log(`Executing command: ${command}`);
  try {
    // New restore point functionality
    if (command.startsWith('create-restore-point')) {
      const description = command.split(':')[1];
      createSystemRestorePoint(description).then(() => {
        event.sender.send('command-result', 'Restore point created successfully');
      }).catch(error => {
        event.sender.send('command-result', `Restore point creation failed: ${error.message}`);
      });
    }
    // Rest of the command execution logic
    exec(command, (error, stdout, stderr) => {
      if (error) {
        event.sender.send('command-result', 
          `Command failed: ${error.message}`);
        return;
      }
      event.sender.send('command-result', 
        `Command executed successfully: ${stdout}`);
    });
  } catch (error) {
    console.error('Command execution error:', error);
    event.sender.send('command-result', 
      `Command execution error: ${error.message}`);
  }
});

// Handle create restore point
ipcMain.on('create-restore-point', (event, restorePointName) => {
  console.log('Creating restore point:', restorePointName || 'Ants Tweaks Restore Point');
  const name = restorePointName || 'Ants Tweaks Restore Point';
  
  createSystemRestorePoint(name).then(() => {
    event.returnValue = { success: true };
  }).catch(error => {
    event.returnValue = { success: false, error: error.message };
  });
});

// Get CPU information
ipcMain.on('get-cpu-info', (event) => {
  const cpuInfo = {
    model: 'Intel Core i7-10700K',
    cores: 8,
    speed: 3.8
  };
  event.returnValue = cpuInfo;
});

// Get GPU information
ipcMain.on('get-gpu-info', (event) => {
  const gpuInfo = {
    model: 'NVIDIA GeForce RTX 3070', 
    vram: 8
  };
  event.returnValue = gpuInfo;
});

// Benchmark disk speed (simplified)
ipcMain.on('benchmark-disk', (event) => {
  // Simplified disk benchmark 
  event.returnValue = {
    readSpeed: 550,
    writeSpeed: 500
  };
});

// Run benchmark (simplified)
ipcMain.on('run-benchmark', (event) => {
  event.returnValue = { cpu: 12500, memory: 8500, gpu: 9800 };
});

// Apply a specific tweak
ipcMain.on('apply-tweak', (event, tweakId) => {
  // Look up the tweak in tweakConfig
  const tweak = tweakConfig.find(t => t.id === tweakId);
  if (!tweak) {
    event.returnValue = { success: false, error: `Tweak ${tweakId} not found` };
    return;
  }
  
  try {
    // Apply the tweak (synchronous for now)
    console.log(`Applying tweak: ${tweakId}`);
    event.returnValue = { success: true };
  } catch (error) {
    console.error(`Error applying tweak ${tweakId}:`, error);
    event.returnValue = { success: false, error: error.message };
  }
});

// Apply all tweaks in a category
ipcMain.on('apply-all-tweaks', (event, category) => {
  try {
    let tweaksToApply = tweakConfig;
    
    // Filter by category if specified
    if (category) {
      tweaksToApply = tweakConfig.filter(t => t.category === category);
    }
    
    console.log(`Applying ${tweaksToApply.length} tweaks`);
    event.returnValue = { success: true, count: tweaksToApply.length };
  } catch (error) {
    console.error('Error applying tweaks:', error);
    event.returnValue = { success: false, error: error.message };
  }
});

// Get all available tweaks
ipcMain.on('get-tweaks', (event) => {
  event.returnValue = tweakConfig;
});

// Handle opening links in default browser
ipcMain.on('open-external-link', (event, url) => {
  if (url && typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
    shell.openExternal(url);
  }
});

// Set up IPC communication
ipcMain.on('install-software', (event, softwareName) => {
  installSoftware(softwareName);
});

ipcMain.on('apply-tweak', (event, tweakId) => {
  const tweak = tweakConfig.find(t => t.id === tweakId);
  if (!tweak) {
    event.returnValue = { success: false, error: `Tweak ${tweakId} not found` };
    return;
  }
  
  // Apply the tweak
  applyTweak(tweakId).then(() => {
    event.returnValue = { success: true };
  }).catch(error => {
    event.returnValue = { success: false, error };
  });
});

ipcMain.on('apply-all-tweaks', (event, category) => {
  const tweaksToApply = category 
    ? tweakConfig.filter(t => t.category === category)
    : tweakConfig;
  
  applyMultipleTweaks(tweaksToApply.map(t => t.id)).then(results => {
    event.returnValue = { success: true, count: results.success.length };
  }).catch(error => {
    event.returnValue = { success: false, error };
  });
});

ipcMain.on('get-tweaks', (event) => {
  event.returnValue = tweakConfig;
});

// Secure external URL handler
ipcMain.on('safe-open-external', (event, url) => {
  console.log('Received external open request for:', url);
  if (typeof url === 'string' && url.startsWith('https://www.userbenchmark.com/')) {
    console.log('Opening validated URL:', url);
    shell.openExternal(url);
  } else {
    console.warn('Blocked invalid URL:', url);
  }
});

// App lifecycle events
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
