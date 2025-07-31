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
  
  // Responsive parameters
  getResponsiveParams: function() {
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    var screenArea = screenWidth * screenHeight;
    
    // Adjust orb size based on screen size
    if (screenArea < 500000) { // Small screens (mobile)
      return {
        orbSize: 8,
        glowSize: 20
      };
    } else if (screenArea < 1000000) { // Medium screens (tablet)
      return {
        orbSize: 12,
        glowSize: 30
      };
    } else { // Large screens (desktop)
      return {
        orbSize: 15,
        glowSize: 40
      };
    }
  },

  Clear: function() {
    D.ctx.clearRect(0, 0, D.canvas.width, D.canvas.height);
  },

     DrawOrb: function() {
     var params = D.getResponsiveParams();
     
     // Calculate growth effect
     var growthMultiplier = 1.0;
     if (D.isGrowing) {
       growthMultiplier = 1.0 + Math.sin(D.growthTime * 0.02) * 0.3; // Pulsing growth
     }
     
     var currentOrbSize = params.orbSize * growthMultiplier;
     var currentGlowSize = params.glowSize * growthMultiplier;
     
     // Create radial gradient for glow effect
     var gradient = D.ctx.createRadialGradient(
       D.centerX, D.centerY, 0,
       D.centerX, D.centerY, currentGlowSize
     );
     
     // Add glow stops
     gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
     gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)');
     gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
     gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
     
     // Draw the glowing orb
     D.ctx.beginPath();
     D.ctx.arc(D.centerX, D.centerY, currentGlowSize, 0, 2 * Math.PI, false);
     D.ctx.fillStyle = gradient;
     D.ctx.fill();
     
     // Draw the core orb
     D.ctx.beginPath();
     D.ctx.arc(D.centerX, D.centerY, currentOrbSize, 0, 2 * Math.PI, false);
     D.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
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
     // Calculate screen center
     var screenCenterX = D.canvas.width / 2;
     var screenCenterY = D.canvas.height / 2;
     
     // Calculate distance from mouse to screen center
     var mouseDistanceFromCenter = Math.sqrt(
       Math.pow(D.mouseX - screenCenterX, 2) + 
       Math.pow(D.mouseY - screenCenterY, 2)
     );
     
     // Calculate maximum distance (diagonal of screen)
     var maxDistance = Math.sqrt(
       Math.pow(D.canvas.width, 2) + 
       Math.pow(D.canvas.height, 2)
     );
     
     // Calculate gravity strength based on distance (0.3 to 0.9) - stronger gravity
     var gravityStrength = 0.3 + (mouseDistanceFromCenter / maxDistance) * 0.6;
     
     // Calculate target position (blend between mouse and center)
     var targetX = D.mouseX * (1 - gravityStrength) + screenCenterX * gravityStrength;
     var targetY = D.mouseY * (1 - gravityStrength) + screenCenterY * gravityStrength;
     
     // Smooth interpolation for orb movement
     D.centerX += (targetX - D.centerX) * 0.08;
     D.centerY += (targetY - D.centerY) * 0.08;
     
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
    D.centerX = D.canvas.width / 2;
    D.centerY = D.canvas.height / 2;
    D.mouseX = D.canvas.width / 2;
    D.mouseY = D.canvas.height / 2;
  },

  Size: function() {
    D.canvas.width = window.innerWidth;
    D.canvas.height = window.innerHeight;
    D.centerX = D.canvas.width / 2;
    D.centerY = D.canvas.height / 2;
  },

  Run: function() {
    D.canvas = document.querySelector('#loader canvas');
    D.ctx = D.canvas.getContext('2d');
    window.addEventListener('resize', D.Size, false);
    D.Size();
    
    // Add mouse movement listener
    D.mouseMoveHandler = function(e) {
      D.mouseX = e.clientX;
      D.mouseY = e.clientY;
    };
    D.canvas.addEventListener('mousemove', D.mouseMoveHandler);
  },

  Init: function() {
    D.Run();
    D.Set();
    D.Draw();
  },
  
     Cleanup: function() {
     // Stop animation
     if (D.animationId) {
       cancelAnimationFrame(D.animationId);
       D.animationId = null;
     }
     
     // Remove event listeners
     if (D.canvas && D.mouseMoveHandler) {
       D.canvas.removeEventListener('mousemove', D.mouseMoveHandler);
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
    console.log('Initializing Glowing Orb Loader...');
    
    // Check if user has already visited this session
    const hasVisitedThisSession = sessionStorage.getItem('hasVisitedHomeThisSession');
    const isHomePage = window.location.pathname.endsWith('index.html') ||
                      window.location.pathname.endsWith('/') ||
                      window.location.pathname === '';
    
         // If returning user on home page, hide loader immediately
     if (hasVisitedThisSession && isHomePage) {
         console.log('Returning user detected - hiding loader immediately');
         const loader = document.getElementById('loader');
         const websiteContent = document.getElementById('website-content');
         
         // Hide text elements immediately for returning users
         const sparkText = document.querySelector('.spark-text');
         const continueText = document.querySelector('.continue-text');
         if (sparkText) {
             sparkText.style.opacity = '0';
             sparkText.style.visibility = 'hidden';
             sparkText.style.display = 'none';
         }
         if (continueText) {
             continueText.style.opacity = '0';
             continueText.style.visibility = 'hidden';
             continueText.style.display = 'none';
         }
         
         if (loader) {
             loader.style.display = 'none';
             loader.style.visibility = 'hidden';
             loader.style.opacity = '0';
             loader.style.pointerEvents = 'none';
             loader.style.zIndex = '-1';
             loader.classList.add('hidden');
         }
         
         if (websiteContent) {
             websiteContent.style.display = 'block';
             websiteContent.style.opacity = '1';
             websiteContent.style.visibility = 'visible';
             websiteContent.classList.add('revealed');
         }
         
         return; // Don't initialize the loader at all
     }
    
         // Initialize glowing orb animation
     D.Init();
    
    // Set up click handler and timer
    let hasProceeded = false;
    const loader = document.getElementById('loader');
    
                                                                                                                                                                    function proceedToHome() {
             if (hasProceeded) return;
             hasProceeded = true;
             
             console.log('Proceeding to home page');
             
             // Start orb growth effect
             D.isGrowing = true;
             D.growthTime = 0;
             
             // Create sparks from orb position (not mouse position)
             D.CreateSparks(D.centerX, D.centerY);
             
             // Hide text elements immediately
             const sparkText = document.querySelector('.spark-text');
             const continueText = document.querySelector('.continue-text');
             if (sparkText) {
                 sparkText.style.opacity = '0';
                 sparkText.style.visibility = 'hidden';
             }
             if (continueText) {
                 continueText.style.opacity = '0';
                 continueText.style.visibility = 'hidden';
             }
             
                          // Add bright pulse effect
              loader.classList.add('pulse');
              
              // Mark session as visited
              sessionStorage.setItem('hasVisitedHomeThisSession', 'true');
             
             // Show home page after white flash starts (at 600ms - during white phase)
             setTimeout(() => {
                 // Stop the glowing orb animation but keep sparks running
                 D.Cleanup();
                 
                 // Start spark-only animation
                 D.DrawSparksOnly();
                 
                 // Hide loader and show home page while flash is still white
                 loader.style.display = 'none';
                 loader.style.visibility = 'hidden';
                 loader.style.opacity = '0';
                 loader.style.pointerEvents = 'none';
                 loader.style.zIndex = '-1';
                 loader.classList.add('hidden');
                 
                 // Show website content
                 const websiteContent = document.getElementById('website-content');
                 if (websiteContent) {
                     websiteContent.style.display = 'block';
                     websiteContent.style.opacity = '1';
                     websiteContent.style.visibility = 'visible';
                     websiteContent.classList.add('revealed');
                 }
                 
                 console.log('Home page revealed during white flash');
             }, 600); // Show home page during white phase (2.0s total - 600ms = 1400ms white flash continues on home page)
        }
    
                   // Click handler
      loader.addEventListener('click', function(e) {
          proceedToHome();
      });
     
     // 20-second timer
     setTimeout(function() {
         proceedToHome();
     }, 20000);
    
         console.log('Glowing orb loader initialized - click or wait 20 seconds to proceed');
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