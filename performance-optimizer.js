// Performance Optimizer - Disable Heavy Systems for Fast Loading
(function() {
    'use strict';
    
    console.log('⚡ Performance Optimizer: Disabling heavy systems for fast loading...');
    
    // Disable heavy canvas animations
    window.DISABLE_CANVAS_ANIMATIONS = true;
    
    // Disable asset preloading
    window.DISABLE_ASSET_PRELOADING = true;
    
    // Disable cache management
    window.DISABLE_CACHE_MANAGEMENT = true;
    
    // Disable security monitoring (keep basic form validation)
    window.DISABLE_SECURITY_MONITORING = true;
    
    // Override heavy initialization functions
    window.initAINetwork = function() {
        console.log('⚡ Canvas animations disabled for performance');
        // Simple static background instead
        const canvas = document.getElementById('aiCanvas');
        if (canvas) {
            canvas.style.background = 'linear-gradient(135deg, rgba(0, 102, 255, 0.05), rgba(77, 148, 255, 0.05))';
            canvas.style.opacity = '0.1';
        }
    };
    
    // Override asset preloader
    if (window.assetPreloader) {
        window.assetPreloader.preloadPage = function() {
            console.log('⚡ Asset preloading disabled for performance');
        };
    }
    
    // Override browser cache manager
    if (window.browserCacheManager) {
        window.browserCacheManager.preloadPage = function() {
            console.log('⚡ Cache preloading disabled for performance');
        };
    }
    
    // Override security monitoring
    if (window.initEnhancedSecurity) {
        window.initEnhancedSecurity = function() {
            console.log('⚡ Security monitoring disabled for performance');
            // Keep only basic form validation
            initBasicFormValidation();
        };
    }
    
    // Basic form validation (lightweight)
    function initBasicFormValidation() {
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
    }
    
    // Fast page initialization
    document.addEventListener('DOMContentLoaded', function() {
        console.log('⚡ Fast page initialization...');
        
        // Hide loader immediately
        const loader = document.getElementById('loader');
        const websiteContent = document.getElementById('website-content');
        
        if (loader) {
            loader.style.display = 'none';
        }
        
        if (websiteContent) {
            websiteContent.style.display = 'block';
        }
        
        // Initialize basic functionality
        initBasicFormValidation();
        initFastNavigation();
        
        console.log('⚡ Page loaded successfully with performance optimizations!');
    });
    
    // Fast navigation (lightweight)
    function initFastNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', function() {
                navMenu.classList.toggle('active');
            });
        }
        
        // Smooth scrolling for anchor links
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
    }
    
    console.log('✅ Performance Optimizer loaded successfully');
})(); 