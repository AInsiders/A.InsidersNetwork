// Fast Loader - Immediate Page Display
(function() {
    'use strict';
    
    console.log('⚡ Fast Loader: Enabling immediate page display...');
    
    // Immediately show content and hide loader
    function showPageImmediately() {
        const loader = document.getElementById('loader');
        const websiteContent = document.getElementById('website-content');
        
        if (loader) {
            loader.style.display = 'none';
        }
        
        if (websiteContent) {
            websiteContent.style.display = 'block';
        }
        
        console.log('⚡ Page content displayed immediately');
    }
    
    // Disable heavy systems
    function disableHeavySystems() {
        // Disable service worker registration
        if (navigator.serviceWorker) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                    registration.unregister();
                }
            });
        }
        
        // Disable cache operations
        if ('caches' in window) {
            caches.keys().then(function(names) {
                for (let name of names) {
                    caches.delete(name);
                }
            });
        }
        
        // Override heavy initialization functions
        window.initAINetwork = function() {
            console.log('⚡ Canvas animations disabled');
            const canvas = document.getElementById('aiCanvas');
            if (canvas) {
                canvas.style.background = 'linear-gradient(135deg, rgba(0, 102, 255, 0.05), rgba(77, 148, 255, 0.05))';
                canvas.style.opacity = '0.1';
            }
        };
        
        // Override asset preloader
        if (window.assetPreloader) {
            window.assetPreloader.preloadPage = function() {
                console.log('⚡ Asset preloading disabled');
            };
        }
        
        // Override browser cache manager
        if (window.browserCacheManager) {
            window.browserCacheManager.preloadPage = function() {
                console.log('⚡ Cache preloading disabled');
            };
        }
        
        console.log('⚡ Heavy systems disabled');
    }
    
    // Initialize basic functionality
    function initBasicFunctionality() {
        // Form validation
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                const requiredFields = form.querySelectorAll('[required]');
                let isValid = true;
                
                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.style.borderColor = '#ef4444';
                    } else {
                        field.style.borderColor = '#10b981';
                    }
                });
                
                if (!isValid) {
                    e.preventDefault();
                    alert('Please fill in all required fields.');
                }
            });
        });
        
        // Mobile navigation
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', function() {
                navMenu.classList.toggle('active');
            });
        }
        
        // Smooth scrolling
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        console.log('⚡ Basic functionality initialized');
    }
    
    // Execute immediately
    showPageImmediately();
    disableHeavySystems();
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBasicFunctionality);
    } else {
        initBasicFunctionality();
    }
    
    console.log('✅ Fast Loader activated successfully');
})(); 