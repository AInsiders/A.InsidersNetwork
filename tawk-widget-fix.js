// Tawk Widget Fix - Unified Implementation
// This script fixes the inconsistent widget IDs and implementation issues

const TAWK_WIDGET_ID = '688b284b9abe48192a749848';
const TAWK_WIDGET_CODE = '1j1s0h5i3'; // Using the consistent widget code

// CSS to hide the default Tawk widget and show custom one
const tawkWidgetCSS = `
<style>
  /* Hide the default Tawk.to widget */
  #tawkto-container,
  .tawkto-container,
  .tawkto-widget,
  .tawkto-minimized,
  .tawkto-maximized,
  .tawkto-iframe,
  .tawkto-button,
  .tawkto-bubble,
  .tawkto-chat,
  .tawkto-widget-container,
  .tawkto-widget-container *,
  iframe[src*="tawk.to"],
  div[data-tawk-to],
  .tawkto,
  .tawkto * {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  /* Custom Tawk Widget Button */
  .custom-tawk-widget {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 9999;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .tawk-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 50%;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    border: none;
    font-size: 24px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .tawk-button:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  }

  .tawk-button:active {
    transform: translateY(0) scale(0.95);
  }

  .tawk-button .pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(102, 126, 234, 0.3);
    animation: tawkPulse 2s infinite;
  }

  @keyframes tawkPulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }

  .tawk-button .tooltip {
    position: absolute;
    right: 70px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    pointer-events: none;
  }

  .tawk-button .tooltip::after {
    content: '';
    position: absolute;
    right: -5px;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-left-color: rgba(0, 0, 0, 0.8);
  }

  .tawk-button:hover .tooltip {
    opacity: 1;
    visibility: visible;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .custom-tawk-widget {
      bottom: 20px;
      right: 20px;
    }
    
    .tawk-button {
      width: 50px;
      height: 50px;
      font-size: 20px;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .tawk-button {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
    }
    
    .tawk-button:hover {
      background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
      box-shadow: 0 8px 30px rgba(79, 70, 229, 0.5);
    }
  }
</style>
`;

// HTML for the custom widget
const tawkWidgetHTML = `
<div id="custom-tawk-widget" class="custom-tawk-widget">
  <button class="tawk-button" id="tawk-button" title="Chat with us instantly!">
    <div class="pulse"></div>
    💬
    <span class="tooltip">Chat with us instantly!</span>
  </button>
</div>
`;

// Tawk API initialization and management
const tawkWidgetScript = `
<script type="text/javascript">
  // Initialize Tawk API
  var Tawk_API = Tawk_API || {};
  var Tawk_LoadStart = new Date();

  // Tawk widget configuration
  Tawk_API.onLoad = function() {
    console.log('Tawk widget loaded successfully');
    
    // Hide the default widget
    if (typeof Tawk_API.hideWidget === 'function') {
      Tawk_API.hideWidget();
    }
    
    // Set up custom button functionality
    const tawkButton = document.getElementById('tawk-button');
    if (tawkButton) {
      tawkButton.addEventListener('click', function() {
        if (typeof Tawk_API.maximize === 'function') {
          Tawk_API.maximize();
        } else {
          // Fallback: open in new tab
          window.open('https://tawk.to/chat/${TAWK_WIDGET_ID}/${TAWK_WIDGET_CODE}', '_blank');
        }
      });
    }
  };

  Tawk_API.onStatusChange = function(status) {
    console.log('Tawk status changed:', status);
  };

  // Load Tawk script
  (function() {
    var s1 = document.createElement("script");
    var s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/${TAWK_WIDGET_ID}/${TAWK_WIDGET_CODE}';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);
  })();

  // Ensure widget stays hidden
  setInterval(function() {
    const tawkElements = document.querySelectorAll('[id*="tawk"], [class*="tawk"], iframe[src*="tawk"]');
    tawkElements.forEach(function(element) {
      if (element.id !== 'custom-tawk-widget' && !element.classList.contains('custom-tawk-widget')) {
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.opacity = '0';
        element.style.pointerEvents = 'none';
      }
    });
  }, 1000);
</script>
`;

// Function to inject the fixed widget into a page
function injectTawkWidget() {
  // Remove any existing Tawk scripts
  const existingScripts = document.querySelectorAll('script[src*="tawk.to"]');
  existingScripts.forEach(script => script.remove());
  
  // Remove any existing Tawk widgets
  const existingWidgets = document.querySelectorAll('[id*="tawk"], [class*="tawk"]');
  existingWidgets.forEach(widget => {
    if (!widget.classList.contains('custom-tawk-widget')) {
      widget.remove();
    }
  });
  
  // Inject CSS
  const styleElement = document.createElement('style');
  styleElement.textContent = tawkWidgetCSS;
  document.head.appendChild(styleElement);
  
  // Inject HTML
  const widgetContainer = document.createElement('div');
  widgetContainer.innerHTML = tawkWidgetHTML;
  document.body.appendChild(widgetContainer);
  
  // Inject script
  const scriptElement = document.createElement('script');
  scriptElement.textContent = tawkWidgetScript;
  document.body.appendChild(scriptElement);
  
  console.log('Tawk widget fixed and injected successfully');
}

// Auto-inject if this script is loaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectTawkWidget);
  } else {
    injectTawkWidget();
  }
}

// Export for manual use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    injectTawkWidget,
    tawkWidgetCSS,
    tawkWidgetHTML,
    tawkWidgetScript,
    TAWK_WIDGET_ID,
    TAWK_WIDGET_CODE
  };
}
