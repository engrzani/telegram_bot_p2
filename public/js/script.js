// Utility functions
const showAlert = (message, type = 'info') => {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.role = 'alert';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  const container = document.querySelector('main > .container, main > .container-fluid');
  if (container) {
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }
};

// Form validation
const forms = document.querySelectorAll('.needs-validation');
forms.forEach(form => {
  form.addEventListener('submit', event => {
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add('was-validated');
  }, false);
});

// Confirm dialogs for destructive actions
document.querySelectorAll('[data-confirm]').forEach(element => {
  element.addEventListener('click', function(e) {
    const message = this.getAttribute('data-confirm');
    if (!confirm(message)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
});

// Auto-refresh for dashboard (optional)
const shouldAutoRefresh = document.querySelector('[data-auto-refresh]');
if (shouldAutoRefresh) {
  const interval = parseInt(shouldAutoRefresh.getAttribute('data-auto-refresh')) || 30000;
  setInterval(() => {
    location.reload();
  }, interval);
}

// Tooltips initialization (Bootstrap 5)
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

// Clipboard copy functionality
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    showAlert('Copied to clipboard!', 'success');
  }).catch(err => {
    console.error('Failed to copy:', err);
    showAlert('Failed to copy to clipboard', 'danger');
  });
};

// Add copy buttons to code blocks
document.querySelectorAll('pre').forEach(pre => {
  const button = document.createElement('button');
  button.className = 'btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2';
  button.innerHTML = '<i class="bi bi-clipboard"></i>';
  button.onclick = () => copyToClipboard(pre.textContent);
  
  pre.style.position = 'relative';
  pre.appendChild(button);
});

// Real-time clock (if needed)
const updateClock = () => {
  const clockElement = document.getElementById('live-clock');
  if (clockElement) {
    const now = new Date();
    clockElement.textContent = now.toLocaleTimeString();
  }
};

if (document.getElementById('live-clock')) {
  setInterval(updateClock, 1000);
  updateClock();
}

// Dark mode toggle (optional future feature)
const toggleDarkMode = () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
};

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}

// Log client-side errors (for debugging)
window.addEventListener('error', (event) => {
  console.error('Client error:', {
    message: event.message,
    source: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

// Service Worker registration (for PWA - future feature)
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registered:', registration);
    }).catch(err => {
      console.log('ServiceWorker registration failed:', err);
    });
  });
}

// Console welcome message
console.log('%c🚀 Delivery Block Monitor', 'color: #0d6efd; font-size: 24px; font-weight: bold;');
console.log('%cWelcome to the system!', 'color: #6c757d; font-size: 14px;');
console.log('%c⚠️ Warning: Do not paste any code here unless you know what you are doing!', 'color: #dc3545; font-size: 12px; font-weight: bold;');
