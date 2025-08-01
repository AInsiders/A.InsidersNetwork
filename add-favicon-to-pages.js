/**
 * Favicon Setup Helper Script
 * Run this in the browser console on any page to add favicon support
 * Uses SkyblueFire.gif for animated favicon when tab is not active
 */

(function() {
  // Check if favicon already exists
  const existingFavicon = document.querySelector('link[rel="icon"]');
  if (existingFavicon) {
    console.log('Favicon already exists:', existingFavicon.href);
    return;
  }
  
  // Create favicon link elements
  const faviconLink = document.createElement('link');
  faviconLink.rel = 'icon';
  faviconLink.type = 'image/png';
  faviconLink.href = 'ainsiders-logo.png';
  faviconLink.id = 'main-favicon';
  
  const appleTouchIcon = document.createElement('link');
  appleTouchIcon.rel = 'apple-touch-icon';
  appleTouchIcon.href = 'ainsiders-logo.png';
  
  // Add to head
  document.head.appendChild(faviconLink);
  document.head.appendChild(appleTouchIcon);
  
  // Load favicon animation script
  const script = document.createElement('script');
  script.src = 'favicon-animation.js';
  document.head.appendChild(script);
  
  console.log('✅ Favicon setup complete! Added to:', document.title);
  console.log('🔥 Will show SkyblueFire.gif when tab is not active');
})(); 