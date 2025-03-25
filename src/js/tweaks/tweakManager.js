/**
 * Tweak Manager Module
 * Handles all tweak-related operations in a centralized way
 */

const tweakManager = {
  // Store loaded tweaks configuration
  tweaks: [],
  
  // Initialize the tweak manager
  init: async function() {
    if (window.electronAPI && window.electronAPI.getTweaks) {
      try {
        this.tweaks = await window.electronAPI.getTweaks();
        console.log(`Loaded ${this.tweaks.length} tweaks from configuration`);
        return this.tweaks;
      } catch (err) {
        console.error('Failed to load tweaks configuration:', err);
        return [];
      }
    }
    return [];
  },
  
  // Apply a single tweak by ID
  applyTweak: async function(tweakId) {
    if (!window.electronAPI || !window.electronAPI.applyTweak) {
      console.error('Electron API or applyTweak method not available');
      return Promise.reject('API not available');
    }
    
    try {
      const result = await window.electronAPI.applyTweak(tweakId);
      console.log(`Applied tweak ${tweakId}:`, result);
      
      // Provide visual feedback
      const toggleElement = document.getElementById(`toggle_${tweakId}`);
      if (toggleElement) {
        toggleElement.parentNode.classList.add('success');
        setTimeout(() => toggleElement.parentNode.classList.remove('success'), 1000);
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to apply tweak ${tweakId}:`, error);
      
      // Revert checkbox if it failed
      const toggleElement = document.getElementById(`toggle_${tweakId}`);
      if (toggleElement && toggleElement.checked) {
        toggleElement.checked = false;
      }
      
      return Promise.reject(error);
    }
  },
  
  // Apply all tweaks in a category
  applyTweaksByCategory: async function(category) {
    if (!window.electronAPI || !window.electronAPI.applyAllTweaks) {
      console.error('Electron API or applyAllTweaks method not available');
      return Promise.reject('API not available');
    }
    
    try {
      const results = await window.electronAPI.applyAllTweaks(category);
      console.log(`Applied ${results.success.length} ${category} tweaks successfully`);
      
      if (results.failed.length > 0) {
        console.error(`Failed to apply ${results.failed.length} tweaks:`, results.failed);
      }
      
      return results;
    } catch (error) {
      console.error(`Error applying ${category} tweaks:`, error);
      return Promise.reject(error);
    }
  },
  
  // Initialize event listeners for all toggles
  initializeToggles: function() {
    // Map toggle IDs to tweak IDs
    const toggleMap = {
      // Performance/FPS tweaks
      'toggle_disable_hpet': 'disable_hpet',
      'toggle_optimize_scheduler': 'optimize_scheduler',
      'toggle_input_delay': 'reduce_input_delay',
      'toggle_multi_threaded_performance': 'multi_threaded_performance',
      'toggle_disable_prefetch': 'disable_prefetch',
      'toggle_set_cpu_priority_for_high_tasks': 'set_cpu_priority',
      'toggle_disable_background_apps': 'disable_background_apps',
      'toggle_disable_fast_startup': 'disable_fast_startup',
      'toggle_disable_hyperthreading': 'disable_hyperthreading',
      'toggle_disable_cstates': 'disable_cstates',
      'toggle_disable_idle_states': 'disable_idle_states',
      'toggle_game_mode': 'enable_game_mode',
      'toggle_game_dvr': 'disable_game_dvr',
      'toggle_fast_startup': 'enable_fast_startup',
      
      // Network tweaks
      'toggle_disable_nagle_algorithm': 'disable_nagle_algorithm',
      'toggle_optimize_tcp_settings': 'optimize_tcp_settings',
      'toggle_flush_dns_cache': 'flush_dns_cache',
      'toggle_disable_network_throttling': 'disable_network_throttling',
      'toggle_disable_network_autotuning': 'disable_network_autotuning',
      'toggle_disable_ipv6': 'disable_ipv6',
      'toggle_set_max_connections': 'set_max_connections',
      'toggle_disable_dns_caching': 'disable_dns_caching',
      'toggle_disable_auto_tuning': 'disable_auto_tuning',
      'toggle_disable_bits': 'disable_bits',
      'toggle_set_google_dns': 'set_google_dns',
      'toggle_enable_jumbo_frame': 'enable_jumbo_frame',
      'toggle_disable_ipv6_completely': 'disable_ipv6_completely',
      'toggle_reset_tcp_ip_stack': 'reset_tcp_ip_stack',
      'toggle_disable_teredo': 'disable_teredo',
      'toggle_set_mtu_for_internet': 'set_mtu_for_internet',
      'toggle_tcp_optimizations': 'tcp_optimizations',
      'toggle_optimize_tcp_ip': 'optimize_tcp_ip',
      
      // Visual tweaks - keeping both old and new IDs for compatibility
      'toggle_disable_transparency': 'disable_transparency',
      'toggle_show_seconds_in_taskbar_clock': 'show_seconds_in_taskbar',
      'toggle_enable_transparency_effects': 'enable_transparency_effects',
      'toggle_disable_animations': 'disable_animations',
      
      // Privacy tweaks
      'toggle_no_telemetry': 'disable_telemetry',
      'toggle_disable_edge_tracking': 'disable_edge_tracking',
      'toggle_disable_app_tracking': 'disable_app_tracking',
      'toggle_disable_web_search': 'disable_web_search',
      'toggle_disable_win_defender': 'disable_defender',
      'toggle_disable_update_telemetry': 'disable_update_telemetry',
      'toggle_disable_wi_fi_sense': 'disable_wifi_sense',
      'toggle_disable_win_error_reporting': 'disable_error_reporting',
      'toggle_optimize_updates': 'optimize_updates',
      'toggle_disable_search_index': 'disable_search_index',
      
      // Misc tweaks
      'toggle_disable_app_vulnerability': 'disable_app_vulnerability',
      'toggle_disable_sys_restore': 'disable_system_restore',
      'toggle_disable_throttle': 'disable_throttling',
      'toggle_enable_fast_startup': 'enable_fast_startup',
      'toggle_disable_remote_assistance': 'disable_remote_assistance',
      'toggle_remove_bloatware': 'remove_bloatware',
      
      // Power tweaks
      'toggle_ultimate_performance': 'ultimate_performance',
      'toggle_enable_cpu_performance': 'enable_cpu_performance'
    };
    
    // Add event listeners for all toggle checkboxes based on the mapping
    Object.entries(toggleMap).forEach(([toggleId, tweakId]) => {
      const toggleElement = document.getElementById(toggleId);
      if (toggleElement) {
        toggleElement.addEventListener('change', function() {
          if (this.checked) {
            tweakManager.applyTweak(tweakId)
              .catch(error => {
                alert(`Failed to apply tweak: ${error}`);
              });
          }
        });
      }
    });
    
    // Add event listeners for data-tweak-id elements
    document.querySelectorAll('[data-tweak-id]').forEach(btn => {
      if (btn.tagName.toLowerCase() !== 'input' || btn.type !== 'checkbox') {
        btn.addEventListener('click', event => {
          const tweakId = event.target.getAttribute('data-tweak-id');
          tweakManager.applyTweak(tweakId)
            .catch(error => {
              alert(`Failed to apply tweak: ${error}`);
            });
        });
      }
    });
    
    // Legacy ID mapping for backwards compatibility
    const legacyIdMap = {
      'toggleGameMode': 'toggle_game_mode',
      'toggleGameDVR': 'toggle_game_dvr',
      'toggleFastStartup': 'toggle_fast_startup',
      'toggleTCP': 'toggle_optimize_tcp',
      'toggleDNSFlush': 'toggle_dns_flush',
      'toggleAnimations': 'toggle_disable_animations',
      'toggleTransparency': 'toggle_disable_transparency',
      'toggleWinUpdate': 'toggle_optimize_updates',
      'toggleSearchIndex': 'toggle_disable_search_index',
      'toggleTelemetry': 'toggle_no_telemetry',
      'toggleRemoteAssist': 'toggle_disable_remote_assistance',
      'toggleBackgroundApps': 'toggle_disable_background_apps',
      'toggleDebloat': 'toggle_remove_bloatware'
    };
    
    // Add event listeners for legacy toggle IDs
    Object.entries(legacyIdMap).forEach(([legacyId, standardId]) => {
      const legacyElement = document.getElementById(legacyId);
      const standardElement = document.getElementById(standardId);
      
      if (legacyElement && standardElement) {
        // Sync the state of legacy element with standard element
        legacyElement.addEventListener('change', function() {
          standardElement.checked = this.checked;
          standardElement.dispatchEvent(new Event('change'));
        });
      } else if (legacyElement) {
        // If standard element doesn't exist, handle legacy element directly
        const tweakId = toggleMap[standardId] || legacyId.replace('toggle', '').toLowerCase();
        legacyElement.addEventListener('change', function() {
          if (this.checked) {
            tweakManager.applyTweak(tweakId)
              .catch(error => {
                alert(`Failed to apply tweak: ${error}`);
              });
          }
        });
      }
    });
  },
  
  /**
   * Save configuration to a file
   */
  saveConfig: function() {
    // Create configuration object
    const configData = {
      tweaks: {},
      powerPlan: document.getElementById('powerPlanSelect')?.value || ""
    };
    
    // Get all toggle states
    Object.keys(this.toggleMap).forEach(toggleId => {
      const element = document.getElementById(toggleId);
      if (element && element.type === 'checkbox') {
        configData.tweaks[toggleId] = element.checked;
      }
    });
    
    // Trigger download of config file
    const dataStr = JSON.stringify(configData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'tweaker_config.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    console.log('Configuration saved');
    return true;
  },
  
  /**
   * Load configuration from a file
   * @param {Object} configData - The configuration data to load
   */
  loadConfig: function(configData) {
    if (!configData || !configData.tweaks) {
      console.error('Invalid configuration data');
      return false;
    }
    
    // Apply toggle states
    Object.keys(configData.tweaks).forEach(toggleId => {
      const element = document.getElementById(toggleId);
      if (element && element.type === 'checkbox') {
        element.checked = configData.tweaks[toggleId];
      }
    });
    
    // Apply power plan if present
    if (configData.powerPlan) {
      const powerPlanSelect = document.getElementById('powerPlanSelect');
      if (powerPlanSelect) {
        powerPlanSelect.value = configData.powerPlan;
      }
    }
    
    console.log('Configuration loaded');
    return true;
  },
  
  /**
   * Create a system restore point
   * @returns {Promise<boolean>} Whether the restore point was created successfully
   */
  createRestorePoint: function() {
    return new Promise((resolve, reject) => {
      if (!this.ipcRenderer) {
        reject(new Error('IPC Renderer not available'));
        return;
      }
      
      // Use the existing create-restore-point handler
      this.ipcRenderer.invoke('create-restore-point')
        .then(result => {
          console.log('Restore point creation result:', result);
          resolve(result);
        })
        .catch(error => {
          console.error('Failed to create restore point:', error);
          reject(error);
        });
    });
  },
  
  /**
   * Run a system benchmark
   * @returns {Promise<Object>} Benchmark results
   */
  runBenchmark: function() {
    return new Promise((resolve, reject) => {
      if (!this.ipcRenderer) {
        reject(new Error('IPC Renderer not available'));
        return;
      }
      
      console.log('Starting benchmark...');
      
      // Start time
      const startTime = performance.now();
      
      // Create promise to get CPU info
      const cpuPromise = this.ipcRenderer.invoke('get-cpu-info');
      
      // Create promise to get disk performance
      const diskPromise = this.ipcRenderer.invoke('benchmark-disk');
      
      // Create promise to get GPU info
      const gpuPromise = this.ipcRenderer.invoke('get-gpu-info');
      
      // Run all benchmarks in parallel
      Promise.all([cpuPromise, diskPromise, gpuPromise])
        .then(([cpuInfo, diskPerformance, gpuInfo]) => {
          // End time
          const endTime = performance.now();
          const timeElapsed = endTime - startTime;
          
          // Calculate score based on components
          const cpuScore = cpuInfo.speed ? cpuInfo.speed * cpuInfo.cores * 10 : 1000;
          const diskScore = diskPerformance.writeSpeed ? diskPerformance.writeSpeed * 0.5 : 500;
          const gpuScore = gpuInfo.vram ? gpuInfo.vram * 100 : 1000;
          
          // Overall score
          const overallScore = Math.round((cpuScore + diskScore + gpuScore) / 3);
          
          const result = {
            score: overallScore,
            time: Math.round(timeElapsed),
            cpu: cpuInfo.model || 'Unknown',
            cores: cpuInfo.cores || 0,
            gpu: gpuInfo.model || 'Unknown',
            disk: `${Math.round(diskPerformance.readSpeed || 0)} MB/s read, ${Math.round(diskPerformance.writeSpeed || 0)} MB/s write`
          };
          
          console.log('Benchmark completed:', result);
          resolve(result);
        })
        .catch(error => {
          console.error('Benchmark failed:', error);
          reject(error);
        });
    });
  }
};

// Export the module
module.exports = tweakManager;
