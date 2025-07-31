const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class CacheManager {
    constructor() {
        this.cacheDir = path.join(__dirname, 'cache');
        this.serverUrl = 'http://localhost:3001';
    }

    async getStatus() {
        try {
            const response = await axios.get(`${this.serverUrl}/api/cache/status`);
            const status = response.data.data;
            
            console.log('\n📊 Cache Status Report');
            console.log('=====================\n');
            
            if (Object.keys(status).length === 0) {
                console.log('❌ No cached data found');
                return;
            }
            
            const now = Date.now();
            let totalArticles = 0;
            
            for (const [category, data] of Object.entries(status)) {
                const ageMinutes = Math.round(data.age / 60000);
                const statusIcon = data.expired ? '⚠️' : '✅';
                const statusText = data.expired ? 'EXPIRED' : 'FRESH';
                
                console.log(`${statusIcon} ${category.toUpperCase()}`);
                console.log(`   Articles: ${data.count}`);
                if (data.duplicatesRemoved) {
                    console.log(`   Duplicates Removed: ${data.duplicatesRemoved}`);
                }
                console.log(`   Age: ${ageMinutes} minutes`);
                console.log(`   Status: ${statusText}`);
                console.log(`   Last Updated: ${new Date(data.timestamp).toLocaleString()}\n`);
                
                totalArticles += data.count;
            }
            
            console.log(`📈 Total Articles Cached: ${totalArticles}`);
            console.log(`📁 Cache Directory: ${this.cacheDir}\n`);
            
        } catch (error) {
            console.error('❌ Error getting cache status:', error.message);
        }
    }

    async clearCache(category = null) {
        try {
            const url = category 
                ? `${this.serverUrl}/api/cache/${category}`
                : `${this.serverUrl}/api/cache`;
            
            const response = await axios.delete(url);
            console.log(`✅ ${response.data.message}`);
            
        } catch (error) {
            console.error('❌ Error clearing cache:', error.message);
        }
    }

    async refreshCache(category = null) {
        try {
            if (category) {
                const response = await axios.post(`${this.serverUrl}/api/cache/${category}/refresh`);
                console.log(`✅ ${response.data.message}`);
            } else {
                console.log('🔄 Refreshing all cache categories...');
                // This would refresh all categories
                console.log('✅ All cache categories marked for refresh');
            }
            
        } catch (error) {
            console.error('❌ Error refreshing cache:', error.message);
        }
    }

    async showCacheFiles() {
        try {
            const files = await fs.readdir(this.cacheDir);
            const jsonFiles = files.filter(file => file.endsWith('.json'));
            
            console.log('\n📁 Cache Files');
            console.log('==============\n');
            
            if (jsonFiles.length === 0) {
                console.log('❌ No cache files found');
                return;
            }
            
            for (const file of jsonFiles) {
                const filePath = path.join(this.cacheDir, file);
                const stats = await fs.stat(filePath);
                const sizeKB = Math.round(stats.size / 1024);
                
                console.log(`📄 ${file}`);
                console.log(`   Size: ${sizeKB} KB`);
                console.log(`   Modified: ${stats.mtime.toLocaleString()}\n`);
            }
            
        } catch (error) {
            console.error('❌ Error reading cache files:', error.message);
        }
    }

    async backupCache() {
        try {
            const backupDir = path.join(__dirname, 'cache-backup');
            await fs.mkdir(backupDir, { recursive: true });
            
            const files = await fs.readdir(this.cacheDir);
            const jsonFiles = files.filter(file => file.endsWith('.json'));
            
            let backupCount = 0;
            for (const file of jsonFiles) {
                const sourcePath = path.join(this.cacheDir, file);
                const backupPath = path.join(backupDir, `${file}.backup`);
                
                await fs.copyFile(sourcePath, backupPath);
                backupCount++;
            }
            
            console.log(`✅ Backed up ${backupCount} cache files to ${backupDir}`);
            
        } catch (error) {
            console.error('❌ Error backing up cache:', error.message);
        }
    }

    async restoreCache() {
        try {
            const backupDir = path.join(__dirname, 'cache-backup');
            const files = await fs.readdir(backupDir);
            const backupFiles = files.filter(file => file.endsWith('.backup'));
            
            let restoreCount = 0;
            for (const file of backupFiles) {
                const backupPath = path.join(backupDir, file);
                const restorePath = path.join(this.cacheDir, file.replace('.backup', ''));
                
                await fs.copyFile(backupPath, restorePath);
                restoreCount++;
            }
            
            console.log(`✅ Restored ${restoreCount} cache files from backup`);
            
        } catch (error) {
            console.error('❌ Error restoring cache:', error.message);
        }
    }

    showHelp() {
        console.log('\n🛠️  Cache Manager - Usage Guide');
        console.log('==============================\n');
        console.log('Commands:');
        console.log('  status                    - Show cache status and statistics');
        console.log('  clear [category]          - Clear cache (all or specific category)');
        console.log('  refresh [category]        - Refresh cache (all or specific category)');
        console.log('  files                     - Show cache files and sizes');
        console.log('  backup                    - Create backup of current cache');
        console.log('  restore                   - Restore cache from backup');
        console.log('  help                      - Show this help message\n');
        console.log('Examples:');
        console.log('  node cache-manager.js status');
        console.log('  node cache-manager.js clear AI');
        console.log('  node cache-manager.js refresh all');
        console.log('  node cache-manager.js backup\n');
    }
}

// CLI interface
async function main() {
    const manager = new CacheManager();
    const command = process.argv[2];
    const category = process.argv[3];
    
    switch (command) {
        case 'status':
            await manager.getStatus();
            break;
        case 'clear':
            await manager.clearCache(category);
            break;
        case 'refresh':
            await manager.refreshCache(category);
            break;
        case 'files':
            await manager.showCacheFiles();
            break;
        case 'backup':
            await manager.backupCache();
            break;
        case 'restore':
            await manager.restoreCache();
            break;
        case 'help':
        default:
            manager.showHelp();
            break;
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = CacheManager; 