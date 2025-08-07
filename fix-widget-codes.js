// Fix Widget Codes Script
// This script automatically fixes inconsistent Tawk widget codes across all HTML files

const fs = require('fs');
const path = require('path');

// Configuration
const OLD_WIDGET_CODE = '1j1fpapuu';
const NEW_WIDGET_CODE = '1j1s0h5i3';
const WIDGET_ID = '688b284b9abe48192a749848';

// Get all HTML files in the current directory
function getHtmlFiles() {
    const files = fs.readdirSync('.');
    return files.filter(file => file.endsWith('.html'));
}

// Fix widget codes in a single file
function fixWidgetCodesInFile(filename) {
    console.log(`Processing: ${filename}`);
    
    try {
        let content = fs.readFileSync(filename, 'utf8');
        let modified = false;
        
        // Fix widget codes in script src attributes
        const scriptSrcRegex = new RegExp(`(https://embed\\.tawk\\.to/${WIDGET_ID}/)${OLD_WIDGET_CODE}`, 'g');
        if (scriptSrcRegex.test(content)) {
            content = content.replace(scriptSrcRegex, `$1${NEW_WIDGET_CODE}`);
            modified = true;
            console.log(`  ✅ Fixed script src in ${filename}`);
        }
        
        // Fix widget codes in chat URLs
        const chatUrlRegex = new RegExp(`(https://tawk\\.to/chat/${WIDGET_ID}/)${OLD_WIDGET_CODE}`, 'g');
        if (chatUrlRegex.test(content)) {
            content = content.replace(chatUrlRegex, `$1${NEW_WIDGET_CODE}`);
            modified = true;
            console.log(`  ✅ Fixed chat URL in ${filename}`);
        }
        
        // Fix widget codes in browser-cache-manager.js references
        const cacheManagerRegex = new RegExp(`('https://embed\\.tawk\\.to/${WIDGET_ID}/)${OLD_WIDGET_CODE}(')`, 'g');
        if (cacheManagerRegex.test(content)) {
            content = content.replace(cacheManagerRegex, `$1${NEW_WIDGET_CODE}$2`);
            modified = true;
            console.log(`  ✅ Fixed cache manager reference in ${filename}`);
        }
        
        if (modified) {
            fs.writeFileSync(filename, content, 'utf8');
            console.log(`  💾 Saved changes to ${filename}`);
        } else {
            console.log(`  ℹ️  No changes needed in ${filename}`);
        }
        
        return modified;
    } catch (error) {
        console.error(`  ❌ Error processing ${filename}:`, error.message);
        return false;
    }
}

// Main function
function fixAllWidgetCodes() {
    console.log('🔧 Starting Tawk Widget Code Fix...');
    console.log(`📝 Converting from: ${OLD_WIDGET_CODE} to: ${NEW_WIDGET_CODE}`);
    console.log('=====================================');
    
    const htmlFiles = getHtmlFiles();
    console.log(`📁 Found ${htmlFiles.length} HTML files to process`);
    console.log('');
    
    let fixedCount = 0;
    let totalFiles = htmlFiles.length;
    
    htmlFiles.forEach(file => {
        if (fixWidgetCodesInFile(file)) {
            fixedCount++;
        }
    });
    
    console.log('');
    console.log('📊 Summary:');
    console.log(`✅ Fixed ${fixedCount} out of ${totalFiles} files`);
    console.log(`📝 Widget code is now consistent: ${NEW_WIDGET_CODE}`);
    console.log('');
    console.log('🎯 Next steps:');
    console.log('1. Test your website to ensure widgets work properly');
    console.log('2. Use tawk-widget-chooser.html to choose your preferred widget style');
    console.log('3. Check browser console for any remaining issues');
}

// Run the fix if this script is executed directly
if (require.main === module) {
    fixAllWidgetCodes();
}

// Export for use in other scripts
module.exports = {
    fixWidgetCodesInFile,
    fixAllWidgetCodes,
    OLD_WIDGET_CODE,
    NEW_WIDGET_CODE,
    WIDGET_ID
};
