/**
 * Security Enhancement Module for A.Insiders
 * Comprehensive client-side security without breaking existing functionality
 * Version: 1.0.0
 */

(function() {
    'use strict';
    
    // Security Configuration
    const SECURITY_CONFIG = {
        // Rate limiting
        maxRequestsPerMinute: 10,
        maxFormSubmissionsPerHour: 5,
        
        // Input validation patterns
        patterns: {
            email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            name: /^[a-zA-Z\s'-]{2,50}$/,
            phone: /^[\+]?[1-9][\d]{0,15}$/,
            message: /^[\w\s\.,!?@#$%^&*()_+\-=\[\]{};':"\\|<>\/]{10,1000}$/
        },
        
        // Security monitoring
        enableF12Detection: true,
        enableRightClickProtection: true,
        enableCopyProtection: true,
        enableViewSourceProtection: true,
        
        // Honeypot configuration
        honeypotFieldName: 'website_url',
        honeypotFieldClass: 'honeypot-field'
    };
    
    // Security state
    let securityState = {
        requestCount: 0,
        lastRequestTime: 0,
        formSubmissionCount: 0,
        lastFormSubmissionTime: 0,
        securityEnabled: true
    };
    
    // Initialize enhanced security features
    function initEnhancedSecurity() {
        console.log('🔒 Initializing A.Insiders Enhanced Security System...');
        
        // Initialize all security modules
        initFormSecurity();
        initSecurityMonitoring();
        initContentSecurityPolicy();
        
        console.log('✅ Enhanced Security System Initialized Successfully');
    }
    
    // ===== FORM SECURITY =====
    function initFormSecurity() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Add honeypot field
            addHoneypotField(form);
            
            // Add form submission protection
            form.addEventListener('submit', handleFormSubmission);
            
            // Add real-time validation
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('input', validateInput);
                input.addEventListener('blur', validateInput);
            });
        });
    }
    
    function addHoneypotField(form) {
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = SECURITY_CONFIG.honeypotFieldName;
        honeypot.className = SECURITY_CONFIG.honeypotFieldClass;
        honeypot.style.cssText = 'position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none;';
        honeypot.setAttribute('tabindex', '-1');
        honeypot.setAttribute('autocomplete', 'off');
        
        form.appendChild(honeypot);
    }
    
    function handleFormSubmission(event) {
        const form = event.target;
        const honeypot = form.querySelector('.' + SECURITY_CONFIG.honeypotFieldClass);
        
        // Check honeypot
        if (honeypot && honeypot.value.trim() !== '') {
            event.preventDefault();
            showSecurityAlert('Bot detected. Form submission blocked.');
            return false;
        }
        
        // Check rate limiting
        if (!checkRateLimit()) {
            event.preventDefault();
            showSecurityAlert('Too many form submissions. Please wait before trying again.');
            return false;
        }
        
        // Validate all inputs
        const inputs = form.querySelectorAll('input, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateInput({ target: input })) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            event.preventDefault();
            showSecurityAlert('Please correct the errors before submitting.');
            return false;
        }
        
        // Increment submission count
        securityState.formSubmissionCount++;
        securityState.lastFormSubmissionTime = Date.now();
        
        console.log('✅ Form submission validated and allowed');
    }
    
    // ===== INPUT VALIDATION =====
    function validateInput(event) {
        const input = event.target;
        const value = input.value.trim();
        const type = input.type || input.name;
        
        // Remove existing error styling
        input.classList.remove('error');
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Skip validation for honeypot fields
        if (input.className.includes('honeypot-field')) {
            return true;
        }
        
        let isValid = true;
        let errorMessage = '';
        
        // Validate based on input type
        switch (type) {
            case 'email':
                if (value && !SECURITY_CONFIG.patterns.email.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address.';
                }
                break;
                
            case 'name':
                if (value && !SECURITY_CONFIG.patterns.name.test(value)) {
                    isValid = false;
                    errorMessage = 'Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes.';
                }
                break;
                
            case 'message':
                if (value && !SECURITY_CONFIG.patterns.message.test(value)) {
                    isValid = false;
                    errorMessage = 'Message must be 10-1000 characters and contain only safe characters.';
                }
                break;
        }
        
        // Apply validation result
        if (!isValid) {
            input.classList.add('error');
            showInputError(input, errorMessage);
        }
        
        return isValid;
    }
    
    function showInputError(input, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'color: #ff6b6b; font-size: 0.875rem; margin-top: 0.25rem;';
        errorDiv.textContent = message;
        
        input.parentNode.appendChild(errorDiv);
    }
    
    // ===== RATE LIMITING =====
    function checkRateLimit() {
        const now = Date.now();
        const oneMinute = 60 * 1000;
        const oneHour = 60 * 60 * 1000;
        
        // Reset counters if time has passed
        if (now - securityState.lastRequestTime > oneMinute) {
            securityState.requestCount = 0;
        }
        
        if (now - securityState.lastFormSubmissionTime > oneHour) {
            securityState.formSubmissionCount = 0;
        }
        
        // Check limits
        if (securityState.requestCount >= SECURITY_CONFIG.maxRequestsPerMinute) {
            return false;
        }
        
        if (securityState.formSubmissionCount >= SECURITY_CONFIG.maxFormSubmissionsPerHour) {
            return false;
        }
        
        // Increment request count
        securityState.requestCount++;
        securityState.lastRequestTime = now;
        
        return true;
    }
    
    // ===== SECURITY MONITORING =====
    function initSecurityMonitoring() {
        if (SECURITY_CONFIG.enableF12Detection) {
            initF12Detection();
        }
        
        if (SECURITY_CONFIG.enableRightClickProtection) {
            initRightClickProtection();
        }
        
        if (SECURITY_CONFIG.enableCopyProtection) {
            initCopyProtection();
        }
        
        if (SECURITY_CONFIG.enableViewSourceProtection) {
            initViewSourceProtection();
        }
    }
    
    function initF12Detection() {
        // Enhanced F12 detection
        let devtools = {
            open: false,
            orientation: null
        };
        
        const threshold = 160;
        
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    handleSecurityViolation('F12');
                }
            } else {
                devtools.open = false;
            }
        }, 500);
        
        // Additional detection methods
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || 
                (e.ctrlKey && e.shiftKey && e.key === 'J') || (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
                handleSecurityViolation('F12');
            }
        });
    }
    
    function initRightClickProtection() {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            handleSecurityViolation('right-click');
        });
    }
    
    function initCopyProtection() {
        // Prevent text selection
        document.addEventListener('selectstart', function(e) {
            e.preventDefault();
        });
        
        // Prevent copy
        document.addEventListener('copy', function(e) {
            e.preventDefault();
            handleSecurityViolation('copy');
        });
        
        // Prevent cut
        document.addEventListener('cut', function(e) {
            e.preventDefault();
            handleSecurityViolation('cut');
        });
    }
    
    function initViewSourceProtection() {
        // Detect view source attempts
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'U') {
                e.preventDefault();
                handleSecurityViolation('view-source');
            }
        });
    }
    
    function handleSecurityViolation(type) {
        const violations = {
            'F12': 'Developer tools detected. Access denied.',
            'right-click': 'Right-click is disabled on this site.',
            'copy': 'Copying content is not allowed.',
            'cut': 'Cutting content is not allowed.',
            'view-source': 'View source is disabled.'
        };
        
        showSecurityAlert(violations[type] || 'Security violation detected.');
        
        // Log violation
        console.warn(`🚨 Security violation: ${type}`);
    }
    
    // ===== CONTENT SECURITY POLICY =====
    function initContentSecurityPolicy() {
        // Add CSP meta tag if not already present
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            const cspMeta = document.createElement('meta');
            cspMeta.httpEquiv = 'Content-Security-Policy';
            cspMeta.content = [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://formsubmit.co https://cdnjs.cloudflare.com https://kit.fontawesome.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
                "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
                "img-src 'self' data: https:",
                "connect-src 'self' https://formsubmit.co https://api.github.com",
                "frame-src 'none'",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self' https://formsubmit.co"
            ].join('; ');
            
            document.head.appendChild(cspMeta);
        }
    }
    
    // ===== UTILITY FUNCTIONS =====
    function showSecurityAlert(message) {
        // Create security alert
        const alert = document.createElement('div');
        alert.className = 'security-alert';
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
            animation: slideIn 0.3s ease;
        `;
        
        alert.textContent = message;
        
        // Add animation styles
        if (!document.querySelector('#security-styles')) {
            const style = document.createElement('style');
            style.id = 'security-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .error { border-color: #ff6b6b !important; }
                .security-alert { animation: slideIn 0.3s ease; }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(alert);
        
        // Remove alert after 5 seconds
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 300);
        }, 5000);
    }
    
    // ===== INITIALIZATION =====
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEnhancedSecurity);
    } else {
        initEnhancedSecurity();
    }
    
    // Export for global access
    window.AInsidersSecurity = {
        init: initEnhancedSecurity,
        config: SECURITY_CONFIG,
        state: securityState
    };
    
})(); 