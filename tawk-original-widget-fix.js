// Tawk Original Widget Fix - Shows Original Tawk Widget
// This script fixes the inconsistent widget IDs but keeps the original Tawk widget visible

const TAWK_WIDGET_ID = '688b284b9abe48192a749848';
const TAWK_WIDGET_CODE = '1j1s0h5i3'; // Using the consistent widget code

// CSS to style the original Tawk widget (optional styling)
const tawkWidgetCSS = `
<style>
  /* Optional: Style the original Tawk widget */
  #tawkto-container,
  .tawkto-container,
  .tawkto-widget {
    /* Keep original widget visible but ensure it's properly positioned */
    z-index: 9999 !important;
  }
  
  /* Ensure the widget is visible and not hidden by other CSS */
  iframe[src*="tawk.to"] {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
  }
  
  /* Remove any conflicting custom widgets */
  .custom-tawk-widget,
  .tawk-chat-button {
    display: none !important;
  }
  
  /* Mobile responsive adjustments for original widget */
  @media (max-width: 768px) {
    #tawkto-container,
    .tawkto-container {
      bottom: 20px !important;
      right: 20px !important;
    }
  }
</style>
`;

// Tawk API initialization and management (keeps original widget)
const tawkWidgetScript = `
<script type="text/javascript">
  // Initialize Tawk API
  var Tawk_API = Tawk_API || {};
  var Tawk_LoadStart = new Date();

  // Tawk widget configuration
  Tawk_API.onLoad = function() {
    console.log('Original Tawk widget loaded successfully');
    
    // Show the original widget (don't hide it)
    if (typeof Tawk_API.showWidget === 'function') {
      Tawk_API.showWidget();
    }
    
    // Set up any additional functionality if needed
    console.log('Tawk widget is ready and visible');
  };

  Tawk_API.onStatusChange = function(status) {
    console.log('Tawk status changed:', status);
  };

  // Load Tawk script with consistent widget code
  (function() {
    var s1 = document.createElement("script");
    var s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/${TAWK_WIDGET_ID}/${TAWK_WIDGET_CODE}';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);
  })();

  // Ensure widget stays visible and remove any conflicting elements
  setInterval(function() {
    // Remove any custom widgets that might interfere
    const customWidgets = document.querySelectorAll('.custom-tawk-widget, .tawk-chat-button');
    customWidgets.forEach(function(element) {
      element.remove();
    });
    
    // Ensure original Tawk elements are visible
    const tawkElements = document.querySelectorAll('[id*="tawk"], [class*="tawk"], iframe[src*="tawk"]');
    tawkElements.forEach(function(element) {
      if (!element.classList.contains('custom-tawk-widget') && !element.classList.contains('tawk-chat-button')) {
        element.style.display = '';
        element.style.visibility = '';
        element.style.opacity = '';
        element.style.pointerEvents = '';
      }
    });
  }, 2000);
</script>
`;

// Function to inject the original widget fix
function injectOriginalTawkWidget() {
  console.log('Injecting original Tawk widget fix...');
  
  // Remove any existing Tawk scripts
  const existingScripts = document.querySelectorAll('script[src*="tawk.to"]');
  existingScripts.forEach(script => script.remove());
  
  // Remove any custom widgets that might interfere
  const customWidgets = document.querySelectorAll('.custom-tawk-widget, .tawk-chat-button');
  customWidgets.forEach(widget => widget.remove());
  
  // Remove any CSS that hides Tawk widgets
  const existingStyles = document.querySelectorAll('style');
  existingStyles.forEach(style => {
    if (style.textContent.includes('tawk') && style.textContent.includes('display: none')) {
      style.remove();
    }
  });
  
  // Inject CSS to ensure original widget is visible
  const styleElement = document.createElement('style');
  styleElement.textContent = tawkWidgetCSS;
  document.head.appendChild(styleElement);
  
  // Inject script
  const scriptElement = document.createElement('script');
  scriptElement.textContent = tawkWidgetScript;
  document.body.appendChild(scriptElement);
  
  console.log('Original Tawk widget fix applied successfully');
  console.log('The original Tawk widget should now be visible');
}

// Auto-inject if this script is loaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectOriginalTawkWidget);
  } else {
    injectOriginalTawkWidget();
  }
}

// Export for manual use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    injectOriginalTawkWidget,
    tawkWidgetCSS,
    tawkWidgetScript,
    TAWK_WIDGET_ID,
    TAWK_WIDGET_CODE
  };
}
