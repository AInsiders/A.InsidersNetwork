// Tawk Widget Diagnostic Tool
// This script helps identify and fix Tawk widget issues

class TawkDiagnostic {
  constructor() {
    this.issues = [];
    this.solutions = [];
    this.widgetId = '688b284b9abe48192a749848';
    this.widgetCodes = ['1j1fpapuu', '1j1s0h5i3'];
  }

  // Run comprehensive diagnostic
  runDiagnostic() {
    console.log('🔍 Starting Tawk Widget Diagnostic...');
    
    this.checkWidgetScripts();
    this.checkWidgetElements();
    this.checkAPI();
    this.checkConflicts();
    this.checkNetwork();
    
    this.generateReport();
  }

  // Check for Tawk scripts
  checkWidgetScripts() {
    console.log('📜 Checking Tawk scripts...');
    
    const scripts = document.querySelectorAll('script[src*="tawk.to"]');
    const inlineScripts = document.querySelectorAll('script:not([src])');
    
    if (scripts.length === 0) {
      this.issues.push('No Tawk scripts found');
      this.solutions.push('Add Tawk script to the page');
    } else {
      console.log(`Found ${scripts.length} Tawk scripts`);
      
      scripts.forEach((script, index) => {
        const src = script.src;
        console.log(`Script ${index + 1}: ${src}`);
        
        // Check for inconsistent widget codes
        this.widgetCodes.forEach(code => {
          if (src.includes(code)) {
            console.log(`✅ Found widget code: ${code}`);
          }
        });
      });
    }
    
    // Check for inline Tawk API initialization
    let hasInlineAPI = false;
    inlineScripts.forEach(script => {
      if (script.textContent.includes('Tawk_API')) {
        hasInlineAPI = true;
        console.log('✅ Found inline Tawk API initialization');
      }
    });
    
    if (!hasInlineAPI) {
      this.issues.push('No Tawk API initialization found');
      this.solutions.push('Add Tawk API initialization script');
    }
  }

  // Check for widget elements
  checkWidgetElements() {
    console.log('🎯 Checking widget elements...');
    
    const tawkElements = document.querySelectorAll('[id*="tawk"], [class*="tawk"]');
    const iframes = document.querySelectorAll('iframe[src*="tawk"]');
    
    console.log(`Found ${tawkElements.length} Tawk elements`);
    console.log(`Found ${iframes.length} Tawk iframes`);
    
    if (tawkElements.length === 0 && iframes.length === 0) {
      this.issues.push('No Tawk widget elements found');
      this.solutions.push('Widget may not be loading properly');
    }
    
    // Check for hidden elements
    let hiddenCount = 0;
    tawkElements.forEach(element => {
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') {
        hiddenCount++;
      }
    });
    
    if (hiddenCount > 0) {
      console.log(`⚠️ Found ${hiddenCount} hidden Tawk elements`);
      this.issues.push(`${hiddenCount} Tawk elements are hidden`);
      this.solutions.push('Check CSS rules that might be hiding the widget');
    }
  }

  // Check Tawk API
  checkAPI() {
    console.log('🔌 Checking Tawk API...');
    
    if (typeof Tawk_API === 'undefined') {
      this.issues.push('Tawk_API is not defined');
      this.solutions.push('Ensure Tawk script is loaded before checking API');
    } else {
      console.log('✅ Tawk_API is defined');
      
      // Check API methods
      const methods = ['maximize', 'minimize', 'hideWidget', 'showWidget'];
      methods.forEach(method => {
        if (typeof Tawk_API[method] === 'function') {
          console.log(`✅ Tawk_API.${method} is available`);
        } else {
          console.log(`❌ Tawk_API.${method} is not available`);
        }
      });
    }
  }

  // Check for conflicts
  checkConflicts() {
    console.log('⚡ Checking for conflicts...');
    
    // Check for multiple widget implementations
    const customWidgets = document.querySelectorAll('.custom-tawk-widget, .tawk-chat-button');
    const defaultWidgets = document.querySelectorAll('#tawkto-container, .tawkto-container');
    
    if (customWidgets.length > 0 && defaultWidgets.length > 0) {
      this.issues.push('Multiple widget implementations detected');
      this.solutions.push('Remove conflicting widget implementations');
    }
    
    // Check for CSS conflicts
    const styleSheets = Array.from(document.styleSheets);
    let tawkCSSRules = 0;
    
    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules);
        rules.forEach(rule => {
          if (rule.selectorText && rule.selectorText.includes('tawk')) {
            tawkCSSRules++;
          }
        });
      } catch (e) {
        // Cross-origin stylesheets may throw errors
      }
    });
    
    console.log(`Found ${tawkCSSRules} CSS rules affecting Tawk widgets`);
  }

  // Check network connectivity
  checkNetwork() {
    console.log('🌐 Checking network connectivity...');
    
    // Test Tawk domain accessibility
    const testImage = new Image();
    testImage.onload = () => {
      console.log('✅ Tawk domain is accessible');
    };
    testImage.onerror = () => {
      this.issues.push('Cannot access Tawk domain');
      this.solutions.push('Check network connectivity and firewall settings');
    };
    testImage.src = 'https://embed.tawk.to/favicon.ico';
  }

  // Generate diagnostic report
  generateReport() {
    console.log('\n📋 Tawk Widget Diagnostic Report');
    console.log('=====================================');
    
    if (this.issues.length === 0) {
      console.log('✅ No issues detected');
      console.log('The Tawk widget should be working properly');
    } else {
      console.log(`❌ Found ${this.issues.length} issues:`);
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
        if (this.solutions[index]) {
          console.log(`   💡 Solution: ${this.solutions[index]}`);
        }
      });
    }
    
    console.log('\n🔧 Recommended Actions:');
    console.log('1. Use the tawk-widget-fix.js script to fix issues');
    console.log('2. Ensure consistent widget codes across all pages');
    console.log('3. Remove conflicting widget implementations');
    console.log('4. Check browser console for JavaScript errors');
    console.log('5. Verify Tawk account settings and widget configuration');
  }

  // Test widget functionality
  testWidget() {
    console.log('🧪 Testing widget functionality...');
    
    if (typeof Tawk_API !== 'undefined') {
      try {
        if (typeof Tawk_API.maximize === 'function') {
          console.log('✅ Tawk_API.maximize is available');
          // Don't actually call it to avoid disrupting user experience
        }
        
        if (typeof Tawk_API.hideWidget === 'function') {
          console.log('✅ Tawk_API.hideWidget is available');
        }
      } catch (error) {
        console.error('❌ Error testing Tawk API:', error);
      }
    } else {
      console.log('❌ Tawk_API not available for testing');
    }
  }

  // Fix common issues
  fixCommonIssues() {
    console.log('🔧 Applying common fixes...');
    
    // Remove duplicate scripts
    const scripts = document.querySelectorAll('script[src*="tawk.to"]');
    if (scripts.length > 1) {
      console.log('Removing duplicate Tawk scripts...');
      for (let i = 1; i < scripts.length; i++) {
        scripts[i].remove();
      }
    }
    
    // Ensure consistent widget code
    const targetCode = '1j1s0h5i3';
    scripts.forEach(script => {
      if (script.src.includes('1j1fpapuu')) {
        console.log('Updating widget code to consistent version...');
        script.src = script.src.replace('1j1fpapuu', targetCode);
      }
    });
    
    console.log('✅ Common fixes applied');
  }
}

// Auto-run diagnostic when script is loaded
if (typeof document !== 'undefined') {
  const diagnostic = new TawkDiagnostic();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => diagnostic.runDiagnostic(), 2000);
    });
  } else {
    setTimeout(() => diagnostic.runDiagnostic(), 2000);
  }
  
  // Make diagnostic available globally
  window.TawkDiagnostic = diagnostic;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TawkDiagnostic;
}
