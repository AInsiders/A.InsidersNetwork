// Script to add the minimalistic chat widget to all HTML pages
// This script can be run to automatically add the chat widget to all pages

const chatWidgetCSS = `
  <!-- Custom Chat Widget Styles -->
  <style>
    /* Hide the original Tawk.to widget completely */
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
      position: absolute !important;
      left: -9999px !important;
      top: -9999px !important;
      width: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
    }

    /* Custom minimalistic chat widget */
    .custom-chat-widget {
      position: fixed;
      bottom: 30px;
      right: 30px;
      z-index: 9999;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .chat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 50%;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .chat-icon:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    }

    .chat-icon:active {
      transform: translateY(0) scale(0.95);
    }

    .chat-icon svg {
      width: 20px;
      height: 20px;
      stroke: currentColor;
      stroke-width: 2;
      fill: none;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .custom-chat-widget {
        bottom: 20px;
        right: 20px;
      }
      
      .chat-icon {
        width: 50px;
        height: 50px;
      }
      
      .chat-icon svg {
        width: 18px;
        height: 18px;
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .chat-icon {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
      }
      
      .chat-icon:hover {
        background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
        box-shadow: 0 8px 30px rgba(79, 70, 229, 0.5);
      }
    }
  </style>
`;

const chatWidgetHTML = `
  <!-- Custom Minimalistic Chat Widget -->
  <div id="custom-chat-widget" class="custom-chat-widget">
    <div class="chat-icon" id="chat-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>
`;

const chatWidgetScript = `
    <!-- Custom Chat Widget Functionality -->
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const chatIcon = document.getElementById('chat-icon');
        
        if (chatIcon) {
          chatIcon.addEventListener('click', function() {
            // Trigger Tawk.to chat
            if (typeof Tawk_API !== 'undefined') {
              Tawk_API.maximize();
            } else {
              // Fallback: try to open Tawk.to manually
              window.open('https://tawk.to/chat/688b284b9abe48192a749848/1j1fpapuu', '_blank');
            }
          });
        }
      });

      // Additional script to ensure Tawk.to widget is hidden
      window.addEventListener('load', function() {
        // Hide any remaining Tawk.to elements
        const tawkElements = document.querySelectorAll('[id*="tawk"], [class*="tawk"], iframe[src*="tawk"]');
        tawkElements.forEach(function(element) {
          element.style.display = 'none';
          element.style.visibility = 'hidden';
          element.style.opacity = '0';
          element.style.pointerEvents = 'none';
        });
      });
    </script>

    <!-- Tawk.to Script (Hidden) -->
    <script type="text/javascript">
      var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
      (function(){
      var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
      s1.async=true;
      s1.src='https://embed.tawk.to/688b284b9abe48192a749848/1j1fpapuu';
      s1.charset='UTF-8';
      s1.setAttribute('crossorigin','*');
      s0.parentNode.insertBefore(s1,s0);
      })();
      
      // Hide the default Tawk.to widget and ensure it stays hidden
      Tawk_API.onLoad = function(){
        if (typeof Tawk_API !== 'undefined') {
          Tawk_API.hideWidget();
          
          // Continuously hide the widget
          setInterval(function() {
            const tawkElements = document.querySelectorAll('[id*="tawk"], [class*="tawk"], iframe[src*="tawk"]');
            tawkElements.forEach(function(element) {
              if (element.style.display !== 'none') {
                element.style.display = 'none';
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
                element.style.pointerEvents = 'none';
              }
            });
          }, 1000);
        }
      };
    </script>
`;

// List of HTML files that need the chat widget
const htmlFiles = [
  'apps.html',
  'news-enhanced.html',
  
  'blake-zimmerman.html',
  'blake-zimmerman-profile.html',
  'blake-zimmerman-profile-simple.html',
  'thank-you.html'
];

console.log('Chat widget components ready to be added to HTML files:');
console.log('CSS:', chatWidgetCSS);
console.log('HTML:', chatWidgetHTML);
console.log('Script:', chatWidgetScript);
console.log('Files to update:', htmlFiles);

// Instructions for manual addition:
console.log('\n=== MANUAL ADDITION INSTRUCTIONS ===');
console.log('1. Add the CSS styles in the <head> section after the existing stylesheets');
console.log('2. Add the HTML widget before the closing </body> tag');
console.log('3. Replace any existing Tawk.to scripts with the new hidden version');
console.log('4. Add the chat functionality script before the closing </body> tag'); 