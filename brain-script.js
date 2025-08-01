// Brain Studio - Interactive JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all components
    initAINetwork();
    initScrollAnimations();

    initNavigation();
    initContactForm();
    initSmoothScrolling();
    
    // AI Network Canvas Animation
    function initAINetwork() {
        const canvas = document.getElementById('aiCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const nodes = [];
        const connections = [];
        
        // Mobile detection function
        function isMobileDevice() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   (window.innerWidth <= 768 && 'ontouchstart' in window);
        }
        
        // Responsive orb system based on screen ratio
        function getResponsiveNodeCount() {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const screenRatio = screenWidth / screenHeight;
            const screenArea = screenWidth * screenHeight;
            
            let level, count;
            
            // 5 levels based on screen ratio and area
            if (screenRatio >= 2.0 && screenArea >= 2000000) {
                // Ultra-wide desktop (21:9, 32:9, etc.) - Level 5
                level = 5;
                count = 200; // Increased from 150 to 200 for ultra-wide displays
            } else if (screenRatio >= 1.5 && screenArea >= 1500000) {
                // Wide desktop (16:10, 16:9) - Level 4
                level = 4;
                count = 100; // Increased from 60 to 100 for wide displays
            } else if (screenRatio >= 1.2 && screenArea >= 1000000) {
                // Standard desktop (4:3, 5:4) - Level 3
                level = 3;
                count = 45;
            } else if (screenRatio >= 0.8 && screenArea >= 500000) {
                // Tablet landscape - Level 2
                level = 2;
                count = 30;
            } else {
                // Mobile portrait or small screens - Level 1
                level = 1;
                count = 20;
            }
            
            // Log the responsive level for debugging
            console.log(`🎯 Responsive Orb System: Level ${level} (${count} orbs) - Screen: ${screenWidth}x${screenHeight}, Ratio: ${screenRatio.toFixed(2)}, Area: ${screenArea.toLocaleString()}`);
            
            return count;
        }
        
        // Responsive connection distance based on orb level
        function getResponsiveConnectionDistance() {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const screenRatio = screenWidth / screenHeight;
            const screenArea = screenWidth * screenHeight;
            
            let level, distance;
            
            // 5 levels of connection distance based on screen ratio and area
            if (screenRatio >= 2.0 && screenArea >= 2000000) {
                // Ultra-wide desktop (21:9, 32:9, etc.) - Level 5
                level = 5;
                distance = 200; // Longest connections for ultra-wide displays
            } else if (screenRatio >= 1.5 && screenArea >= 1500000) {
                // Wide desktop (16:10, 16:9) - Level 4
                level = 4;
                distance = 160; // Longer connections for wide displays
            } else if (screenRatio >= 1.2 && screenArea >= 1000000) {
                // Standard desktop (4:3, 5:4) - Level 3
                level = 3;
                distance = 140; // Medium connections for standard displays
            } else if (screenRatio >= 0.8 && screenArea >= 500000) {
                // Tablet landscape - Level 2
                level = 2;
                distance = 120; // Shorter connections for tablets
            } else {
                // Mobile portrait or small screens - Level 1
                level = 1;
                distance = 100; // Shortest connections for mobile
            }
            
            // Log the connection distance for debugging
            console.log(`🔗 Responsive Connection Distance: Level ${level} (${distance}px) - Screen: ${screenWidth}x${screenHeight}, Ratio: ${screenRatio.toFixed(2)}, Area: ${screenArea.toLocaleString()}`);
            
            return distance;
        }
        
        let nodeCount = getResponsiveNodeCount();
        
        let maxConnectionDistance = getResponsiveConnectionDistance();
        let performanceMode = false;
        let frameTime = 0;
        let lastFrameTime = 0;
        let animationId = null;
        let isVisible = true;
        
        // Check if we're on the contact page for color theming
        const isContactPage = document.body.classList.contains('contact-page');
        // Check if we're on the home page for mouse interactions
        const isHomePage = document.body.classList.contains('home-page');
        // Check if we're on the starting screen (loader)
        let isStartingScreen = false;
        
        // Log current page type for debugging
        const currentPage = document.body.className || 'unknown';
        console.log(`🌐 Current Page: ${currentPage} - Interactive Orbs: ${isHomePage || isStartingScreen ? 'Enabled' : 'Disabled (Passive Mode)'}`);
        
        // Function to update starting screen state
        function updateStartingScreenState() {
            const loader = document.querySelector('.loader');
            isStartingScreen = loader && !loader.classList.contains('hidden');
        }
        
        // Function to check if we should show the orb
        function shouldShowOrb() {
            const currentPath = window.location.pathname;
            const isToolsPage = currentPath.includes('tools.html');
            const isIpCheckerPage = currentPath.includes('ip-checker.html');
            const isUrlCheckerPage = currentPath.includes('url-redirect-checker.html');
            const isIpBlacklistPage = currentPath.includes('ip-blacklist-checker.html');
            const isAiTextDetectionPage = currentPath.includes('ai-text-detection.html');
            const isAppsPage = currentPath.includes('apps.html');
            const isAboutPage = currentPath.includes('about.html');
            const isContactPage = currentPath.includes('contact.html');

            
            // Exclude tools page and IP ban tester from interactive background to prevent mouse issues
            return isHomePage || isStartingScreen || isIpCheckerPage || isUrlCheckerPage || isAiTextDetectionPage || isAppsPage || isAboutPage || isContactPage;
        }
        const mouse = { 
            x: 0, 
            y: 0, 
            isMoving: false,
            moveTimeout: null
        };
        
        // Resize canvas with device pixel ratio optimization
        function resizeCanvas() {
            const rect = canvas.getBoundingClientRect();
            
            // Use display dimensions directly without DPR scaling for better orb positioning
            canvas.width = rect.width;
            canvas.height = rect.height;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
        }
        
        // Initialize nodes
        function initNodes() {
            for (let i = 0; i < nodeCount; i++) {
                nodes.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    size: Math.random() * 3 + 1,
                    pulse: Math.random() * Math.PI * 2,
                    originalSize: Math.random() * 3 + 1,
                    targetSize: Math.random() * 3 + 1,
                    interactionRadius: 80,
                    attractionForce: 0.01,
                    // Pre-calculated noise offsets for performance
                    noiseOffsetX: Math.random() * 1000,
                    noiseOffsetY: Math.random() * 1000
                });
            }
        }
        
        // Update node positions
        function updateNodes() {
            // First pass: Calculate node-to-node repulsion forces
            const repulsionForces = new Array(nodes.length).fill().map(() => ({ vx: 0, vy: 0 }));
            
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const nodeA = nodes[i];
                    const nodeB = nodes[j];
                    const dx = nodeB.x - nodeA.x;
                    const dy = nodeB.y - nodeA.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Apply repulsion force when nodes are too close
                    if (distance > 0 && distance < 60) {
                        const repulsionStrength = (60 - distance) / 60; // Stronger when closer
                        const force = repulsionStrength * 0.15; // Soft repulsion force
                        
                        // Normalize direction and apply force
                        const normalizedDx = dx / distance;
                        const normalizedDy = dy / distance;
                        
                        // Apply repulsion to both nodes (opposite directions)
                        repulsionForces[i].vx -= normalizedDx * force;
                        repulsionForces[i].vy -= normalizedDy * force;
                        repulsionForces[j].vx += normalizedDx * force;
                        repulsionForces[j].vy += normalizedDy * force;
                    }
                }
            }
            
            // Second pass: Update each node with all forces
            nodes.forEach((node, index) => {
                // Apply accumulated repulsion forces
                node.vx += repulsionForces[index].vx;
                node.vy += repulsionForces[index].vy;
                
                // Calculate distance to mouse for interactive effects (only on home page and starting screen)
                if (shouldShowOrb()) {
                    const dx = mouse.x - node.x;
                    const dy = mouse.y - node.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Interactive mouse effects (without gravity/pull)
                    if (distance < node.interactionRadius) {
                        // Visual scaling based on proximity (no movement)
                        const scaleFactor = 2.5;
                        node.targetSize = node.originalSize * (1 + (1 - distance / node.interactionRadius) * scaleFactor);
                        
                        // Add subtle repulsion effect for very close nodes to mouse
                        if (distance < 30) {
                            const repulsionForce = (30 - distance) * 0.02;
                            node.vx -= dx * repulsionForce;
                            node.vy -= dy * repulsionForce;
                        }
                    } else {
                        node.targetSize = node.originalSize;
                    }
                } else {
                    // On other pages, keep nodes at original size
                    node.targetSize = node.originalSize;
                }
                
                // Smooth size transition
                node.size += (node.targetSize - node.size) * 0.1;
                
                // Ultra-optimized movement for 120fps
                const time = Date.now() * 0.001;
                const noiseX = Math.sin(time + node.noiseOffsetX * 0.008) * 0.15; // Further reduced intensity
                const noiseY = Math.cos(time + node.noiseOffsetY * 0.008) * 0.15; // Further reduced intensity
                
                // Add wave-like movement (ultra-reduced frequency)
                node.vx += noiseX * 0.01; // Reduced from 0.015
                node.vy += noiseY * 0.01; // Reduced from 0.015
                
                // Add random movement for more liveliness (ultra-reduced frequency)
                if (Math.random() < 0.2) { // Only 20% of the time for 120fps
                    node.vx += (Math.random() - 0.5) * 0.008; // Reduced from 0.01
                    node.vy += (Math.random() - 0.5) * 0.008; // Reduced from 0.01
                }
                
                // Move nodes with dampening
                node.x += node.vx;
                node.y += node.vy;
                
                // Softer dampening for more movement
                node.vx *= 0.98;
                node.vy *= 0.98;
                
                // Higher velocity limits for more dynamic movement
                const maxVel = 2.5;
                node.vx = Math.max(-maxVel, Math.min(maxVel, node.vx));
                node.vy = Math.max(-maxVel, Math.min(maxVel, node.vy));
                
                // Bounce off edges with more energy
                if (node.x < 0 || node.x > canvas.width) {
                    node.vx *= -0.8;
                    node.x = Math.max(0, Math.min(canvas.width, node.x));
                }
                if (node.y < 0 || node.y > canvas.height) {
                    node.vy *= -0.8;
                    node.y = Math.max(0, Math.min(canvas.height, node.y));
                }
                
                // Faster pulse for more dynamic feel
                node.pulse += 0.025;
            });
        }
        
        // Draw connections between nearby nodes
        function drawConnections() {
            const time = Date.now() * 0.001;
            let connectionCount = 0;
            // Responsive connection limit based on node count
            const maxConnections = Math.min(nodeCount * 2, 200); // Scale with node count but cap at 200 for higher levels
            
            for (let i = 0; i < nodes.length && connectionCount < maxConnections; i++) {
                for (let j = i + 1; j < nodes.length && connectionCount < maxConnections; j++) {
                    const nodeA = nodes[i];
                    const nodeB = nodes[j];
                    const distance = Math.sqrt(
                        Math.pow(nodeA.x - nodeB.x, 2) + 
                        Math.pow(nodeA.y - nodeB.y, 2)
                    );
                    
                    if (distance < maxConnectionDistance) {
                        connectionCount++;
                        const opacity = 1 - (distance / maxConnectionDistance);
                        const alpha = opacity * 0.6;
                        
                        // Add pulsing effect to connections
                        const pulse = Math.sin(time * 2 + i * 0.5 + j * 0.3) * 0.2 + 0.8;
                        const finalAlpha = alpha * pulse;
                        
                        // Create enhanced gradient for connections
                        const gradient = ctx.createLinearGradient(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
                        if (isContactPage) {
                            // Black colors for contact page
                            gradient.addColorStop(0, `rgba(0, 0, 0, ${finalAlpha})`);
                            gradient.addColorStop(0.5, `rgba(50, 50, 50, ${finalAlpha * 1.2})`);
                            gradient.addColorStop(1, `rgba(0, 0, 0, ${finalAlpha})`);
                        } else {
                            // Original blue colors for other pages
                            gradient.addColorStop(0, `rgba(0, 102, 255, ${finalAlpha})`);
                            gradient.addColorStop(0.5, `rgba(77, 148, 255, ${finalAlpha * 1.2})`);
                            gradient.addColorStop(1, `rgba(0, 102, 255, ${finalAlpha})`);
                        }
                        
                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = opacity * 2.5;
                        ctx.lineCap = 'round';
                        ctx.beginPath();
                        ctx.moveTo(nodeA.x, nodeA.y);
                        ctx.lineTo(nodeB.x, nodeB.y);
                        ctx.stroke();
                        
                        // Add subtle glow effect
                        const glowColor = isContactPage ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 102, 255, 0.3)';
                        ctx.shadowColor = glowColor;
                        ctx.shadowBlur = 5;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                }
            }
            
            // Enhanced connections from mouse to nearby nodes (on home page and starting screen)
            if (shouldShowOrb() && mouse.isMoving) {
                let mouseConnectionCount = 0;
                // Responsive mouse connection limit based on node count
                const maxMouseConnections = Math.min(Math.floor(nodeCount * 0.3), 40); // Scale with node count but cap at 40 for higher levels
                
                nodes.forEach(node => {
                    if (mouseConnectionCount >= maxMouseConnections) return;
                    
                    const dx = mouse.x - node.x;
                    const dy = mouse.y - node.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 150) {
                        mouseConnectionCount++;
                        const opacity = (1 - distance / 150) * 0.9;
                        const pulse = Math.sin(time * 4) * 0.3 + 0.7;
                        const finalOpacity = opacity * pulse;
                        
                        // Create energy connection gradient
                        const gradient = ctx.createLinearGradient(mouse.x, mouse.y, node.x, node.y);
                        if (isContactPage) {
                            // Black colors for contact page
                            gradient.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity})`);
                            gradient.addColorStop(0.5, `rgba(0, 0, 0, ${finalOpacity * 0.8})`);
                            gradient.addColorStop(1, `rgba(50, 50, 50, ${finalOpacity * 0.6})`);
                        } else if (isStartingScreen) {
                            // White colors for starting screen
                            gradient.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity})`);
                            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${finalOpacity * 0.8})`);
                            gradient.addColorStop(1, `rgba(255, 255, 255, ${finalOpacity * 0.6})`);
                        } else {
                            // Original blue colors for home page
                            gradient.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity})`);
                            gradient.addColorStop(0.5, `rgba(0, 102, 255, ${finalOpacity * 0.8})`);
                            gradient.addColorStop(1, `rgba(77, 148, 255, ${finalOpacity * 0.6})`);
                        }
                        
                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = finalOpacity * 2.5;
                        ctx.lineCap = 'round';
                        ctx.beginPath();
                        ctx.moveTo(mouse.x, mouse.y);
                        ctx.lineTo(node.x, node.y);
                        ctx.stroke();
                        
                        // Add energy glow
                        const shadowColor = isContactPage ? 'rgba(0, 0, 0, 0.5)' : 
                                          isStartingScreen ? 'rgba(255, 255, 255, 0.5)' : 
                                          'rgba(255, 255, 255, 0.5)';
                        ctx.shadowColor = shadowColor;
                        ctx.shadowBlur = 8;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                });
            }
        }
        
        // Mouse trail function removed for 120fps performance
        
        // Draw nodes
        function drawNodes() {
            // Draw regular nodes
            nodes.forEach(node => {
                const pulseSize = Math.sin(node.pulse) * 0.5 + 1;
                const size = node.size * pulseSize;
                
                // Enhanced glow effect
                const gradient = ctx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, size * 4
                );
                
                if (isContactPage) {
                    // Black colors for contact page
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                    gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.8)');
                    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                } else {
                    // Original blue colors for other pages
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                    gradient.addColorStop(0.3, 'rgba(0, 102, 255, 0.8)');
                    gradient.addColorStop(0.7, 'rgba(0, 102, 255, 0.3)');
                    gradient.addColorStop(1, 'rgba(0, 102, 255, 0)');
                }
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(node.x, node.y, size * 4, 0, Math.PI * 2);
                ctx.fill();
                
                // Core node
                const coreColor = isContactPage ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 102, 255, 0.9)';
                ctx.fillStyle = coreColor;
                ctx.beginPath();
                ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Draw cursor orb (on home page or starting screen)
            if (shouldShowOrb()) {
                if (mouse.x !== -100 && mouse.y !== -100) {
                    const cursorSize = 8;
                    const pulseSize = Math.sin(Date.now() * 0.005) * 0.3 + 1;
                    const finalSize = cursorSize * pulseSize;
                    
                    // Cursor orb glow effect
                    const cursorGradient = ctx.createRadialGradient(
                        mouse.x, mouse.y, 0,
                        mouse.x, mouse.y, finalSize * 3
                    );
                    
                    if (isContactPage) {
                        cursorGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                        cursorGradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
                        cursorGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.4)');
                        cursorGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    } else {
                        // Fluorescent blue colors for mouse orb
                        cursorGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                        cursorGradient.addColorStop(0.3, 'rgba(0, 255, 255, 0.95)'); // Cyan
                        cursorGradient.addColorStop(0.5, 'rgba(0, 191, 255, 0.9)'); // Deep sky blue
                        cursorGradient.addColorStop(0.7, 'rgba(0, 150, 255, 0.6)'); // Dodger blue
                        cursorGradient.addColorStop(1, 'rgba(0, 100, 255, 0)'); // Royal blue
                    }
                    
                    ctx.fillStyle = cursorGradient;
                    ctx.beginPath();
                    ctx.arc(mouse.x, mouse.y, finalSize * 3, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Cursor orb core
                    const cursorCoreColor = isContactPage ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 255, 255, 1)'; // Fluorescent cyan core
                    ctx.fillStyle = cursorCoreColor;
                    ctx.beginPath();
                    ctx.arc(mouse.x, mouse.y, finalSize, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Add a subtle inner glow
                    const innerGlow = ctx.createRadialGradient(
                        mouse.x, mouse.y, 0,
                        mouse.x, mouse.y, finalSize * 0.5
                    );
                    innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)'); // Bright white center
                    innerGlow.addColorStop(0.5, 'rgba(0, 255, 255, 0.6)'); // Fluorescent cyan
                    innerGlow.addColorStop(1, 'rgba(0, 255, 255, 0)'); // Fade to transparent
                    
                    ctx.fillStyle = innerGlow;
                    ctx.beginPath();
                    ctx.arc(mouse.x, mouse.y, finalSize * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        // Mouse interaction for cursor orb and neural connections
        function handleMouseMove(e) {
            const rect = canvas.getBoundingClientRect();
            
            // Get mouse coordinates relative to canvas using pure user input (no DPR scaling)
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Apply coordinate correction for consistency
            const correctedX = Math.round(mouseX);
            const correctedY = Math.round(mouseY);
            
            // Check if mouse is actually over navbar or footer elements
            const navbar = document.querySelector('.navbar');
            const footer = document.querySelector('.footer');
            
            // Get navbar and footer bounding rectangles for precise detection
            const navbarRect = navbar ? navbar.getBoundingClientRect() : null;
            const footerRect = footer ? footer.getBoundingClientRect() : null;
            
            // Check if mouse is directly over navbar or footer (only on home page and starting screen)
            const isOverNavbar = navbarRect && 
                e.clientX >= navbarRect.left && 
                e.clientX <= navbarRect.right && 
                e.clientY >= navbarRect.top && 
                e.clientY <= navbarRect.bottom;
                
            const isOverFooter = footerRect && 
                e.clientX >= footerRect.left && 
                e.clientX <= footerRect.right && 
                e.clientY >= footerRect.top && 
                e.clientY <= footerRect.bottom;
            
            // Only handle mouse movement for interactive pages (home page and starting screen)
            if (isHomePage || isStartingScreen) {
                if (!isOverNavbar && !isOverFooter) {
                    // Ensure mouse position is within canvas bounds (using display dimensions)
                    mouse.x = Math.max(0, Math.min(canvas.width, correctedX));
                    mouse.y = Math.max(0, Math.min(canvas.height, correctedY));
                    
                    // Mouse trail tracking removed for 120fps performance
                } else {
                    // Hide cursor orb when directly over navbar or footer
                    mouse.x = -100;
                    mouse.y = -100;
                }
            } else {
                // On non-interactive pages (like tools page), don't track mouse for orb
                // This prevents mouse disappearing issues
                mouse.x = -100;
                mouse.y = -100;
            }
            
            // Set moving state for neural connections (works for both home page and starting screen)
            mouse.isMoving = true;
            clearTimeout(mouse.moveTimeout);
            mouse.moveTimeout = setTimeout(() => {
                mouse.isMoving = false;
            }, 200);
        }
        
        // Mouse enter/leave for neural interactions
        function handleMouseEnter() {
            // Only enable neural interactions on home page and starting screen
            if (isHomePage || isStartingScreen) {
                nodes.forEach(node => {
                    node.interactionRadius = 150;
                });
            }
        }
        
        function handleMouseLeave() {
            mouse.isMoving = false;
            // Only handle mouse leave on home page and starting screen
            if (isHomePage || isStartingScreen) {
                // Hide cursor orb by setting it off-screen when mouse leaves
                mouse.x = -100;
                mouse.y = -100;
            }
            nodes.forEach(node => {
                node.interactionRadius = 80;
            });
        }
        
        // Animation loop
        function animate() {
            // Skip animation if page is not visible
            if (!isVisible) {
                animationId = requestAnimationFrame(animate);
                return;
            }
            
            const startTime = performance.now();
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            updateNodes();
            drawConnections();
            
            // Mouse trail removed for 120fps performance
            
            drawNodes();
            
            // Performance monitoring
            frameTime = performance.now() - startTime;
            
            // Adjust performance mode based on frame time for 120fps target
            if (frameTime > 8.33) { // If frame time > 120fps threshold (8.33ms)
                if (!performanceMode) {
                    performanceMode = true;
                    // Reduce connection distance when performance is poor
                    const baseDistance = getResponsiveConnectionDistance();
                    maxConnectionDistance = Math.max(baseDistance * 0.6, maxConnectionDistance - 30);
                    console.log(`⚡ Performance mode activated: Reduced connection distance to ${maxConnectionDistance}px`);
                }
            } else if (frameTime < 6 && performanceMode) { // If performance is good for 120fps
                performanceMode = false;
                // Gradually restore connection distance to responsive level
                const baseDistance = getResponsiveConnectionDistance();
                maxConnectionDistance = Math.min(baseDistance, maxConnectionDistance + 15);
                console.log(`⚡ Performance mode deactivated: Restored connection distance to ${maxConnectionDistance}px`);
            }
            
            lastFrameTime = frameTime;
            animationId = requestAnimationFrame(animate);
        }
        
        // Handle visibility changes
        function handleVisibilityChange() {
            isVisible = !document.hidden;
        }
        
        // Initialize
        resizeCanvas();
        initNodes();
        
        // Log complete responsive configuration
        console.log(`🎯 Complete Responsive Configuration:`);
        console.log(`   📱 Page: ${document.body.className || 'unknown'}`);
        console.log(`   🎯 Orbs: ${nodeCount} (Level ${getResponsiveNodeCount() === 200 ? 5 : getResponsiveNodeCount() === 100 ? 4 : getResponsiveNodeCount() === 45 ? 3 : getResponsiveNodeCount() === 30 ? 2 : 1})`);
        console.log(`   🔗 Connections: ${maxConnectionDistance}px max distance`);
        console.log(`   🖱️  Interactive: ${isHomePage || isStartingScreen ? 'Yes' : 'No (Passive Mode)'}`);
        console.log(`   🎨 Theme: ${isContactPage ? 'Dark' : 'Blue'}`);
        
        // Initialize starting screen state
        updateStartingScreenState();
        
        // Also check immediately if we should show the orb
        const shouldShowOrbNow = shouldShowOrb();
        
        // Set up observer to watch for starting screen state changes
        const loader = document.querySelector('.loader');
        if (loader) {
            const observer = new MutationObserver(updateStartingScreenState);
            observer.observe(loader, { 
                attributes: true, 
                attributeFilter: ['class'] 
            });
        }
        
        // Touch event handlers for cursor orb and neural interactions
        function handleTouchStart(e) {
            if (!shouldShowOrb()) return;
            e.preventDefault();
            
            // Get the first touch point
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            
            // Get touch coordinates relative to canvas and scale by device pixel ratio
            const touchX = (touch.clientX - rect.left) * dpr;
            const touchY = (touch.clientY - rect.top) * dpr;
            
            // Apply additional mobile-specific corrections
            const correctedX = Math.round(touchX);
            const correctedY = Math.round(touchY);
            
            // Check if touch is actually over navbar or footer elements
            const navbar = document.querySelector('.navbar');
            const footer = document.querySelector('.footer');
            
            // Get navbar and footer bounding rectangles for precise detection
            const navbarRect = navbar ? navbar.getBoundingClientRect() : null;
            const footerRect = footer ? footer.getBoundingClientRect() : null;
            
            // Check if touch is directly over navbar or footer (only on home page and starting screen)
            const isOverNavbar = navbarRect && 
                touch.clientX >= navbarRect.left && 
                touch.clientX <= navbarRect.right && 
                touch.clientY >= navbarRect.top && 
                touch.clientY <= navbarRect.bottom;
                
            const isOverFooter = footerRect && 
                touch.clientX >= footerRect.left && 
                touch.clientX <= footerRect.right && 
                touch.clientY >= footerRect.top && 
                touch.clientY <= footerRect.bottom;
            
            // Only hide cursor orb when directly over navbar or footer on home page and starting screen
            if (isHomePage || isStartingScreen) {
                if (!isOverNavbar && !isOverFooter) {
                    // Ensure mouse position is within canvas bounds (using rect dimensions)
                    mouse.x = Math.max(0, Math.min(rect.width, correctedX));
                    mouse.y = Math.max(0, Math.min(rect.height, correctedY));
                } else {
                    // Hide cursor orb when directly over navbar or footer
                    mouse.x = -100;
                    mouse.y = -100;
                }
            } else {
                // On other pages, always show the cursor orb
                mouse.x = Math.max(0, Math.min(rect.width, correctedX));
                mouse.y = Math.max(0, Math.min(rect.height, correctedY));
            }
            
            mouse.isMoving = true;
            handleMouseEnter();
        }

        function handleTouchMove(e) {
            if (!shouldShowOrb()) return;
            e.preventDefault();
            
            // Get the first touch point
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            
            // Get touch coordinates relative to canvas and scale by device pixel ratio
            const touchX = (touch.clientX - rect.left) * dpr;
            const touchY = (touch.clientY - rect.top) * dpr;
            
            // Apply additional mobile-specific corrections
            const correctedX = Math.round(touchX);
            const correctedY = Math.round(touchY);
            
            // Check if touch is actually over navbar or footer elements
            const navbar = document.querySelector('.navbar');
            const footer = document.querySelector('.footer');
            
            // Get navbar and footer bounding rectangles for precise detection
            const navbarRect = navbar ? navbar.getBoundingClientRect() : null;
            const footerRect = footer ? footer.getBoundingClientRect() : null;
            
            // Check if touch is directly over navbar or footer (only on home page and starting screen)
            const isOverNavbar = navbarRect && 
                touch.clientX >= navbarRect.left && 
                touch.clientX <= navbarRect.right && 
                touch.clientY >= navbarRect.top && 
                touch.clientY <= navbarRect.bottom;
                
            const isOverFooter = footerRect && 
                touch.clientX >= footerRect.left && 
                touch.clientX <= footerRect.right && 
                touch.clientY >= footerRect.top && 
                touch.clientY <= footerRect.bottom;
            
            // Only hide cursor orb when directly over navbar or footer on home page and starting screen
            if (isHomePage || isStartingScreen) {
                if (!isOverNavbar && !isOverFooter) {
                    // Ensure mouse position is within canvas bounds (using display dimensions)
                    mouse.x = Math.max(0, Math.min(canvas.width, correctedX));
                    mouse.y = Math.max(0, Math.min(canvas.height, correctedY));
                } else {
                    // Hide cursor orb when directly over navbar or footer
                    mouse.x = -100;
                    mouse.y = -100;
                }
            } else {
                // On other pages, always show the cursor orb
                mouse.x = Math.max(0, Math.min(canvas.width, correctedX));
                mouse.y = Math.max(0, Math.min(canvas.height, correctedY));
            }
            
            mouse.isMoving = true;
            clearTimeout(mouse.moveTimeout);
            mouse.moveTimeout = setTimeout(() => {
                mouse.isMoving = false;
            }, 200);
        }

        function handleTouchEnd(e) {
            if (!isHomePage && !isStartingScreen) return;
            e.preventDefault();
            mouse.isMoving = false;
        }

        // Orientation change handler
        function handleOrientationChange() {
            setTimeout(() => {
                resizeCanvas();
                // Update node count and connection distance based on new orientation
                const newNodeCount = getResponsiveNodeCount();
                const newMaxConnectionDistance = getResponsiveConnectionDistance();
                
                // Always reinitialize on orientation change for better responsiveness
                nodeCount = newNodeCount;
                maxConnectionDistance = newMaxConnectionDistance;
                nodes.length = 0;
                initNodes();
                
                // Log the orientation change update
                console.log(`📱 Orientation Change: ${nodeCount} orbs, ${maxConnectionDistance}px connections`);
            }, 100);
        }

        // Add event listeners for mouse and touch (conditional based on device type)
        if (shouldShowOrb()) {
            // Mouse events - always enabled for PC users
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseenter', handleMouseEnter);
            canvas.addEventListener('mouseleave', handleMouseLeave);
            
            // Touch events - only enabled for non-mobile devices (PC users with touch screens)
            if (!isMobileDevice()) {
                canvas.addEventListener('touchstart', handleTouchStart, { 
                    passive: false, 
                    capture: false 
                });
                canvas.addEventListener('touchmove', handleTouchMove, { 
                    passive: false, 
                    capture: false 
                });
                canvas.addEventListener('touchend', handleTouchEnd, { 
                    passive: false, 
                    capture: false 
                });
                canvas.addEventListener('touchcancel', handleTouchEnd, { 
                    passive: false, 
                    capture: false 
                });
                
                // Prevent default touch behaviors that might interfere
                canvas.addEventListener('touchstart', (e) => {
                    if (e.touches.length === 1) {
                        e.preventDefault();
                    }
                }, { passive: false });
                
                console.log('🖱️ Interactive background enabled for PC users');
            } else {
                console.log('📱 Interactive background disabled for mobile users to improve scrolling');
            }
        }
        
        // Enhanced resize handler with orientation support
        window.addEventListener('resize', () => {
            resizeCanvas();
            // Debounce node reinitialization for better performance
            clearTimeout(window.resizeTimeout);
            window.resizeTimeout = setTimeout(() => {
                // Update node count and connection distance based on new screen size
                const newNodeCount = getResponsiveNodeCount();
                const newMaxConnectionDistance = getResponsiveConnectionDistance();
                
                // Only reinitialize if the counts actually changed
                if (newNodeCount !== nodeCount || newMaxConnectionDistance !== maxConnectionDistance) {
                    nodeCount = newNodeCount;
                    maxConnectionDistance = newMaxConnectionDistance;
                    nodes.length = 0;
                    initNodes();
                    
                    // Log the responsive update
                    console.log(`🔄 Responsive Update: ${nodeCount} orbs, ${maxConnectionDistance}px connections`);
                }
            }, 300);
        });
        
        // Orientation change support
        window.addEventListener('orientationchange', handleOrientationChange);
        
        // Visibility change support for performance
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        animate();
    }
    
    // Scroll-triggered animations
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);
        
        // Observe all fade sections
        const fadeSections = document.querySelectorAll('.fade-section');
        fadeSections.forEach(section => observer.observe(section));
        
        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            if (hero) {
                hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });
    }
    

    
    // Navigation
    function initNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Mobile menu toggle
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
        
        // Close mobile menu when clicking on links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Don't prevent default for external links
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#')) {
                    // Allow external navigation
                    return;
                }
                
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
        
        // Active navigation highlighting
        const sections = document.querySelectorAll('section[id]');
        const navItems = document.querySelectorAll('.nav-link');
        
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });
            
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${current}`) {
                    item.classList.add('active');
                }
            });
        });
        
        // Navbar background on scroll
        const navbar = document.querySelector('.navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(0, 0, 0, 0.98)';
            } else {
                navbar.style.background = 'rgba(0, 0, 0, 0.95)';
            }
        });
    }
    
    // Contact form - NO VALIDATION, let FormSubmit handle it
    function initContactForm() {
        const form = document.querySelector('.contact-form');
        if (!form) return;
        
        // Remove any existing event listeners to prevent conflicts
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // Let the form submit naturally to FormSubmit
        // No JavaScript validation - HTML5 validation will handle required fields
    }
    
    // Smooth scrolling for anchor links
    function initSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                // Only prevent default for actual anchor links, not external links
                const href = link.getAttribute('href');
                if (href.startsWith('#') && href !== '#') {
                    e.preventDefault();
                    
                    const targetId = href;
                    const targetSection = document.querySelector(targetId);
                    
                    if (targetSection) {
                        const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                        
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                    notification.style.background = '#0066ff';
    notification.style.color = '#ffffff';
                break;
            case 'error':
                notification.style.background = '#ff4757';
                break;
            default:
                notification.style.background = '#3742fa';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }
    
    // Service card hover effects
    function initServiceCardEffects() {
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    // Team member hover effects
    function initTeamMemberEffects() {
        const teamMembers = document.querySelectorAll('.team-member');
        
        teamMembers.forEach(member => {
            member.addEventListener('mouseenter', () => {
                member.style.transform = 'translateY(-10px)';
            });
            
            member.addEventListener('mouseleave', () => {
                member.style.transform = 'translateY(0)';
            });
        });
    }
    
    // Initialize additional effects
    initServiceCardEffects();
    initTeamMemberEffects();
    
    // Performance optimization: Throttle scroll events
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    // Apply throttling to scroll events
    window.addEventListener('scroll', throttle(() => {
        // Scroll-based effects can be added here
    }, 16)); // ~60fps
    

    
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        // Escape key closes mobile menu
        if (e.key === 'Escape') {
            const navMenu = document.querySelector('.nav-menu');
            const navToggle = document.querySelector('.nav-toggle');
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        }
    });
    

    
         console.log('🤖 AI Nexus initialized successfully!');
     
     // Security: Block right-click and inspect element (only after 3 user inputs within 10 seconds)
     function initSecurity() {
         // User input tracking variables
         let userInputCount = 0;
         let lastInputTime = 0;
         let securityEnabled = false;
         
         // F12/Developer Tools Related Jokes
         const f12Jokes = [
             "F12? In this economy? Try Ctrl+Alt+Delete on your career instead",
             "Developer tools? More like developer fools!",
             "Console.log this: You're not getting in here",
             "F12 is not the answer to life, the universe, and everything",
             "Developer tools detected. Initiating 'go touch grass' protocol",
             "Your debugging skills are as good as your social skills",
             "F12 won't help you debug your life problems",
             "Console access denied. Try accessing some fresh air instead",
             "Developer tools are like your ex - not welcome here",
             "F12 is not a magic button, and neither are you",
             "Console.log('You shall not pass!')",
             "F12 won't make you a developer, just like wearing a cape won't make you Superman",
             "Developer tools are like your diet - not happening today",
             "F12 is not the answer. The answer is 42, and you still can't access this",
             "Console access denied. Try accessing some real friends instead",
             "Developer tools are like your New Year's resolutions - broken",
             "F12 won't help you debug your relationship issues",
             "Console.log('Nice try, but no cigar')",
             "F12 is not a shortcut to success, just like Ctrl+Z won't undo your mistakes",
             "Developer tools are like your gym membership - unused",
             "F12 won't make you a hacker, just like wearing black won't make you cool",
             "Console access denied. Try accessing some sunlight instead",
             "Developer tools are like your cooking skills - non-existent",
             "F12 is not the key to happiness, just like your password isn't 'password'",
             "Console.log('You're not getting in, no matter how hard you try')",
             "F12 won't help you debug your social life",
             "Developer tools are like your savings account - empty",
             "F12 is not a magic wand, and neither is your mouse",
             "Console access denied. Try accessing some real food instead",
             "Developer tools are like your dating life - complicated",
             "F12 won't make you a genius, just like reading this won't either",
             "Console.log('Access denied. Try again never')",
             "F12 is not the solution, just like your excuses aren't either",
             "Developer tools are like your phone battery - always dying",
             "F12 won't help you debug your fashion choices",
             "Console access denied. Try accessing some real music instead",
             "Developer tools are like your car - always breaking down",
             "F12 is not a life hack, just like your life isn't a hack",
             "Console.log('You're not getting past this security')",
             "F12 won't make you a programmer, just like wearing glasses won't make you smart",
             "Developer tools are like your diet - always failing",
             "F12 is not the answer to your problems, just like this joke isn't either",
             "Console access denied. Try accessing some real entertainment instead",
             "Developer tools are like your sleep schedule - messed up",
             "F12 won't help you debug your personality",
             "Console.log('Access denied. Try again in another life')",
             "F12 is not a cheat code, just like your life isn't a game",
             "Developer tools are like your internet connection - unreliable",
             "F12 won't make you a coder, just like wearing a hoodie won't make you a hacker",
             "Console access denied. Try accessing some real conversation instead",
             "Developer tools are like your phone signal - weak",
             "F12 is not a superpower, just like your persistence isn't either",
             "Console.log('You're not getting in, no matter how many times you try')",
             "F12 won't help you debug your life choices",
             "Developer tools are like your cooking - always burning",
             "F12 is not a magic button, just like your mouse isn't a wand",
             "Console access denied. Try accessing some real friends instead",
             "Developer tools are like your car keys - always lost",
             "F12 won't make you a developer, just like reading this won't make you funny",
             "Console.log('Access denied. Try again when pigs fly')",
             "F12 is not a life hack, just like your life isn't a hackathon",
             "Developer tools are like your diet - always cheating",
             "F12 won't help you debug your social skills",
             "Console access denied. Try accessing some real food instead"
         ];

         // Right-Click Related Jokes
         const rightClickJokes = [
             "Right-click denied. Left-click your way out of here",
             "Right-click is so 2005. We're living in 2024, get with the program",
             "Right-click blocked. Left-click your way to success",
             "Right-click is disabled. So is your ability to mind your own business",
             "Right-click denied. Try clicking the X button instead",
             "Right-click blocked. Left-click your way to the exit",
             "Right-click is so last decade. We're living in the future now",
             "Right-click denied. Try clicking the refresh button on your life",
             "Right-click blocked. Left-click your way to productivity",
             "Right-click is disabled. So is your ability to take a hint",
             "Right-click denied. Try clicking the minimize button instead",
             "Right-click blocked. Left-click your way to enlightenment",
             "Right-click is so basic. We're living in advanced mode here",
             "Right-click denied. Try clicking the power button instead",
             "Right-click blocked. Left-click your way to wisdom",
             "Right-click is disabled. So is your ability to read the room",
             "Right-click denied. Try clicking the home button instead",
             "Right-click blocked. Left-click your way to success",
             "Right-click is so yesterday. We're living in tomorrow",
             "Right-click denied. Try clicking the close button instead",
             "Right-click blocked. Left-click your way to greatness",
             "Right-click is disabled. So is your ability to give up",
             "Right-click denied. Try clicking the back button instead",
             "Right-click blocked. Left-click your way to victory",
             "Right-click is so old school. We're living in the future",
             "Right-click denied. Try clicking the minimize button instead",
             "Right-click blocked. Left-click your way to success"
         ];

         // Function to track user inputs
         function trackUserInput() {
             const currentTime = Date.now();
             
             // Reset counter if more than 10 seconds have passed
             if (currentTime - lastInputTime > 10000) {
                 userInputCount = 0;
             }
             
             userInputCount++;
             lastInputTime = currentTime;
             
             // Enable security after 3 inputs within 10 seconds
             if (userInputCount >= 3) {
                 securityEnabled = true;
                 // Reset counter after enabling security
                 userInputCount = 0;
             }
         }

         // Function to get random F12 joke
         function getRandomF12Joke() {
             return f12Jokes[Math.floor(Math.random() * f12Jokes.length)];
         }

         // Function to get random right-click joke
         function getRandomRightClickJoke() {
             return rightClickJokes[Math.floor(Math.random() * rightClickJokes.length)];
         }

         // Function to show security joke notification
         function showSecurityJoke(jokeType = 'f12') {
             // Only show joke if security is enabled
             if (!securityEnabled) return;
             
             const joke = jokeType === 'rightclick' ? getRandomRightClickJoke() : getRandomF12Joke();
             const notification = document.createElement('div');
             notification.className = 'security-joke-notification';
             notification.innerHTML = `
                 <div class="joke-content">
                     <span class="joke-icon">🤖</span>
                     <span class="joke-text">${joke}</span>
                 </div>
             `;
             
             // Add styles
             notification.style.cssText = `
                 position: fixed;
                 top: 20px;
                 right: 20px;
                 background: linear-gradient(135deg, #ff4757, #ff3742);
                 color: white;
                 padding: 15px 20px;
                 border-radius: 10px;
                 font-family: 'Arial', sans-serif;
                 font-size: 14px;
                 font-weight: 600;
                 z-index: 10000;
                 transform: translateX(120%);
                 transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                 max-width: 350px;
                 box-shadow: 0 10px 30px rgba(255, 71, 87, 0.3);
                 border: 2px solid rgba(255, 255, 255, 0.2);
             `;
             
             // Add joke content styles
             const jokeContent = notification.querySelector('.joke-content');
             jokeContent.style.cssText = `
                 display: flex;
                 align-items: center;
                 gap: 10px;
             `;
             
             const jokeIcon = notification.querySelector('.joke-icon');
             jokeIcon.style.cssText = `
                 font-size: 20px;
                 animation: bounce 0.6s ease-in-out;
             `;
             
             const jokeText = notification.querySelector('.joke-text');
             jokeText.style.cssText = `
                 line-height: 1.4;
             `;
             
             // Add bounce animation
             const style = document.createElement('style');
             style.textContent = `
                 @keyframes bounce {
                     0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                     40% { transform: translateY(-10px); }
                     60% { transform: translateY(-5px); }
                 }
             `;
             document.head.appendChild(style);
             
             document.body.appendChild(notification);
             
             // Animate in
             setTimeout(() => {
                 notification.style.transform = 'translateX(0)';
             }, 100);
             
             // Remove after 4 seconds
             setTimeout(() => {
                 notification.style.transform = 'translateX(120%)';
                 setTimeout(() => {
                     if (document.body.contains(notification)) {
                         document.body.removeChild(notification);
                     }
                 }, 400);
             }, 4000);
         }

         // Track user inputs from various sources
         document.addEventListener('click', trackUserInput);
         document.addEventListener('keydown', trackUserInput);
         document.addEventListener('input', trackUserInput);
         document.addEventListener('scroll', trackUserInput);

         // Block right-click context menu (only when security is enabled)
         document.addEventListener('contextmenu', function(e) {
             if (securityEnabled) {
                 e.preventDefault();
                 showSecurityJoke('rightclick');
                 return false;
             }
         });
         
         // Block F12 key (inspect element) - only when security is enabled
         document.addEventListener('keydown', function(e) {
             if (securityEnabled && (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.shiftKey && e.key === 'J') || (e.ctrlKey && e.key === 'U'))) {
                 e.preventDefault();
                 showSecurityJoke('f12');
                 return false;
             }
         });
         
         // Block developer tools via console.log detection (only when security is enabled)
         let devtools = { open: false, orientation: null };
         setInterval(() => {
             if (securityEnabled) {
                 const threshold = 160;
                 if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
                     if (!devtools.open) {
                         devtools.open = true;
                         showSecurityJoke('f12');
                     }
                 } else {
                     devtools.open = false;
                 }
             }
         }, 500);
         
         // Disable text selection (only when security is enabled)
         document.addEventListener('selectstart', function(e) {
             if (securityEnabled) {
                 e.preventDefault();
                 return false;
             }
         });
         
         // Disable drag and drop (only when security is enabled)
         document.addEventListener('dragstart', function(e) {
             if (securityEnabled) {
                 e.preventDefault();
                 return false;
             }
         });
     }
     
     // Initialize security features
     initSecurity();
 }); 