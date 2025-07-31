const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const axios = require('axios');

class NewsCacheServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3001;
        this.cacheDir = path.join(__dirname, 'cache');
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
        this.updateInterval = 10 * 60 * 1000; // 10 minutes
        
        this.setupMiddleware();
        this.setupRoutes();
        this.ensureCacheDirectory();
        this.startPeriodicUpdates();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.static('public'));
    }

    setupRoutes() {
        // Get cached feeds by category
        this.app.get('/api/cache/:category', async (req, res) => {
            try {
                const { category } = req.params;
                const cacheFile = path.join(this.cacheDir, `${category}.json`);
                
                const cacheData = await this.getCacheData(cacheFile);
                if (cacheData && !this.isCacheExpired(cacheData.timestamp)) {
                    res.json({
                        success: true,
                        data: cacheData.articles,
                        timestamp: cacheData.timestamp,
                        fromCache: true
                    });
                } else {
                    res.json({
                        success: false,
                        message: 'Cache expired or not found',
                        fromCache: false
                    });
                }
            } catch (error) {
                console.error('Error retrieving cache:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error retrieving cache',
                    error: error.message
                });
            }
        });

        // Get all cached feeds
        this.app.get('/api/cache', async (req, res) => {
            try {
                const allCache = await this.getAllCacheData();
                res.json({
                    success: true,
                    data: allCache,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('Error retrieving all cache:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error retrieving all cache',
                    error: error.message
                });
            }
        });

        // Store feeds in cache
        this.app.post('/api/cache/:category', async (req, res) => {
            try {
                const { category } = req.params;
                const { articles } = req.body;
                
                if (!articles || !Array.isArray(articles)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid articles data'
                    });
                }

                await this.storeCacheData(category, articles);
                res.json({
                    success: true,
                    message: `Cached ${articles.length} articles for ${category}`,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('Error storing cache:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error storing cache',
                    error: error.message
                });
            }
        });

        // Force refresh cache for a category
        this.app.post('/api/cache/:category/refresh', async (req, res) => {
            try {
                const { category } = req.params;
                await this.refreshCategoryCache(category);
                res.json({
                    success: true,
                    message: `Cache refreshed for ${category}`
                });
            } catch (error) {
                console.error('Error refreshing cache:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error refreshing cache',
                    error: error.message
                });
            }
        });

        // Get cache status
        this.app.get('/api/cache/status', async (req, res) => {
            try {
                const status = await this.getCacheStatus();
                res.json({
                    success: true,
                    data: status
                });
            } catch (error) {
                console.error('Error getting cache status:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error getting cache status',
                    error: error.message
                });
            }
        });

        // Clear cache
        this.app.delete('/api/cache/:category?', async (req, res) => {
            try {
                const { category } = req.params;
                if (category) {
                    await this.clearCategoryCache(category);
                    res.json({
                        success: true,
                        message: `Cache cleared for ${category}`
                    });
                } else {
                    await this.clearAllCache();
                    res.json({
                        success: true,
                        message: 'All cache cleared'
                    });
                }
            } catch (error) {
                console.error('Error clearing cache:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error clearing cache',
                    error: error.message
                });
            }
        });
    }

    async ensureCacheDirectory() {
        try {
            await fs.mkdir(this.cacheDir, { recursive: true });
            console.log('Cache directory ensured');
        } catch (error) {
            console.error('Error creating cache directory:', error);
        }
    }

    async getCacheData(cacheFile) {
        try {
            const data = await fs.readFile(cacheFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return null;
        }
    }

    async getAllCacheData() {
        try {
            const files = await fs.readdir(this.cacheDir);
            const cacheData = {};
            
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const category = file.replace('.json', '');
                    const data = await this.getCacheData(path.join(this.cacheDir, file));
                    if (data && !this.isCacheExpired(data.timestamp)) {
                        cacheData[category] = data;
                    }
                }
            }
            
            return cacheData;
        } catch (error) {
            console.error('Error reading all cache data:', error);
            return {};
        }
    }

    async storeCacheData(category, articles) {
        const cacheFile = path.join(this.cacheDir, `${category}.json`);
        
        // Load existing cache to merge with new articles
        let existingArticles = [];
        try {
            const existingData = await this.getCacheData(cacheFile);
            if (existingData && existingData.articles) {
                existingArticles = existingData.articles;
            }
        } catch (error) {
            // No existing cache, start fresh
        }
        
        // Merge and deduplicate articles
        const allArticles = [...existingArticles, ...articles];
        const seenArticles = new Set();
        const uniqueArticles = allArticles.filter(article => {
            if (!article || !article.title || !article.link) return false;
            
            // Create unique key for duplicate detection
            const title = article.title.toLowerCase().trim();
            const link = article.link.trim();
            const pubDate = article.pubDate ? new Date(article.pubDate).toISOString().split('T')[0] : '';
            const articleKey = `${title}-${link}-${pubDate}`;
            
            if (seenArticles.has(articleKey)) {
                return false; // Duplicate
            }
            seenArticles.add(articleKey);
            return true;
        });
        
        // Sort by date (newest first)
        uniqueArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        const cacheData = {
            category,
            articles: uniqueArticles,
            timestamp: Date.now(),
            count: uniqueArticles.length,
            originalCount: articles.length,
            duplicatesRemoved: allArticles.length - uniqueArticles.length
        };
        
        await fs.writeFile(cacheFile, JSON.stringify(cacheData, null, 2));
        console.log(`Cached ${uniqueArticles.length} articles for ${category} (${cacheData.duplicatesRemoved} duplicates removed)`);
    }

    isCacheExpired(timestamp) {
        return Date.now() - timestamp > this.cacheExpiry;
    }

    async refreshCategoryCache(category) {
        // This would fetch fresh data for the category
        // For now, we'll just mark the cache as expired
        const cacheFile = path.join(this.cacheDir, `${category}.json`);
        try {
            await fs.unlink(cacheFile);
            console.log(`Cache marked for refresh: ${category}`);
        } catch (error) {
            console.log(`No existing cache to refresh for: ${category}`);
        }
    }

    async clearCategoryCache(category) {
        const cacheFile = path.join(this.cacheDir, `${category}.json`);
        try {
            await fs.unlink(cacheFile);
            console.log(`Cache cleared for: ${category}`);
        } catch (error) {
            console.log(`No cache to clear for: ${category}`);
        }
    }

    async clearAllCache() {
        try {
            const files = await fs.readdir(this.cacheDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    await fs.unlink(path.join(this.cacheDir, file));
                }
            }
            console.log('All cache cleared');
        } catch (error) {
            console.error('Error clearing all cache:', error);
        }
    }

    async getCacheStatus() {
        try {
            const files = await fs.readdir(this.cacheDir);
            const status = {};
            
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const category = file.replace('.json', '');
                    const data = await this.getCacheData(path.join(this.cacheDir, file));
                    if (data) {
                        status[category] = {
                            count: data.count,
                            timestamp: data.timestamp,
                            age: Date.now() - data.timestamp,
                            expired: this.isCacheExpired(data.timestamp)
                        };
                    }
                }
            }
            
            return status;
        } catch (error) {
            console.error('Error getting cache status:', error);
            return {};
        }
    }

    startPeriodicUpdates() {
        setInterval(async () => {
            console.log('Starting periodic cache update...');
            await this.updateAllCache();
        }, this.updateInterval);
    }

    async updateAllCache() {
        // This would fetch fresh data for all categories
        // For now, we'll just log the update
        console.log('Periodic cache update completed');
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`News Cache Server running on port ${this.port}`);
            console.log(`Cache directory: ${this.cacheDir}`);
            console.log(`Cache expiry: ${this.cacheExpiry / 60000} minutes`);
            console.log(`Update interval: ${this.updateInterval / 60000} minutes`);
        });
    }
}

// Start the server if this file is run directly
if (require.main === module) {
    const server = new NewsCacheServer();
    server.start();
}

module.exports = NewsCacheServer; 