// Glowing Orb Animation Loader
 var D = {
   mouseX: 0,
   mouseY: 0,
   centerX: 0,
   centerY: 0,
   animationId: null,
   sparkAnimationId: null,
   time: 0,
   isGrowing: false,
   growthTime: 0,
   hasInteracted: false, // Track if user has interacted
   orbHidden: false, // Track if orb should be hidden
  
  // Responsive parameters
  getResponsiveParams: function() {
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    var screenArea = screenWidth * screenHeight;
    
    // Adjust orb size based on screen size
    if (screenArea < 500000) { // Small screens (mobile)
      return {
        orbSize: 8,
        glowSize: 20,
        isMobile: true
      };
    } else if (screenArea < 1000000) { // Medium screens (tablet)
      return {
        orbSize: 12,
        glowSize: 30,
        isMobile: false
      };
    } else { // Large screens (desktop)
      return {
        orbSize: 15,
        glowSize: 40,
        isMobile: false
      };
    }
  },

  Clear: function() {
    D.ctx.clearRect(0, 0, D.canvas.width, D.canvas.height);
  },

     DrawOrb: function() {
     // Don't draw orb if it's hidden
     if (D.orbHidden) return;
     
     var params = D.getResponsiveParams();
     
     // Calculate growth effect
     var growthMultiplier = 1.0;
     if (D.isGrowing) {
       growthMultiplier = 1.0 + Math.sin(D.growthTime * 0.02) * 0.3; // Pulsing growth
     }
     
     // Add subtle hover effect when mouse is near center (desktop only)
     var centerX = D.canvas.width / 2;
     var centerY = D.canvas.height / 2;
     var hoverEffect = 0;
     if (!params.isMobile) {
       var distanceFromCenter = Math.sqrt((D.mouseX - centerX) ** 2 + (D.mouseY - centerY) ** 2);
       hoverEffect = Math.max(0, 1 - distanceFromCenter / 200); // Hover effect within 200px of center
     }
     
     // Add smooth fluid animation to the orb
     var time = Date.now() * 0.001;
     var fluidPulse = Math.sin(time * 3) * 0.1 + 1; // Subtle pulsing
     var fluidWobble = Math.sin(time * 2) * 0.05; // Subtle wobble
     var fluidRotation = Math.sin(time * 1.5) * 0.02; // Subtle rotation effect
     
     var currentOrbSize = params.orbSize * growthMultiplier * fluidPulse * (1 + hoverEffect * 0.2);
     var currentGlowSize = params.glowSize * growthMultiplier * fluidPulse * (1 + hoverEffect * 0.3);
     
     // Use mouse position directly for cursor-like behavior with fluid effects
     var orbX = D.mouseX + fluidWobble;
     var orbY = D.mouseY + fluidRotation;
     
     // Create radial gradient for glow effect
     var gradient = D.ctx.createRadialGradient(
       orbX, orbY, 0,
       orbX, orbY, currentGlowSize
     );
     
     // Add glow stops - white theme for startup screen
     gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
     gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)');
     gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)');
     gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.4)');
     gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
     
     // Draw the glowing orb
     D.ctx.beginPath();
     D.ctx.arc(orbX, orbY, currentGlowSize, 0, 2 * Math.PI, false);
     D.ctx.fillStyle = gradient;
     D.ctx.fill();
     
     // Draw the core orb
     D.ctx.beginPath();
     D.ctx.arc(orbX, orbY, currentOrbSize, 0, 2 * Math.PI, false);
     D.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
     D.ctx.fill();
     
     // Add inner glow for enhanced effect
     var innerGlow = D.ctx.createRadialGradient(
       orbX, orbY, 0,
       orbX, orbY, currentOrbSize * 0.5
     );
     innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
     innerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
     
     D.ctx.beginPath();
     D.ctx.arc(orbX, orbY, currentOrbSize * 0.5, 0, 2 * Math.PI, false);
     D.ctx.fillStyle = innerGlow;
     D.ctx.fill();
     
     // Add subtle trail effect for fluid movement
     var trailGradient = D.ctx.createRadialGradient(
       orbX - 5, orbY - 5, 0,
       orbX, orbY, currentGlowSize * 0.3
     );
     trailGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
     trailGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
     
     D.ctx.beginPath();
     D.ctx.arc(orbX - 5, orbY - 5, currentGlowSize * 0.3, 0, 2 * Math.PI, false);
     D.ctx.fillStyle = trailGradient;
     D.ctx.fill();
   },

                       DrawSparks: function() {
       if (!D.sparks || D.sparks.length === 0) return;
       
       D.ctx.save();
       D.ctx.globalCompositeOperation = 'lighter';
       
       for (var i = D.sparks.length - 1; i >= 0; i--) {
         var spark = D.sparks[i];
         
         // Apply physics
         spark.vy += spark.gravity; // Gravity
         spark.vx *= spark.friction; // Air resistance
         spark.vy *= spark.friction; // Air resistance
         
         // Update spark position
         spark.x += spark.vx;
         spark.y += spark.vy;
         
         // Bounce off screen edges
         if (spark.x <= 0 || spark.x >= D.canvas.width) {
           spark.vx *= -spark.bounce;
           spark.x = Math.max(0, Math.min(D.canvas.width, spark.x));
         }
         if (spark.y >= D.canvas.height) {
           spark.vy *= -spark.bounce;
           spark.y = D.canvas.height;
         }
         
         spark.life -= 0.025; // Much faster decay so sparks end sooner
        
        // Remove dead sparks
        if (spark.life <= 0) {
          D.sparks.splice(i, 1);
          continue;
        }
        
        // Draw spark
        var alpha = spark.life;
        var size = spark.size * spark.life;
        
        // Create spark gradient
        var sparkGradient = D.ctx.createRadialGradient(
          spark.x, spark.y, 0,
          spark.x, spark.y, size
        );
        sparkGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        sparkGradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.8})`);
        sparkGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        
        D.ctx.beginPath();
        D.ctx.arc(spark.x, spark.y, size, 0, 2 * Math.PI, false);
        D.ctx.fillStyle = sparkGradient;
        D.ctx.fill();
      }
      
      D.ctx.restore();
    },

           CreateSparks: function(x, y) {
     if (!D.sparks) D.sparks = [];
     
     // Create more, smaller sparkles with physics
     for (var i = 0; i < 35; i++) {
       var angle = (Math.PI * 2 * i) / 35 + (Math.random() - 0.5) * 1.0;
       var speed = 8.0 + Math.random() * 8.0; // Much faster sparks
       
               D.sparks.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          size: 0.5 + Math.random() * 1.5, // Bigger sparks (was 0.25 + 0.75)
          gravity: 0.15, // Gravity effect
          bounce: 0.7, // Bounce factor
          friction: 0.95 // More air resistance for shorter trails
        });
     }
   },

     Update: function() {
     // Update growth time
     if (D.isGrowing) {
       D.growthTime += 1;
     }
     
     D.Clear();
     D.DrawOrb();
     D.DrawSparks();
   },

  Draw: function() {
    D.time += 0.016; // Approximately 60fps
    D.Update();
    D.animationId = requestAnimationFrame(D.Draw, D.canvas);
  },

  Set: function() {
    // Initialize mouse position based on screen size
    const params = D.getResponsiveParams();
    if (params.isMobile) {
      // Fixed position in center for mobile
      D.mouseX = D.canvas.width / 2;
      D.mouseY = D.canvas.height / 2;
    } else {
      // Start at center but will follow mouse on desktop
      D.mouseX = D.canvas.width / 2;
      D.mouseY = D.canvas.height / 2;
    }
  },

  Size: function() {
    D.canvas.width = window.innerWidth;
    D.canvas.height = window.innerHeight;
    // Update mouse position based on screen size when resizing
    const params = D.getResponsiveParams();
    if (params.isMobile) {
      // Keep fixed in center for mobile
      D.mouseX = D.canvas.width / 2;
      D.mouseY = D.canvas.height / 2;
    }
    // On desktop, let the mouse position remain where it is
  },

  Run: function() {
    D.canvas = document.querySelector('#loader canvas');
    D.ctx = D.canvas.getContext('2d');
    
    // Hide cursor on canvas
    if (D.canvas) {
      D.canvas.style.cursor = 'none';
    }
    
    window.addEventListener('resize', D.Size, false);
    D.Size();
    
    // Add mouse movement listener with smooth tracking (desktop only)
    D.mouseMoveHandler = function(e) {
      const params = D.getResponsiveParams();
      if (params.isMobile) return; // Don't move orb on mobile
      
      const rect = D.canvas.getBoundingClientRect();
      const targetX = e.clientX - rect.left;
      const targetY = e.clientY - rect.top;
      
      // Smooth interpolation for fluid movement
      D.mouseX += (targetX - D.mouseX) * 0.15; // Smooth following
      D.mouseY += (targetY - D.mouseY) * 0.15; // Smooth following
      

    };
    D.canvas.addEventListener('mousemove', D.mouseMoveHandler);
    
    // Add touch support for mobile (orb stays fixed in center)
    D.touchHandler = function(e) {
      e.preventDefault();
      const params = D.getResponsiveParams();
      if (!params.isMobile) return; // Only handle touch on mobile
      
      // Keep orb fixed in center on mobile
      D.mouseX = D.canvas.width / 2;
      D.mouseY = D.canvas.height / 2;
      

    };
    D.canvas.addEventListener('touchmove', D.touchHandler, { passive: false });
  },

  Init: function() {
    D.Run();
    D.Set();
    D.Draw();
  },
  
     Cleanup: function() {
     // Mark orb as hidden
     D.orbHidden = true;
     
     // Stop animation
     if (D.animationId) {
       cancelAnimationFrame(D.animationId);
       D.animationId = null;
     }
     
     // Clear the canvas to remove the orb
     if (D.canvas && D.ctx) {
       D.ctx.clearRect(0, 0, D.canvas.width, D.canvas.height);
     }
     
     // Remove event listeners
     if (D.canvas && D.mouseMoveHandler) {
       D.canvas.removeEventListener('mousemove', D.mouseMoveHandler);
     }
     if (D.canvas && D.touchHandler) {
       D.canvas.removeEventListener('touchmove', D.touchHandler);
     }
     window.removeEventListener('resize', D.Size);
   },
   
   CleanupSparks: function() {
     // Clear canvas
     if (D.canvas && D.ctx) {
       D.ctx.clearRect(0, 0, D.canvas.width, D.canvas.height);
     }
   },
   
   DrawSparksOnly: function() {
     if (!D.sparks || D.sparks.length === 0) {
       // No more sparks, cleanup and stop
       D.CleanupSparks();
       if (D.sparkAnimationId) {
         cancelAnimationFrame(D.sparkAnimationId);
         D.sparkAnimationId = null;
       }
       return;
     }
     
     // Clear canvas before drawing sparks to ensure orb is gone
     D.ctx.clearRect(0, 0, D.canvas.width, D.canvas.height);
     
     D.ctx.save();
     D.ctx.globalCompositeOperation = 'lighter';
     
     for (var i = D.sparks.length - 1; i >= 0; i--) {
       var spark = D.sparks[i];
       
       // Apply physics
       spark.vy += spark.gravity; // Gravity
       spark.vx *= spark.friction; // Air resistance
       spark.vy *= spark.friction; // Air resistance
       
       // Update spark position
       spark.x += spark.vx;
       spark.y += spark.vy;
       
       // Bounce off screen edges
       if (spark.x <= 0 || spark.x >= D.canvas.width) {
         spark.vx *= -spark.bounce;
         spark.x = Math.max(0, Math.min(D.canvas.width, spark.x));
       }
       if (spark.y >= D.canvas.height) {
         spark.vy *= -spark.bounce;
         spark.y = D.canvas.height;
       }
       
               spark.life -= 0.025; // Much faster decay so sparks end sooner
       
       // Remove dead sparks
       if (spark.life <= 0) {
         D.sparks.splice(i, 1);
         continue;
       }
       
       // Draw spark
       var alpha = spark.life;
       var size = spark.size * spark.life;
       
               // Create spark gradient
        var sparkGradient = D.ctx.createRadialGradient(
          spark.x, spark.y, 0,
          spark.x, spark.y, size
        );
        sparkGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        sparkGradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.8})`);
        sparkGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
       
       D.ctx.beginPath();
       D.ctx.arc(spark.x, spark.y, size, 0, 2 * Math.PI, false);
       D.ctx.fillStyle = sparkGradient;
       D.ctx.fill();
     }
     
     D.ctx.restore();
     
     // Continue spark animation
     D.sparkAnimationId = requestAnimationFrame(D.DrawSparksOnly);
   }
};

// Initialize glowing orb animation
function initSphereLoader() {
    console.log('Loader disabled - showing website content immediately');
    
    // Show website content immediately
    const websiteContent = document.getElementById('website-content');
    if (websiteContent) {
        websiteContent.style.display = 'block';
        websiteContent.style.opacity = '1';
        websiteContent.style.visibility = 'visible';
        websiteContent.classList.add('revealed');
    }
    
    // Ensure body has normal cursor
    document.body.style.cursor = '';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSphereLoader);
} else {
    initSphereLoader();
}

// Function to reset first visit flag (for testing)
window.resetFirstVisit = function() {
    localStorage.removeItem('hasVisitedHome');
    localStorage.removeItem('hasVisitedHomeEver');
    sessionStorage.removeItem('hasVisitedHomeThisSession');
    console.log('First visit flags reset. Reload the page to see the loader again.');
}; 