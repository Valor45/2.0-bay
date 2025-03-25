/**
 * Main Renderer Process
 * Handles UI interactions and communication with the main process
 */

// Import our tweak manager module
const tweakManager = require('./src/js/tweaks/tweakManager');

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Renderer script loaded');
  
  // Set up navigation
  setupNavigation();
  
  // Initialize toggle event handlers
  tweakManager.initializeToggles();
  
  // Set up Tweak Tools buttons
  setupTweakTools();
  
  // Set up logout button
  document.getElementById('logoutButton')?.addEventListener('click', () => {
    window.location = 'index.html';
  });
});

/**
 * Setup navigation between sections
 */
function setupNavigation() {
  // Setup sidebar navigation
  document.querySelectorAll('.sidebar ul li').forEach(item => {
    item.addEventListener('click', function() {
      const targetSection = this.getAttribute('data-section');
      
      // Hide all sections
      document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
      });
      
      // Show the target section
      document.getElementById(`section-${targetSection}`)?.style.display = 'block';
      
      // Update active menu item
      document.querySelectorAll('.sidebar ul li').forEach(item => {
        item.classList.remove('active');
      });
      
      // Mark this item as active
      this.classList.add('active');
    });
  });

  // Setup login form (if exists)
  document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'admin' && password === 'password') {
      document.getElementById('loginPage').style.display = 'none';
      document.getElementById('dashboardPage').style.display = 'block';
    } else {
      alert('Invalid credentials! Please try again.');
    }
  });
  
  // Setup logout button (if exists)
  document.getElementById('logoutButton')?.addEventListener('click', function() {
    document.getElementById('dashboardPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
  });
  
  // Default to showing the dashboard section
  document.getElementById('section-dashboard').style.display = 'block';
}

/**
 * Setup event listeners for Tweak Tools buttons
 */
function setupTweakTools() {
  // Single restore point handler
  document.getElementById('mainRestoreBtn')?.addEventListener('click', () => {
    if (confirm('Create official system restore point?')) {
      ipcRenderer.send('execute-command', 'create-restore-point');
    }
  });

  // Config buttons
  document.getElementById('saveConfigToFile')?.addEventListener('click', () => {
    tweakManager.saveConfigToFile();
  });
  
  document.getElementById('loadConfigFromFile')?.addEventListener('click', () => {
    tweakManager.loadConfigFromFile();
  });
  
  // Reset Configuration button
  const resetConfigBtn = document.getElementById('resetConfigBtn');
  if (resetConfigBtn) {
    resetConfigBtn.addEventListener('click', async () => {
      if (confirm("Are you sure you want to reset all settings to default?")) {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
          checkbox.checked = false;
        });
        alert("All settings have been reset to default.");
      }
    });
  }
  
  // Quick Actions
  document.getElementById('optimizeNetworkBtn')?.addEventListener('click', () => {
    tweakManager.applyTweaksByCategory('network')
      .then(results => {
        alert(`Applied ${results.success.length} network tweaks successfully.\nFailed: ${results.failed.length}`);
      })
      .catch(error => {
        alert(`Failed to apply network tweaks: ${error}`);
      });
  });
  
  document.getElementById('optimizeGamingBtn')?.addEventListener('click', () => {
    tweakManager.applyTweaksByCategory('gaming')
      .then(results => {
        alert(`Applied ${results.success.length} gaming tweaks successfully.\nFailed: ${results.failed.length}`);
      })
      .catch(error => {
        alert(`Failed to apply gaming tweaks: ${error}`);
      });
  });
  
  document.getElementById('optimizePrivacyBtn')?.addEventListener('click', () => {
    tweakManager.applyTweaksByCategory('privacy')
      .then(results => {
        alert(`Applied ${results.success.length} privacy tweaks successfully.\nFailed: ${results.failed.length}`);
      })
      .catch(error => {
        alert(`Failed to apply privacy tweaks: ${error}`);
      });
  });
  
  // Unified benchmark handler
  document.body.addEventListener('click', async (event) => {
    if (event.target.closest('.benchmark-btn')) {
      const url = event.target.closest('.benchmark-btn').dataset.url;
      try {
        console.log('Attempting to open benchmark URL:', url);
        await electronAPI.openExternalLink(url);
        console.log('Successfully opened benchmark');
        document.getElementById('statusMessage').textContent = 'Opened benchmark tool in browser';
      } catch (error) {
        console.error('Benchmark error:', {
          error: error.message,
          stack: error.stack,
          url: url
        });
        document.getElementById('errorMessage').textContent = `Failed to open benchmark: ${error.message}`;
      }
    }
  });
}

/**
 * Setup event listeners for applying tweaks by category
 */
function setupCategoryButtons() {
  // FPS Tweaks
  document.getElementById('applyFpsTweaks')?.addEventListener('click', () => {
    tweakManager.applyTweaksByCategory('performance')
      .then(results => {
        alert(`Applied ${results.success.length} performance tweaks successfully.\nFailed: ${results.failed.length}`);
      })
      .catch(error => {
        alert(`Failed to apply performance tweaks: ${error}`);
      });
  });

  // Network Tweaks
  document.getElementById('applyNetTweaks')?.addEventListener('click', () => {
    tweakManager.applyTweaksByCategory('network')
      .then(results => {
        alert(`Applied ${results.success.length} network tweaks successfully.\nFailed: ${results.failed.length}`);
      })
      .catch(error => {
        alert(`Failed to apply network tweaks: ${error}`);
      });
  });

  // Visual Tweaks
  document.getElementById('applyVisualTweaks')?.addEventListener('click', () => {
    tweakManager.applyTweaksByCategory('visual')
      .then(results => {
        alert(`Applied ${results.success.length} visual tweaks successfully.\nFailed: ${results.failed.length}`);
      })
      .catch(error => {
        alert(`Failed to apply visual tweaks: ${error}`);
      });
  });

  // Privacy Tweaks
  document.getElementById('applyPrivacyTweaks')?.addEventListener('click', () => {
    tweakManager.applyTweaksByCategory('privacy')
      .then(results => {
        alert(`Applied ${results.success.length} privacy tweaks successfully.\nFailed: ${results.failed.length}`);
      })
      .catch(error => {
        alert(`Failed to apply privacy tweaks: ${error}`);
      });
  });

  // Misc Tweaks
  document.getElementById('applyMiscTweaks')?.addEventListener('click', () => {
    tweakManager.applyTweaksByCategory('misc')
      .then(results => {
        alert(`Applied ${results.success.length} misc tweaks successfully.\nFailed: ${results.failed.length}`);
      })
      .catch(error => {
        alert(`Failed to apply misc tweaks: ${error}`);
      });
  });

  // Power Plan
  document.getElementById('applyPowerPlan')?.addEventListener('click', () => {
    const plan = document.getElementById('powerPlanSelect')?.value;
    const ultimate = document.getElementById('toggle_ultimate_performance')?.checked;
    
    if (!plan && !ultimate) {
      alert("Please select a power plan or enable performance options!");
      return;
    }
    
    let applied = 0;
    
    if (plan) {
      tweakManager.applyTweak(`power_plan_${plan}`)
        .then(() => applied++)
        .catch(error => alert(`Failed to apply power plan: ${error}`));
    }
    
    if (ultimate) {
      tweakManager.applyTweak('ultimate_performance')
        .then(() => applied++)
        .catch(error => alert(`Failed to apply ultimate performance: ${error}`));
    }
  });
  
  // Create Restore Point
  document.getElementById('createRestorePoint')?.addEventListener('click', () => {
    tweakManager.createRestorePoint()
      .then(success => {
        if (success) {
          alert('Restore point created successfully!');
        } else {
          alert('Failed to create restore point.');
        }
      })
      .catch(error => {
        alert(`Failed to create restore point: ${error}`);
      });
  });
  
  // Run Benchmark
  document.getElementById('runBenchmark')?.addEventListener('click', () => {
    tweakManager.runBenchmark()
      .then(result => {
        alert(`Benchmark completed!\nScore: ${result.score}\nTime: ${result.time}ms`);
      })
      .catch(error => {
        alert(`Benchmark failed: ${error}`);
      });
  });
}

/**
 * Load system information
 */
function loadSystemInfo() {
  if (window.electronAPI && window.electronAPI.getSystemInfo) {
    window.electronAPI.getSystemInfo()
      .then(info => {
        // Display system information
        document.getElementById('cpu-info').textContent = info.cpu || 'Unknown';
        document.getElementById('gpu-info').textContent = info.gpu || 'Unknown';
        document.getElementById('ram-info').textContent = info.ram || 'Unknown';
        document.getElementById('os-info').textContent = info.os || 'Unknown';
      })
      .catch(error => {
        console.error('Failed to load system information:', error);
      });
  }
}

/**
 * Opens external links in the default browser
 * @param {Event} event - The click event
 */
function openExternalLink(event) {
  event.preventDefault();
  console.log('openExternalLink called', event.target);
  
  const url = event.target.href || event.target.getAttribute('href') || event.target.getAttribute('data-href');
  console.log('URL to open:', url);
  
  if (url) {
    console.log('Trying to open URL:', url);
    // Use the electronAPI exposed in preload.js
    if (window.electronAPI && window.electronAPI.openExternal) {
      console.log('Using electronAPI.openExternal');
      window.electronAPI.openExternal(url);
    } else {
      console.error('electronAPI.openExternal not available');
      // Fallback - try alternate methods
      alert('Please visit: ' + url);
    }
  } else {
    console.error('No URL found to open');
  }
}

// Export functionality if needed
window.tweakManager = tweakManager;
