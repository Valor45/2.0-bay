
const { app, BrowserWindow, dialog, ipcMain } = require('electron');  // Added ipcMain
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const fetch = require('node-fetch');
const si = require('systeminformation');
const os = require('os');  // Added os module which was needed

// Function to create the main window
function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true, // For demonstration (security risk in production)
      contextIsolation: false,
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'));
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
    },
    'Epic Games': {
      url: 'https://launcher-public-service-prod06.ol.epicgames.com/launcher/api/installer/download/EpicGamesLauncherInstaller.msi',
      installer: 'msiexec /i EpicGamesLauncherInstaller.msi /quiet /qn /norestart',
      filename: 'EpicGamesLauncherInstaller.msi'
    },
    'Battle.net': {
      url: 'https://www.battle.net/download/getInstallerForGame?os=win&gameProgram=BATTLENET_APP',
      installer: 'Battle.net-Setup.exe --lang=enUS --installpath="C:\\Program Files (x86)\\Battle.net"',
      filename: 'Battle.net-Setup.exe'
    },
    'Ubisoft Connect': {
      url: 'https://ubi.li/4vxt9',
      installer: 'UbisoftConnectInstaller.exe /S',
      filename: 'UbisoftConnectInstaller.exe'
    },
    'Discord': {
      url: 'https://discord.com/api/download?platform=win&format=exe',
      installer: 'DiscordSetup.exe /S',
      filename: 'DiscordSetup.exe'
    }
  };

  const software = softwareMap[softwareName];
  if (!software) {
    dialog.showMessageBox({
      type: 'error',
      title: 'Error',
      message: `Installation details not found for ${softwareName}`,
      buttons: ['OK']
    });
    return;
  }

  const downloadPath = path.join(os.tmpdir(), software.filename);
  
  // Download the file
  fetch(software.url)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.buffer();
    })
    .then(buffer => {
      fs.writeFileSync(downloadPath, buffer);
      console.log(`Downloaded ${softwareName} to ${downloadPath}`);
      
      // Execute the installer
      exec(`${downloadPath} ${software.installer}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error installing ${softwareName}:`, error);
          dialog.showMessageBox({
            type: 'error',
            title: 'Installation Failed',
            message: `Failed to install ${softwareName}: ${error.message}`,
            buttons: ['OK']
          });
          return;
        }
        
        console.log(`${softwareName} installed successfully`);
        dialog.showMessageBox({
          type: 'info',
          title: 'Installation Complete',
          message: `${softwareName} has been installed successfully!`,
          buttons: ['OK']
        });
        
        // Clean up the downloaded file
        try {
          fs.unlinkSync(downloadPath);
          console.log(`Cleaned up ${downloadPath}`);
        } catch (cleanupError) {
          console.error(`Error cleaning up ${downloadPath}:`, cleanupError);
        }
      });
    })
    .catch(error => {
      console.error(`Error downloading ${softwareName}:`, error);
      dialog.showMessageBox({
        type: 'error',
        title: 'Download Failed',
        message: `Failed to download ${softwareName}: ${error.message}`,
        buttons: ['OK']
      });
    });
}

// Handle system logs and display
function logAction(action) {
  const logFilePath = path.join(__dirname, 'actions.log');
  const logMessage = `${new Date().toISOString()} - ${action}\n`;
  fs.appendFileSync(logFilePath, logMessage, 'utf8');
}

// Check for system info (CPU, GPU, RAM usage)
async function checkSystemInfo() {
  const cpu = await si.cpu();
  const gpu = await si.graphics();
  const ram = await si.mem();

  return {
    cpu: cpu.manufacturer + ' ' + cpu.brand,
    gpu: gpu.controllers[0]?.model || 'Not detected',
    ram: ram.total,
  };
}

// Set up IPC communication for software installation
ipcMain.on('install-software', (event, softwareName) => {
  installSoftware(softwareName);
});

app.whenReady().then(() => {
  createWindow();
  logAction('App started');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
// FPS/Performance Tweaks
function applyFpsTweaks() {
  // Example tweak: Disable Aero Glass
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\DWM" /v "AeroGlass" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) {
      console.log(`Error applying FPS tweak: ${stderr}`);
    } else {
      console.log('FPS Tweak: Disabled Aero Glass');
    }
  });

  // Adjust Processor Affinity Mask (Additional tweaks can go here)
}

// Network Tweaks
function applyNetworkTweaks() {
  // Flush DNS Cache
  exec('ipconfig /flushdns', (err, stdout, stderr) => {
    if (err) {
      console.log(`Error applying network tweak: ${stderr}`);
    } else {
      console.log('Network Tweak: Flushed DNS Cache');
    }
  });

  // Disable IPv6 (Additional tweaks can go here)
  exec('netsh interface ipv6 set teredo disabled', (err, stdout, stderr) => {
    if (err) {
      console.log(`Error applying network tweak: ${stderr}`);
    } else {
      console.log('Network Tweak: Disabled IPv6');
    }
  });
}

// Visual Tweaks
function applyVisualTweaks() {
  // Example tweak: Enable/Disable Dark Mode
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v "AppsUseLightTheme" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) {
      console.log(`Error applying visual tweak: ${stderr}`);
    } else {
      console.log('Visual Tweak: Enabled Dark Mode');
    }
  });

  // Disable Window Animations (Additional tweaks can go here)
}

// Privacy Tweaks
function applyPrivacyTweaks() {
  // Disable Telemetry
  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v "AllowTelemetry" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) {
      console.log(`Error applying privacy tweak: ${stderr}`);
    } else {
      console.log('Privacy Tweak: Disabled Telemetry');
    }
  });

  // Disable Windows Update (Additional tweaks can go here)
}

// Game Launcher Tweaks
function applyGameLauncherTweaks() {
  // Install and launch Steam
  installSoftware('Steam');
  
  // Install and launch Epic Games (Additional tweaks can go here)
}

// Miscellaneous Tweaks
function applyMiscTweaks() {
  // Disable Windows Defender
  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender" /v "DisableAntiSpyware" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) {
      console.log(`Error applying misc tweak: ${stderr}`);
    } else {
      console.log('Misc Tweak: Disabled Windows Defender');
    }
  });

  // Remove Windows Bloatware (Additional tweaks can go here)
}

// Function to apply all tweaks (triggered by a button in GUI)



// FPS Tweaks 1 - Remove unnecessary background processes for better FPS
function applyFpsBackgroundTweaks() {
  exec('sc stop "SysMain"', (err, stdout, stderr) => {
    if (err) console.error('Error stopping SysMain:', err);
  });
  exec('sc config "SysMain" start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling SysMain:', err);
  });
}

// FPS Tweaks 2 - Game Mode (disable Windows Game Mode)
function applyGameModeTweaks() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR" /v "AppCaptureEnabled" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Game Mode:', err);
  });
}

// FPS Tweaks 3 - Adjust CPU scheduling priority
function adjustCpuScheduling() {
  exec('bcdedit /set IncreaseUserVa 4000', (err, stdout, stderr) => {
    if (err) console.error('Error adjusting CPU scheduling:', err);
  });
}

// FPS Tweaks 4 - Reduce visual effects for better FPS
function applyVisualEffectTweaks() {
  exec('reg add "HKCU\\Control Panel\\Desktop" /v "MenuShowDelay" /t REG_SZ /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling visual effects:', err);
  });
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "ShowSyncProviderNotifications" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling sync notifications:', err);
  });
}

// FPS Tweaks 5 - Disable Game DVR
function disableGameDvr() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR" /v "AppCaptureEnabled" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Game DVR:', err);
  });
}
// Network Tweaks 1 - Disable Windows auto-tuning
function applyAutoTuning() {
  exec('netsh interface tcp set global autotuninglevel=disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling auto-tuning:', err);
  });
}

// Network Tweaks 2 - Disable IPv6
function disableIPv6() {
  exec('netsh interface ipv6 set state disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling IPv6:', err);
  });
}

// Network Tweaks 3 - Set maximum connections per server
function setMaxConnections() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v "MaxConnectionsPerServer" /t REG_DWORD /d 16 /f', (err, stdout, stderr) => {
    if (err) console.error('Error setting max connections:', err);
  });
}

// Network Tweaks 4 - Flush DNS cache on startup
function flushDnsCache() {
  exec('ipconfig /flushdns', (err, stdout, stderr) => {
    if (err) console.error('Error flushing DNS cache:', err);
  });
}

// Network Tweaks 5 - Disable Windows DNS caching
function disableDnsCaching() {
  exec('sc stop Dnscache', (err, stdout, stderr) => {
    if (err) console.error('Error stopping DNS cache service:', err);
  });
  exec('sc config Dnscache start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling DNS cache service:', err);
  });
}
// Visual Tweaks 1 - Disable visual effects for faster performance
function disableVisualEffects() {
  exec('reg add "HKCU\\Control Panel\\Desktop" /v "MenuShowDelay" /t REG_SZ /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling visual effects:', err);
  });
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "ShowTaskViewButton" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Task View Button:', err);
  });
}

// Visual Tweaks 2 - Disable Cortana
function disableCortana() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Search" /v "CortanaEnabled" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Cortana:', err);
  });
}

// Visual Tweaks 3 - Hide file extensions
function hideFileExtensions() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "HideFileExt" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error hiding file extensions:', err);
  });
}

// Visual Tweaks 4 - Show hidden files
function showHiddenFiles() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "Hidden" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error showing hidden files:', err);
  });
}

// Visual Tweaks 5 - Remove taskbar transparency
function removeTaskbarTransparency() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v "EnableTransparency" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error removing taskbar transparency:', err);
  });
}
// Privacy Tweaks 1 - Disable Windows telemetry
function disableTelemetry() {
  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v "AllowTelemetry" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) {
      console.log(`Error disabling telemetry: ${stderr}`);
    } else {
      console.log('Privacy Tweak: Disabled Telemetry');
    }
  });
}

// Privacy Tweaks 2 - Disable Windows Update telemetry
function disableUpdateTelemetry() {
  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v "DisableAutomaticRestartSignOn" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) {
      console.log(`Error disabling update telemetry: ${stderr}`);
    } else {
      console.log('Privacy Tweak: Disabled Update Telemetry');
    }
  });
}

// Privacy Tweaks 3 - Remove Cortana data collection
function removeCortanaDataCollection() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Search" /v "AllowCortana" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) {
      console.log(`Error removing Cortana data collection: ${stderr}`);
    } else {
      console.log('Privacy Tweak: Removed Cortana Data Collection');
    }
  });
}

// Privacy Tweaks 4 - Disable SmartScreen
function disableSmartScreen() {
  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\System" /v "EnableSmartScreen" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) {
      console.log(`Error disabling SmartScreen: ${stderr}`);
    } else {
      console.log('Privacy Tweak: Disabled SmartScreen');
    }
  });
}

// Privacy Tweaks 5 - Disable app tracking
function disableAppTracking() {
  exec('reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\AdvertisingInfo" /v "Enabled" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) {
      console.log(`Error disabling app tracking: ${stderr}`);
    } else {
      console.log('Privacy Tweak: Disabled App Tracking');
    }
  });
}
// Game Launcher Tweaks 1 - Install and launch Steam
function applySteamTweaks() {
  installSoftware('Steam');
}

// Game Launcher Tweaks 2 - Install and launch Epic Games
function applyEpicGamesTweaks() {
  installSoftware('Epic Games');
}

// Game Launcher Tweaks 3 - Install and launch Battle.net
function applyBattleNetTweaks() {
  installSoftware('Battle.net');
}

// Game Launcher Tweaks 4 - Install and launch Roblox
function applyRobloxTweaks() {
  installSoftware('Roblox');
}

// Game Launcher Tweaks 5 - Install and launch Ubisoft Connect
function applyUbisoftConnectTweaks() {
  installSoftware('Ubisoft Connect');
}

// Game Launcher Tweaks 6 - Install and launch GOG Galaxy
function applyGogGalaxyTweaks() {
  installSoftware('GOG Galaxy');
}

// Game Launcher Tweaks 7 - Install and launch Origin (EA)
function applyOriginTweaks() {
  installSoftware('Origin');
}

// Game Launcher Tweaks 8 - Install and launch Discord
function applyDiscordTweaks() {
  installSoftware('Discord');
}

// Game Launcher Tweaks 9 - Install and launch Wargaming.net Launcher
function applyWargamingTweaks() {
  installSoftware('Wargaming.net');
}
// Miscellaneous Tweaks 1 - Disable Windows Defender
function disableDefender() {
  exec('sc stop "WinDefend"', (err, stdout, stderr) => {
    if (err) console.error('Error stopping Windows Defender service:', err);
  });
  exec('sc config "WinDefend" start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Windows Defender service:', err);
  });
}

// Miscellaneous Tweaks 2 - Remove Windows Bloatware
function removeWindowsBloatware() {
  exec('powershell "Get-AppxPackage *Xbox* | Remove-AppxPackage"', (err, stdout, stderr) => {
    if (err) console.error('Error removing Xbox app:', err);
  });
  exec('powershell "Get-AppxPackage *OneDrive* | Remove-AppxPackage"', (err, stdout, stderr) => {
    if (err) console.error('Error removing OneDrive app:', err);
  });
  exec('powershell "Get-AppxPackage *Skype* | Remove-AppxPackage"', (err, stdout, stderr) => {
    if (err) console.error('Error removing Skype app:', err);
  });
}

// Miscellaneous Tweaks 3 - Clear system cache
function clearSystemCache() {
  exec('del /q /f /s %TEMP%', (err, stdout, stderr) => {
    if (err) console.error('Error clearing temp files:', err);
  });
  exec('del /q /f /s C:\\Windows\\Temp\\*.*', (err, stdout, stderr) => {
    if (err) console.error('Error clearing Windows temp files:', err);
  });
}

// Miscellaneous Tweaks 4 - Disable unnecessary startup services
function disableStartupServices() {
  const services = [
    'SysMain', 'OneDrive', 'Skype', 'WMPNetworkSvc'
  ];

  services.forEach(service => {
    exec(`sc stop ${service}`, (err, stdout, stderr) => {
      if (err) console.error(`Error stopping service ${service}:`, err);
    });
    exec(`sc config ${service} start= disabled`, (err, stdout, stderr) => {
      if (err) console.error(`Error disabling service ${service}:`, err);
    });
  });
}

// Miscellaneous Tweaks 5 - Disable Windows Update and Telemetry
function disableWindowsUpdateAndTelemetry() {
  exec('sc stop wuauserv', (err, stdout, stderr) => {
    if (err) console.error('Error stopping Windows Update service:', err);
  });
  exec('sc config wuauserv start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Windows Update service:', err);
  });

  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v "AllowTelemetry" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling telemetry:', err);
  });
}
// System Tweaks 1 - Disable unnecessary services
function disableUnnecessaryServices() {
  const services = [
    'SysMain', 'WMPNetworkSvc', 'WerSvc', 'Diagnosticshub', 'MicrosoftEdge', 'OneDrive'
  ];

  services.forEach(service => {
    exec(`sc stop ${service}`, (err, stdout, stderr) => {
      if (err) console.error(`Error stopping service ${service}:`, err);
    });
    exec(`sc config ${service} start= disabled`, (err, stdout, stderr) => {
      if (err) console.error(`Error disabling service ${service}:`, err);
    });
  });
}

// System Tweaks 2 - Clear temp and prefetch files
function cleanTempFiles() {
  exec('RD /S /Q %temp%', (err, stdout, stderr) => {
    if (err) console.error('Error cleaning temp files:', err);
  });
  exec('RD /S /Q C:\\Windows\\Temp', (err, stdout, stderr) => {
    if (err) console.error('Error cleaning Windows temp files:', err);
  });
  exec('del /f /q C:\\Windows\\Prefetch\\*', (err, stdout, stderr) => {
    if (err) console.error('Error cleaning prefetch files:', err);
  });
}

// Power Plan Tweaks 1 - Apply Ultimate Performance Plan
function applyUltimatePowerPlan() {
  exec('powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 95533644-e700-4a79-a56c-a89e8cb109d9', (err, stdout, stderr) => {
    if (err) console.error(`Error applying Ultimate Performance Power Plan: ${err}`);
  });
  exec('powercfg -setactive 95533644-e700-4a79-a56c-a89e8cb109d9', (err, stdout, stderr) => {
    if (err) console.error(`Error setting Ultimate Performance Power Plan active: ${err}`);
    else console.log("Ultimate Performance Power Plan applied successfully");
  });
}

// Power Plan Tweaks 2 - Optimize CPU performance for better gaming
function optimizeCpuPerformance() {
  exec('bcdedit /set processorcores 8', (err, stdout, stderr) => {
    if (err) console.error(`Error optimizing CPU performance: ${err}`);
    else console.log("CPU optimizations applied successfully");
  });
}
// Final Tweaks - Remove unnecessary apps and cleanup system
function removeUnwantedApps() {
  exec('powershell "Get-AppxPackage *Xbox* | Remove-AppxPackage"', (err, stdout, stderr) => {
    if (err) console.error('Error removing Xbox app:', err);
  });
  exec('powershell "Get-AppxPackage *OneDrive* | Remove-AppxPackage"', (err, stdout, stderr) => {
    if (err) console.error('Error removing OneDrive app:', err);
  });
  exec('powershell "Get-AppxPackage *Skype* | Remove-AppxPackage"', (err, stdout, stderr) => {
    if (err) console.error('Error removing Skype app:', err);
  });
}

// Final Tweaks - Clean system cache and files
function cleanSystemTempFiles() {
  exec('RD /S /Q %temp%', (err, stdout, stderr) => {
    if (err) console.error('Error clearing temp files:', err);
  });
  exec('RD /S /Q C:\\Windows\\Temp', (err, stdout, stderr) => {
    if (err) console.error('Error cleaning Windows temp files:', err);
  });
  exec('del /f /q C:\\Windows\\Prefetch\\*', (err, stdout, stderr) => {
    if (err) console.error('Error cleaning prefetch files:', err);
  });
}


// Boosted Plan Tweaks (Advanced Tab)
function applyBoostedPlanTweaks() {
  // Enable Windows Script Host
  exec('reg add "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows Script Host\\Settings" /v "Enabled" /t REG_DWORD /d "1" /f', (err, stdout, stderr) => {
    if (err) console.error('Error enabling Windows Script Host:', err);
  });

  // Disable SysMain and Superfetch
  exec('net stop wuauserv', (err, stdout, stderr) => {
    if (err) console.error('Error stopping wuauserv:', err);
  });
  exec('sc config "wuauserv" start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling wuauserv:', err);
  });
  exec('net stop SysMain', (err, stdout, stderr) => {
    if (err) console.error('Error stopping SysMain:', err);
  });
  exec('sc config "Sysmain" start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling SysMain:', err);
  });

  // Apply Ultimate Performance Power Plan
  exec('powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 11111111-1111-1111-1111-111111111111', (err, stdout, stderr) => {
    if (err) console.error('Error applying boosted power plan:', err);
  });

  // Set Active Power Plan to Ultimate Performance
  exec('powercfg -setactive 11111111-1111-1111-1111-111111111111', (err, stdout, stderr) => {
    if (err) console.error('Error setting active power plan:', err);
  });
}

// Apply Power Configuration Tweaks (for maximizing performance)
function applyCpuPowerOptimizations() {
  // Adjust CPU power settings
  exec('bcdedit /set IncreaseUserVa 4000', (err, stdout, stderr) => {
    if (err) console.error('Error adjusting CPU power:', err);
  });
  exec('powercfg -setacvalueindex 11111111-1111-1111-1111-111111111111 238c9fa8-0aad-41ed-83f4-97be242c8f20 29f6c1db-86da-48c5-9fdb-f2b67b1f44da 0', (err, stdout, stderr) => {
    if (err) console.error('Error applying CPU power optimizations:', err);
  });
}
// Network Tweaks (Advanced Tab)
function applyAdvancedNetworkTweaks() {
  exec('netsh int ip reset', (err, stdout, stderr) => {
    if (err) console.error('Error resetting network settings:', err);
  });

  exec('netsh int tcp reset', (err, stdout, stderr) => {
    if (err) console.error('Error resetting TCP settings:', err);
  });

  exec('netsh winsock reset', (err, stdout, stderr) => {
    if (err) console.error('Error resetting Winsock:', err);
  });

  // Enable/Disable IPv6 settings for improved network performance
  exec('netsh interface ipv6 set teredo disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Teredo:', err);
  });
  exec('netsh int tcp set global autotuninglevel=normal', (err, stdout, stderr) => {
    if (err) console.error('Error setting TCP autotuning:', err);
  });
  exec('netsh int tcp set global ecncapability=enabled', (err, stdout, stderr) => {
    if (err) console.error('Error enabling ECN capability:', err);
  });
}
// Disable Telemetry (Advanced Tab)
function disableTelemetryTweaks() {
  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v "AllowTelemetry" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling telemetry:', err);
  });

  exec('sc config dmwappushservice start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling dmwappushservice:', err);
  });

  exec('sc config diagnosticshub.standardcollector.service start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling diagnosticshub:', err);
  });

  exec('sc config DiagTrack start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling DiagTrack:', err);
  });
}
// Security Tweaks (Advanced Tab)
function applySecurityOptimizations() {
  // Disable Windows Defender and related services
  exec('sc stop "WinDefend"', (err, stdout, stderr) => {
    if (err) console.error('Error stopping Windows Defender:', err);
  });
  exec('sc config "WinDefend" start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Windows Defender service:', err);
  });

  // Disable unnecessary services like SysMain, Superfetch
  exec('sc config "SysMain" start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling SysMain:', err);
  });

  // Disable SMB1 for security purposes
  exec('powershell -Command "Disable-WindowsOptionalFeature -Online -FeatureName \'SMB1Protocol\' -NoRestart"', (err, stdout, stderr) => {
    if (err) console.error('Error disabling SMB1:', err);
  });
}



// Boosted Plan Tweaks (Advanced Tab)
function applyBoostedPlanTweaks() {
  // Enable Windows Script Host
  exec('reg add "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows Script Host\\Settings" /v "Enabled" /t REG_DWORD /d "1" /f', (err, stdout, stderr) => {
    if (err) console.error('Error enabling Windows Script Host:', err);
  });

  // Disable SysMain and Superfetch
  exec('net stop wuauserv', (err, stdout, stderr) => {
    if (err) console.error('Error stopping wuauserv:', err);
  });
  exec('sc config "wuauserv" start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling wuauserv:', err);
  });
  exec('net stop SysMain', (err, stdout, stderr) => {
    if (err) console.error('Error stopping SysMain:', err);
  });
  exec('sc config "Sysmain" start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling SysMain:', err);
  });

  // Apply Ultimate Performance Power Plan
  exec('powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 11111111-1111-1111-1111-111111111111', (err, stdout, stderr) => {
    if (err) console.error('Error applying boosted power plan:', err);
  });

  // Set Active Power Plan to Ultimate Performance
  exec('powercfg -setactive 11111111-1111-1111-1111-111111111111', (err, stdout, stderr) => {
    if (err) console.error('Error setting active power plan:', err);
  });
}

// Apply Power Configuration Tweaks (for maximizing performance)
function applyCpuPowerOptimizations() {
  // Adjust CPU power settings
  exec('bcdedit /set IncreaseUserVa 4000', (err, stdout, stderr) => {
    if (err) console.error('Error adjusting CPU power:', err);
  });
  exec('powercfg -setacvalueindex 11111111-1111-1111-1111-111111111111 238c9fa8-0aad-41ed-83f4-97be242c8f20 29f6c1db-86da-48c5-9fdb-f2b67b1f44da 0', (err, stdout, stderr) => {
    if (err) console.error('Error applying CPU power optimizations:', err);
  });
}

// Network Tweaks (Advanced Tab)
function applyAdvancedNetworkTweaks() {
  exec('netsh int ip reset', (err, stdout, stderr) => {
    if (err) console.error('Error resetting network settings:', err);
  });

  exec('netsh int tcp reset', (err, stdout, stderr) => {
    if (err) console.error('Error resetting TCP settings:', err);
  });

  exec('netsh winsock reset', (err, stdout, stderr) => {
    if (err) console.error('Error resetting Winsock:', err);
  });

  // Enable/Disable IPv6 settings for improved network performance
  exec('netsh interface ipv6 set teredo disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Teredo:', err);
  });
  exec('netsh int tcp set global autotuninglevel=normal', (err, stdout, stderr) => {
    if (err) console.error('Error setting TCP autotuning:', err);
  });
  exec('netsh int tcp set global ecncapability=enabled', (err, stdout, stderr) => {
    if (err) console.error('Error enabling ECN capability:', err);
  });
}
// Disable Telemetry (Advanced Tab)
function disableTelemetryTweaks() {
  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v "AllowTelemetry" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling telemetry:', err);
  });

  exec('sc config dmwappushservice start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling dmwappushservice:', err);
  });

  exec('sc config diagnosticshub.standardcollector.service start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling diagnosticshub:', err);
  });

  exec('sc config DiagTrack start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling DiagTrack:', err);
  });
}
// Security Tweaks (Advanced Tab)
function applySecurityOptimizations() {
  // Disable Windows Defender and related services
  exec('sc stop "WinDefend"', (err, stdout, stderr) => {
    if (err) console.error('Error stopping Windows Defender:', err);
  });
  exec('sc config "WinDefend" start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Windows Defender service:', err);
  });

  // Disable unnecessary services like SysMain, Superfetch
  exec('sc config "SysMain" start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling SysMain:', err);
  });

  // Disable SMB1 for security purposes
  exec('powershell -Command "Disable-WindowsOptionalFeature -Online -FeatureName \'SMB1Protocol\' -NoRestart"', (err, stdout, stderr) => {
    if (err) console.error('Error disabling SMB1:', err);
  });
}
// Visual Tweaks (Advanced Tab)
function applyVisualTweaks() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "ShowStatusBar" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error enabling status bar:', err);
  });

  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "DisableShaking" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Aero Shake:', err);
  });

  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "TaskbarGlomLevel" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error setting Taskbar Glom Level:', err);
  });

  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "MenuShowDelay" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error removing Menu Show Delay:', err);
  });
}
// Gaming Performance Optimizations (Advanced Tab)
function applyGamingTweaks() {
  // Disable Xbox Game Bar and related services
  exec('sc config xbgm start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Xbox Game Bar:', err);
  });
  exec('sc config XblAuthManager start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling XblAuthManager:', err);
  });
  exec('sc config XblGameSave start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling XblGameSave:', err);
  });

  // Disable Game DVR and Game Mode
  exec('reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\GameDVR" /v "AppCaptureEnabled" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Game DVR:', err);
  });
}

// FPS Tweaks 1 - Disable High Definition Audio
function disableHighDefinitionAudio() {
  exec('sc stop "hdaudio" && sc config "hdaudio" start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling High Definition Audio:', err);
  });
}

// FPS Tweaks 2 - Set CPU to high performance
function setCpuToHighPerformance() {
  exec('bcdedit /set disabledynamictick yes', (err, stdout, stderr) => {
    if (err) console.error('Error setting CPU to high performance:', err);
  });
}

// FPS Tweaks 3 - Disable audio enhancements
function disableAudioEnhancements() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Multimedia\\SystemProfile" /v "AudioEnhancementMode" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling audio enhancements:', err);
  });
}

// FPS Tweaks 4 - Disable Windows 10 sleep mode (for performance)
function disableSleepMode() {
  exec('powercfg -change standby-timeout-ac 0', (err, stdout, stderr) => {
    if (err) console.error('Error disabling sleep mode:', err);
  });
}

// FPS Tweaks 5 - Set power plan to maximum performance
function setPowerPlanMaxPerformance() {
  exec('powercfg -setactive SCHEME_MIN', (err, stdout, stderr) => {
    if (err) console.error('Error setting power plan to maximum performance:', err);
  });
}
// Visual Tweaks 1 - Enable transparency effects for a more dynamic interface
function enableTransparency() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v "EnableTransparency" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error enabling transparency:', err);
  });
}

// Visual Tweaks 2 - Disable thumbnail previews for file explorer
function disableThumbnailPreviews() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "IconsOnly" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling thumbnail previews:', err);
  });
}

// Visual Tweaks 3 - Show full file extensions in File Explorer
function showFileExtensions() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "HideFileExt" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error showing file extensions:', err);
  });
}

// Visual Tweaks 4 - Disable taskbar grouping (keep taskbar icons separate)
function disableTaskbarGrouping() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "TaskbarGlomLevel" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling taskbar grouping:', err);
  });
}

// Visual Tweaks 5 - Change taskbar icon size
function changeTaskbarIconSize() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "TaskbarSmallIcons" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error changing taskbar icon size:', err);
  });
}


// Privacy Tweaks 40 - Disable Cortana completely (advanced)
function disableCortanaCompletely() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Search" /v "CortanaEnabled" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Cortana:', err);
  });
  exec('powershell -Command "Get-AppxPackage *Microsoft.Cortana* | Remove-AppxPackage"', (err, stdout, stderr) => {
    if (err) console.error('Error removing Cortana app:', err);
  });
}

// Privacy Tweaks 41 - Disable Windows Ink Workspace
function disableWindowsInk() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\PenWorkspace" /v "PenWorkspaceButtonDesiredVisibility" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Windows Ink Workspace:', err);
  });
}

// Privacy Tweaks 42 - Disable Windows Feedback
function disableWindowsFeedback() {
  exec('reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Feedback" /v "EnableFeedback" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling feedback:', err);
  });
}

// Privacy Tweaks 43 - Disable Windows error reporting
function disableErrorReporting() {
  exec('sc config WerSvc start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling error reporting service:', err);
  });
  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\ErrorReporting" /v "DoReport" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling error reporting:', err);
  });
}

// Privacy Tweaks 44 - Disable automatic error reporting for Microsoft apps
function disableAppErrorReporting() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\AppHost" /v "EnableWebContentEvaluation" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling app error reporting:', err);
  });
}
// Network Tweaks 40 - Disable Windows Background Intelligent Transfer Service (BITS)
function disableBITS() {
  exec('sc stop "BITS"', (err, stdout, stderr) => {
    if (err) console.error('Error stopping BITS service:', err);
  });
  exec('sc config "BITS" start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling BITS service:', err);
  });
}

// Network Tweaks 41 - Set DNS to Google DNS (8.8.8.8 and 8.8.4.4)
function setGoogleDNS() {
  exec('netsh interface ipv4 set dns name="Ethernet" static 8.8.8.8', (err, stdout, stderr) => {
    if (err) console.error('Error setting Google DNS (IPv4):', err);
  });
  exec('netsh interface ipv6 set dns name="Ethernet" static 2001:4860:4860::8888', (err, stdout, stderr) => {
    if (err) console.error('Error setting Google DNS (IPv6):', err);
  });
}

// Network Tweaks 42 - Enable Jumbo Frame
function enableJumboFrame() {
  exec('netsh interface ipv4 set subinterface "Ethernet" mtu=9000 store=persistent', (err, stdout, stderr) => {
    if (err) console.error('Error enabling Jumbo Frame:', err);
  });
  exec('netsh interface ipv6 set subinterface "Ethernet" mtu=9000 store=persistent', (err, stdout, stderr) => {
    if (err) console.error('Error enabling Jumbo Frame:', err);
  });
}

// Network Tweaks 43 - Disable IPv6 (for better network performance)
function disableIPv6Completely() {
  exec('netsh interface ipv6 set teredo disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling IPv6:', err);
  });
  exec('netsh interface ipv6 set state disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling IPv6 state:', err);
  });
}

// Network Tweaks 44 - Reset TCP/IP stack
function resetTcpIpStack() {
  exec('netsh int ip reset', (err, stdout, stderr) => {
    if (err) console.error('Error resetting TCP/IP stack:', err);
  });
}
// Power Plan Tweaks 40 - Set power plan to maximum performance (disable power saving)
function setMaxPerformancePowerPlan() {
  exec('powercfg -setactive SCHEME_MAX', (err, stdout, stderr) => {
    if (err) console.error('Error setting maximum performance power plan:', err);
  });
}

// Power Plan Tweaks 41 - Disable Hybrid Sleep
function disableHybridSleep() {
  exec('reg add "HKCU\\Control Panel\\PowerCfg" /v "HibernateEnabled" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Hybrid Sleep:', err);
  });
}

// Power Plan Tweaks 42 - Disable system cooling (increase CPU performance)
function disableSystemCooling() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "TaskbarSmallIcons" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling system cooling policy:', err);
  });
}

// Power Plan Tweaks 43 - Set high-performance graphics settings
function setHighPerformanceGraphics() {
  exec('powercfg -setacvalueindex 381b4222-f694-41f0-9685-ff5bb260df2e 5fb4938d-1ee8-4b0f-9a3c-5036b0ab995c dd848b2a-8a5d-4451-9ae2-39cd41658f6c 2', (err, stdout, stderr) => {
    if (err) console.error('Error setting high-performance graphics:', err);
  });
}

// Power Plan Tweaks 44 - Disable sleep mode (keep the system awake)
function disableSleepMode() {
  exec('powercfg -change standby-timeout-ac 0', (err, stdout, stderr) => {
    if (err) console.error('Error disabling sleep mode:', err);
  });
  exec('powercfg -change standby-timeout-dc 0', (err, stdout, stderr) => {
    if (err) console.error('Error disabling sleep mode for battery:', err);
  });
}

// Power Plan Tweaks 45 - Disable PCIe Link State Power Management
function disablePCIePowerManagement() {
  exec('reg add "HKCU\\Control Panel\\PowerCfg" /v "DisableLinkStatePowerManagement" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling PCIe Link State Power Management:', err);
  });
}
// FPS Tweaks 51 - Enable High Performance Power Plan
function enableHighPerformancePowerPlan() {
  exec('powercfg -setactive SCHEME_HIGH', (err, stdout, stderr) => {
    if (err) console.error('Error enabling High Performance Power Plan:', err);
  });
}

// FPS Tweaks 52 - Disable Windows Search Indexing
function disableSearchIndexing() {
  exec('sc stop "WSearch"', (err, stdout, stderr) => {
    if (err) console.error('Error stopping Windows Search service:', err);
  });
  exec('sc config "WSearch" start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Windows Search service:', err);
  });
}

// FPS Tweaks 53 - Adjust Processor Scheduling for Best Performance of Programs
function adjustProcessorScheduling() {
  exec('reg add "HKCU\\Control Panel\\Desktop" /v "ProcessorScheduling" /t REG_DWORD /d 2 /f', (err, stdout, stderr) => {
    if (err) console.error('Error adjusting processor scheduling:', err);
  });
}

// FPS Tweaks 54 - Disable Windows Defender Real-Time Protection
function disableDefenderRealTimeProtection() {
  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender" /v "DisableRealtimeMonitoring" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Windows Defender Real-Time Protection:', err);
  });
}

// FPS Tweaks 55 - Set CPU Priority Class to High
function setCpuPriorityHigh() {
  exec('bcdedit /set {current} priority 8', (err, stdout, stderr) => {
    if (err) console.error('Error setting CPU priority to high:', err);
  });
}
// Visual Tweaks 11 - Enable Transparency Effects
function enableTransparencyEffects() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v "EnableTransparency" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error enabling transparency effects:', err);
  });
}

// Visual Tweaks 12 - Show File Extensions for Known File Types
function showFileExtensions() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "HideFileExt" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error showing file extensions:', err);
  });
}

// Visual Tweaks 13 - Disable Aero Snap Feature
function disableAeroSnap() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "DisableAeroSnap" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Aero Snap:', err);
  });
}

// Visual Tweaks 14 - Set Taskbar Transparency
function setTaskbarTransparency() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "TaskbarTransparency" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error setting taskbar transparency:', err);
  });
}

// Visual Tweaks 15 - Change Window Border Width
function changeWindowBorderWidth() {
  exec('reg add "HKCU\\Control Panel\\Desktop" /v "BorderWidth" /t REG_SZ /d "-15" /f', (err, stdout, stderr) => {
    if (err) console.error('Error changing window border width:', err);
  });
}
// Privacy Tweaks 45 - Disable Windows Error Reporting
function disableErrorReporting() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\Windows Error Reporting" /v "DontShowUI" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling error reporting:', err);
  });
}

// Privacy Tweaks 46 - Prevent Microsoft from Sending Error Reports
function preventErrorReports() {
  exec('reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v "DontShowErrorReporting" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error preventing error reports:', err);
  });
}

// Privacy Tweaks 47 - Disable Windows Defender
function disableWindowsDefender() {
  exec('sc stop "WinDefend"', (err, stdout, stderr) => {
    if (err) console.error('Error stopping Windows Defender service:', err);
  });
  exec('sc config "WinDefend" start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Windows Defender service:', err);
  });
}

// Privacy Tweaks 48 - Disable Windows Store Auto-Updates
function disableStoreAutoUpdates() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Appx" /v "PackageInstallAndUpdateBehavior" /t REG_DWORD /d 2 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Windows Store auto-updates:', err);
  });
}

// Privacy Tweaks 49 - Disable Windows Insider Program Updates
function disableInsiderProgramUpdates() {
  exec('reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v "AllowInsider" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Windows Insider Program updates:', err);
  });
}
// FPS Tweaks 56 - Enable High Performance Power Plan
function enableHighPerformancePowerPlan() {
  exec('powercfg -setactive SCHEME_HIGH', (err, stdout, stderr) => {
    if (err) console.error('Error enabling High Performance Power Plan:', err);
  });
}

// FPS Tweaks 57 - Disable Windows Search Indexing
function disableSearchIndexing() {
  exec('sc stop "WSearch"', (err, stdout, stderr) => {
    if (err) console.error('Error stopping Windows Search service:', err);
  });
  exec('sc config "WSearch" start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Windows Search service:', err);
  });
}

// FPS Tweaks 58 - Adjust Processor Scheduling for Best Performance of Programs
function adjustProcessorScheduling() {
  exec('reg add "HKCU\\Control Panel\\Desktop" /v "ProcessorScheduling" /t REG_DWORD /d 2 /f', (err, stdout, stderr) => {
    if (err) console.error('Error adjusting processor scheduling:', err);
  });
}

// FPS Tweaks 59 - Disable Windows Defender Real-Time Protection
function disableDefenderRealTimeProtection() {
  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender" /v "DisableRealtimeMonitoring" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Windows Defender Real-Time Protection:', err);
  });
}

// FPS Tweaks 60 - Set CPU Priority Class to High
function setCpuPriorityHigh() {
  exec('bcdedit /set {current} priority 8', (err, stdout, stderr) => {
    if (err) console.error('Error setting CPU priority to high:', err);
  });
}
// Visual Tweaks 14 - Enable Transparency Effects
function enableTransparencyEffects() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v "EnableTransparency" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error enabling transparency effects:', err);
  });
}

// Visual Tweaks 15 - Show File Extensions for Known File Types
function showFileExtensions() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "HideFileExt" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error showing file extensions:', err);
  });
}

// Visual Tweaks 16 - Disable Aero Snap Feature
function disableAeroSnap() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "DisableAeroSnap" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Aero Snap:', err);
  });
}

// Visual Tweaks 17 - Enable Dark Mode for Windows Apps
function enableDarkMode() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v "AppsUseLightTheme" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error enabling dark mode for apps:', err);
  });
}

// Visual Tweaks 18 - Show Seconds in Taskbar Clock
function showSecondsInTaskbarClock() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "ShowSecondsInSystemClock" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error showing seconds in taskbar clock:', err);
  });
}
// FPS Tweaks 56 - Disable Low Priority I/O Tasks
function disableLowPriorityIO() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "LowPriorityIO" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling low priority I/O tasks:', err);
  });
}

// FPS Tweaks 57 - Set CPU affinity for optimized gaming
function setCpuAffinity() {
  exec('bcdedit /set {current} affinity 0x01', (err, stdout, stderr) => {
    if (err) console.error('Error setting CPU affinity for gaming:', err);
  });
}

// FPS Tweaks 58 - Disable prefetch for non-critical applications
function disablePrefetchForNonCritical() {
  exec('reg add "HKLM\\System\\CurrentControlSet\\Control\\Session Manager\\Memory Management\\PrefetchParameters" /v "EnablePrefetcher" /t REG_DWORD /d 2 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling prefetch for non-critical apps:', err);
  });
}

// FPS Tweaks 59 - Disable Hibernation to save disk space and improve performance
function disableHibernation() {
  exec('powercfg -hibernate off', (err, stdout, stderr) => {
    if (err) console.error('Error disabling hibernation:', err);
  });
}

// FPS Tweaks 60 - Adjust Virtual Memory/Pagefile settings for performance
function adjustVirtualMemory() {
  exec('wmic computersystem where name="%computername%" set AutomaticManagedPagefile=False', (err, stdout, stderr) => {
    if (err) console.error('Error adjusting virtual memory settings:', err);
  });
  exec('wmic pagefileset where name="%SystemDrive%\\pagefile.sys" set InitialSize=2048,MaximumSize=8192', (err, stdout, stderr) => {
    if (err) console.error('Error adjusting pagefile size:', err);
  });
}
// Visual Tweaks 11 - Set taskbar to automatically hide
function setAutoHideTaskbar() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "TaskbarAutoHide" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error setting taskbar to auto-hide:', err);
  });
}

// Visual Tweaks 12 - Remove Cortana from Taskbar
function removeCortanaFromTaskbar() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "ShowCortanaButton" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error removing Cortana from taskbar:', err);
  });
}

// Visual Tweaks 13 - Change system font to Segoe UI (from default font)
function changeSystemFont() {
  exec('reg add "HKCU\\Control Panel\\Desktop" /v "FontSmoothing" /t REG_DWORD /d 2 /f', (err, stdout, stderr) => {
    if (err) console.error('Error changing system font:', err);
  });
}

// Visual Tweaks 14 - Disable animations in File Explorer
function disableFileExplorerAnimations() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "Animations" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling animations in File Explorer:', err);
  });
}

// Visual Tweaks 15 - Enable Dark Mode for File Explorer
function enableDarkModeExplorer() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v "AppsUseLightTheme" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error enabling dark mode in File Explorer:', err);
  });
}
// Privacy Tweaks 45 - Disable Windows 10 Cortana data collection
function disableCortanaDataCollection() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Search" /v "AllowCortana" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Cortana data collection:', err);
  });
}

// Privacy Tweaks 46 - Disable Windows Update Delivery Optimization
function disableWindowsUpdateOptimization() {
  exec('reg add "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\DeliveryOptimization\\Config" /v "DODownloadMode" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Delivery Optimization:', err);
  });
}

// Privacy Tweaks 47 - Disable User Account Control (UAC)
function disableUAC() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v "EnableLUA" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling UAC:', err);
  });
}

// Privacy Tweaks 48 - Disable automatic sending of feedback to Microsoft
function disableMicrosoftFeedback() {
  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent" /v "FeedbackEnabled" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Microsoft Feedback:', err);
  });
}

// Privacy Tweaks 49 - Turn off Location Services
function turnOffLocationServices() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Geolocation" /v "Enabled" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error turning off location services:', err);
  });
}
// FPS Tweaks 61 - Disable Core Parking for Performance Boost
function disableCoreParking() {
  exec('reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Power\\PowerSettings\\54533251-82be-4824-96c1-47b60b740d00\\0cc5b647-c1df-4637-891a-dec35c318583" /v "ValueMax" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling core parking:', err);
  });
}

// FPS Tweaks 62 - Disable Dynamic Tick for Faster Performance
function disableDynamicTick() {
  exec('bcdedit /set disabledynamictick yes', (err, stdout, stderr) => {
    if (err) console.error('Error disabling dynamic tick:', err);
  });
}

// FPS Tweaks 63 - Set Maximum Processor State to 100%
function setMaxProcessorState() {
  exec('powercfg /setacvalueindex SCHEME_MAX SUB_PROCESSOR PROCTHROTTLEMAX 100', (err, stdout, stderr) => {
    if (err) console.error('Error setting max processor state:', err);
  });
}

// FPS Tweaks 64 - Disable Memory Compression (Windows 10/11)
function disableMemoryCompression() {
  exec('powershell "Disable-MMAgent -MemoryCompression"', (err, stdout, stderr) => {
    if (err) console.error('Error disabling memory compression:', err);
  });
}

// FPS Tweaks 65 - Adjust CPU Thread Priority for High Performance
function setCpuThreadPriority() {
  exec('bcdedit /set numprocthreads 16', (err, stdout, stderr) => {
    if (err) console.error('Error adjusting CPU thread priority:', err);
  });
}
// Visual Tweaks 16 - Enable Dark Mode for System
function enableDarkMode() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v "AppsUseLightTheme" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error enabling Dark Mode:', err);
  });
}

// Visual Tweaks 17 - Disable Transparency Effects
function disableTransparency() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v "EnableTransparency" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling transparency:', err);
  });
}

// Visual Tweaks 18 - Show Taskbar in Small Icons Mode
function setSmallTaskbarIcons() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "TaskbarSmallIcons" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error setting small taskbar icons:', err);
  });
}

// Visual Tweaks 19 - Disable Taskbar Glomming (grouping taskbar icons)
function disableTaskbarGrouping() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "TaskbarGlomLevel" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling taskbar grouping:', err);
  });
}

// Visual Tweaks 20 - Enable Classic Context Menu for File Explorer
function enableClassicContextMenu() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "ExtendedUIHoverTime" /t REG_DWORD /d 100 /f', (err, stdout, stderr) => {
    if (err) console.error('Error enabling classic context menu:', err);
  });
}

// Privacy Tweaks 50 - Disable Windows Consumer Features (reduce privacy data sharing)
function disableConsumerFeatures() {
  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent" /v "DisableWindowsConsumerFeatures" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling consumer features:', err);
  });
}

// Privacy Tweaks 51 - Disable Windows Insider Program Data Collection
function disableInsiderDataCollection() {
  exec('reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection" /v "AllowTelemetry" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Insider Data Collection:', err);
  });
}

// Privacy Tweaks 52 - Disable Cloud-Based App Data Collection
function disableCloudAppDataCollection() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager" /v "ContentDeliveryAllowed" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling cloud app data collection:', err);
  });
}

// Privacy Tweaks 53 - Disable All Telemetry Features
function disableAllTelemetry() {
  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v "AllowTelemetry" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling all telemetry:', err);
  });
}

// Privacy Tweaks 54 - Disable Windows Error Reporting
function disableErrorReportingService() {
  exec('sc stop WerSvc', (err, stdout, stderr) => {
    if (err) console.error('Error stopping Windows Error Reporting service:', err);
  });
  exec('sc config WerSvc start= disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Windows Error Reporting service:', err);
  });
}
// FPS Tweaks 66 - Disable background services for gaming
function disableBackgroundServices() {
  exec('sc stop "SysMain"', (err, stdout, stderr) => {
    if (err) console.error('Error disabling SysMain:', err);
  });
  exec('sc stop "wuauserv"', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Windows Update:', err);
  });
  exec('sc stop "WerSvc"', (err, stdout, stderr) => {
    if (err) console.error('Error disabling WerSvc:', err);
  });
}

// FPS Tweaks 67 - Enable CPU performance mode for high loads
function enableCpuPerformanceMode() {
  exec('bcdedit /set {current} priority 8', (err, stdout, stderr) => {
    if (err) console.error('Error setting CPU performance mode:', err);
  });
}
// Visual Tweaks 21 - Disable Taskbar Transparency
function disableTaskbarTransparency() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v "EnableTransparency" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling taskbar transparency:', err);
  });
}

// Visual Tweaks 22 - Enable Aero Glass effects
function enableAeroGlass() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\DWM" /v "AeroGlass" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error enabling Aero Glass:', err);
  });
}
// Privacy Tweaks 55 - Disable Telemetry and Data Collection
function disableTelemetryAndDataCollection() {
  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v "AllowTelemetry" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling telemetry and data collection:', err);
  });
}

// Privacy Tweaks 56 - Disable Windows Defender Cloud Protection
function disableDefenderCloudProtection() {
  exec('reg add "HKLM\\SOFTWARE\\Microsoft\\Windows Defender\\Spynet" /v "SpyNetReporting" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling cloud protection in Defender:', err);
  });
}
// Network Tweaks 16 - Set MTU for faster internet speeds
function setMTUForInternet() {
  exec('netsh interface ipv4 set subinterface "Ethernet" mtu=1500 store=persistent', (err, stdout, stderr) => {
    if (err) console.error('Error setting MTU for Ethernet:', err);
  });
  exec('netsh interface ipv6 set subinterface "Ethernet" mtu=1500 store=persistent', (err, stdout, stderr) => {
    if (err) console.error('Error setting MTU for IPv6:', err);
  });
}

// Network Tweaks 17 - Disable Teredo Tunneling (improves internet speed)
function disableTeredoTunneling() {
  exec('netsh interface ipv6 set teredo disabled', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Teredo tunneling:', err);
  });
}
// RAM Tweaks 1 - Optimize RAM for 4GB Systems
function optimizeFor4GB() {
  exec('bcdedit /set IncreaseUserVa 3072', (err, stdout, stderr) => {
    if (err) console.error('Error optimizing for 4GB RAM:', err);
  });
  exec('wmic memorychip set speed=1600', (err, stdout, stderr) => {
    if (err) console.error('Error optimizing RAM speed for 4GB:', err);
  });
}

// RAM Tweaks 2 - Optimize RAM for 8GB Systems
function optimizeFor8GB() {
  exec('bcdedit /set IncreaseUserVa 4096', (err, stdout, stderr) => {
    if (err) console.error('Error optimizing for 8GB RAM:', err);
  });
  exec('wmic memorychip set speed=2400', (err, stdout, stderr) => {
    if (err) console.error('Error optimizing RAM speed for 8GB:', err);
  });
}

// RAM Tweaks 3 - Optimize RAM for 16GB Systems
function optimizeFor16GB() {
  exec('bcdedit /set IncreaseUserVa 8192', (err, stdout, stderr) => {
    if (err) console.error('Error optimizing for 16GB RAM:', err);
  });
  exec('wmic memorychip set speed=2666', (err, stdout, stderr) => {
    if (err) console.error('Error optimizing RAM speed for 16GB:', err);
  });
}

// RAM Tweaks 4 - Optimize RAM for 32GB Systems
function optimizeFor32GB() {
  exec('bcdedit /set IncreaseUserVa 16384', (err, stdout, stderr) => {
    if (err) console.error('Error optimizing for 32GB RAM:', err);
  });
  exec('wmic memorychip set speed=2933', (err, stdout, stderr) => {
    if (err) console.error('Error optimizing RAM speed for 32GB:', err);
  });
}

// RAM Tweaks 5 - Disable RAM compression for better performance
function disableRamCompression() {
  exec('powershell "Disable-MMAgent -MemoryCompression"', (err, stdout, stderr) => {
    if (err) console.error('Error disabling RAM compression:', err);
  });
}
// Gaming Tweaks 1 - Disable unnecessary background apps during gaming
function disableBackgroundAppsForGaming() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\BackgroundAccessApplications" /v "LetAppsRunInBackground" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling background apps for gaming:', err);
  });
}

// Gaming Tweaks 2 - Optimize CPU cores for gaming
function optimizeCpuForGaming() {
  exec('bcdedit /set numprocthreads 8', (err, stdout, stderr) => {
    if (err) console.error('Error optimizing CPU cores for gaming:', err);
  });
}

// Gaming Tweaks 3 - Set game mode for better performance
function enableGameMode() {
  exec('reg add "HKCU\\Software\\Microsoft\\GameBar" /v "GameModeEnabled" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error enabling Game Mode:', err);
  });
}

// Gaming Tweaks 4 - Disable Game DVR for improved FPS
function disableGameDVRForPerformance() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR" /v "AppCaptureEnabled" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Game DVR:', err);
  });
}

// Gaming Tweaks 5 - Optimize disk performance for gaming
function optimizeDiskForGaming() {
  exec('reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "DisableDiskOptimization" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error optimizing disk for gaming:', err);
  });
}
// Privacy Tweaks 57 - Disable SmartScreen for enhanced privacy
function disableSmartScreen() {
  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\System" /v "EnableSmartScreen" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling SmartScreen:', err);
  });
}

// Privacy Tweaks 58 - Disable advertising ID tracking
function disableAdIdTracking() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\AdvertisingInfo" /v "Enabled" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling advertising ID tracking:', err);
  });
}

// Privacy Tweaks 59 - Disable Windows Data Collection
function disableWindowsDataCollection() {
  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v "AllowTelemetry" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling data collection:', err);
  });
}

// Privacy Tweaks 60 - Disable Windows Location Services
function disableLocationServices() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Geolocation" /v "Enabled" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling location services:', err);
  });
}
// FPS Tweaks 68 - Adjust CPU priority for gaming applications
function adjustCpuPriority() {
  exec('bcdedit /set {current} affinity 0x01', (err, stdout, stderr) => {
    if (err) console.error('Error adjusting CPU priority:', err);
  });
}

// FPS Tweaks 69 - Set system responsiveness to high for gaming
function setSystemResponsiveness() {
  exec('reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v "SystemResponsiveness" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error setting system responsiveness:', err);
  });
}

// FPS Tweaks 70 - Enable Multi-Threaded Performance
function enableMultiThreaded() {
  exec('bcdedit /set numproc 16', (err, stdout, stderr) => {
    if (err) console.error('Error enabling multi-threaded performance:', err);
  });
}
// Visual Tweaks 23 - Disable screen flicker from Windows animations
function disableScreenFlicker() {
  exec('reg add "HKCU\\Control Panel\\Desktop" /v "ScreenFlicker" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling screen flicker:', err);
  });
}

// Visual Tweaks 24 - Change mouse cursor speed for better gaming response
function changeMouseCursorSpeed() {
  exec('reg add "HKCU\\Control Panel\\Mouse" /v "MouseSpeed" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error changing mouse cursor speed:', err);
  });
}

// Visual Tweaks 25 - Disable Snap Assist for better window management
function disableSnapAssist() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "DisableSnap" /t REG_DWORD /d 1 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling Snap Assist:', err);
  });
}
// Privacy Tweaks 61 - Disable Windows 10 telemetry and data collection completely
function disableWindowsTelemetry() {
  exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v "AllowTelemetry" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling telemetry:', err);
  });
}

// Privacy Tweaks 62 - Prevent Cortana from collecting data
function preventCortanaDataCollection() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Search" /v "AllowCortana" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error preventing Cortana data collection:', err);
  });
}

// Privacy Tweaks 63 - Disable advertising ID and targeted ads
function disableAdvertisingId() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\AdvertisingInfo" /v "Enabled" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling advertising ID:', err);
  });
}
// FPS Tweaks 71 - Disable Prefetch for faster boot times
function disablePrefetch() {
  exec('reg add "HKLM\\System\\CurrentControlSet\\Control\\Session Manager\\Memory Management\\PrefetchParameters" /v "EnablePrefetcher" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling prefetch:', err);
  });
}

// FPS Tweaks 72 - Set CPU priority for high performance tasks
function setCpuPriorityForHighTasks() {
  exec('reg add "HKCU\\Control Panel\\Desktop" /v "ProcessorScheduling" /t REG_DWORD /d 2 /f', (err, stdout, stderr) => {
    if (err) console.error('Error setting CPU priority:', err);
  });
}
// Visual Tweaks 26 - Disable smooth scrolling in browsers
function disableSmoothScrolling() {
  exec('reg add "HKCU\\Control Panel\\Desktop" /v "SmoothScrolling" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling smooth scrolling:', err);
  });
}

// Visual Tweaks 27 - Enable extra menu delay for context menus
function enableMenuDelay() {
  exec('reg add "HKCU\\Control Panel\\Desktop" /v "MenuShowDelay" /t REG_DWORD /d 500 /f', (err, stdout, stderr) => {
    if (err) console.error('Error enabling menu delay:', err);
  });
}
// Visual Tweaks 26 - Disable smooth scrolling in browsers
function disableSmoothScrolling() {
  exec('reg add "HKCU\\Control Panel\\Desktop" /v "SmoothScrolling" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling smooth scrolling:', err);
  });
}

// Privacy Tweaks 64 - Disable automatic app updates for Store apps
function disableStoreAppUpdates() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Appx" /v "PackageInstallAndUpdateBehavior" /t REG_DWORD /d 2 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling automatic app updates:', err);
  });
}

// Privacy Tweaks 65 - Disable location tracking for apps
function disableLocationTracking() {
  exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Geolocation" /v "Enabled" /t REG_DWORD /d 0 /f', (err, stdout, stderr) => {
    if (err) console.error('Error disabling location tracking:', err);
  });
}


// Apply all final optimizations and settings
function applyFinalOptimizations() {
  disableUnwantedServices();
  removeWindowsBloatware();
  cleanSystemTempFiles();
  disableTelemetry();
  applyUltimatePowerPlan();
  installAndLaunchGames();  // Steam, Epic, Ubisoft, etc.
  console.log('Final tweaks and optimizations applied.');
}





function applyAllTweaks() {
  applyFpsTweaks();
  applyNetworkTweaks();
  applyVisualTweaks();
  applyPrivacyTweaks();
  applyGameLauncherTweaks();
  applyMiscTweaks();
}

// Add any other tweaks or additional functions as necessary

