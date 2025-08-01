/**
 * Favicon Animation System
 * Changes favicon to animated fire GIF when user is not present on tab
 */

(function() {
  // Wait for DOM to be ready
  function initFaviconAnimation() {
    const mainFavicon = document.getElementById('main-favicon');
    if (!mainFavicon) {
      console.warn('Favicon element not found. Make sure to add <link rel="icon" type="image/png" href="ainsiders-logo.png" id="main-favicon"> to your HTML head.');
      return;
    }
    
    const originalHref = mainFavicon.href;
    let animationInterval;
    
    // Start fire animation
    function startFireAnimation() {
      if (animationInterval) return;
      
      // Change favicon to the animated fire GIF
      mainFavicon.href = 'SkyblueFire.gif';
    }
    
    // Stop fire animation and restore original favicon
    function stopFireAnimation() {
      if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
      }
      mainFavicon.href = originalHref;
    }
    
    // Handle page visibility changes
    function handleVisibilityChange() {
      if (document.hidden) {
        startFireAnimation();
      } else {
        stopFireAnimation();
      }
    }
    
    // Handle window focus/blur
    function handleWindowFocus() {
      stopFireAnimation();
    }
    
    function handleWindowBlur() {
      startFireAnimation();
    }
    
    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    
    // Initialize - check if page is already hidden
    if (document.hidden) {
      startFireAnimation();
    }
    
    // Cleanup function for page unload
    window.addEventListener('beforeunload', () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaviconAnimation);
  } else {
    initFaviconAnimation();
  }
})(); 