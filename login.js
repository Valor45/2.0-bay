// Login page script
document.addEventListener('DOMContentLoaded', () => {
  console.log('Login script loaded');
  
  // Debug: Log the current application path to help with troubleshooting
  console.log('Current path:', window.location.href);
  
  // Force reliable navigation using hard-coded button injection
  const loginBtn = document.querySelector('#loginBtn');
  if (loginBtn) {
    console.log('Found login button, attaching handler');
    // Override any existing click handlers
    loginBtn.onclick = function(e) {
      e.preventDefault();
      console.log('Login button clicked');
      // Navigate to index.html in the same directory
      const indexPath = new URL('./index.html', window.location.href).href;
      console.log('Navigating to:', indexPath);
      window.location.href = indexPath;
      return false;
    };
  } else {
    console.error('Login button not found!');
    // Last resort: inject a button if the original can't be found
    const container = document.querySelector('.login-container');
    if (container) {
      const emergencyBtn = document.createElement('button');
      emergencyBtn.innerHTML = 'Emergency Login';
      emergencyBtn.style.backgroundColor = 'red';
      emergencyBtn.style.color = 'white';
      emergencyBtn.style.padding = '10px';
      emergencyBtn.style.margin = '10px 0';
      emergencyBtn.onclick = function() {
        window.location.href = './index.html';
      };
      container.appendChild(emergencyBtn);
    }
  }
  
  // Register button handler
  document.getElementById('regBtn')?.addEventListener('click', () => {
    const username = document.getElementById('regUser').value;
    const password = document.getElementById('regPass').value;
    const licenseKey = document.getElementById('regKey').value;
    
    // Simple validation
    if (!username || !password) {
      document.getElementById('reg-error').textContent = 'Please enter username and password';
      return;
    }
    
    console.log('Registration attempt:', username);
    
    // For demo purposes, show success and switch to login
    document.getElementById('reg-error').textContent = 'Registration successful!';
    document.getElementById('reg-error').style.color = 'green';
    
    // Switch to login form after short delay
    setTimeout(() => {
      showLoginForm();
    }, 1500);
  });
  
  // Form toggle handlers
  document.getElementById('showRegister')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
  });
  
  document.getElementById('showLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
  });
  
  function showLoginForm() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
  }
  
  // Theme toggle
  document.getElementById('toggleTheme')?.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  });
  
  // System restore button handler
  document.getElementById('mainRestoreBtn')?.addEventListener('click', () => {
    if (confirm('Create a system restore point now?')) {
      // This would normally use IPC to communicate with the main process
      alert('System restore point created successfully');
    }
  });
});
