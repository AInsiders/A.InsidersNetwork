/**
 * Browser Cache Manager - Advanced Asset Caching System
 * Features: Service Worker, Preloaders, Versioning, Analytics, Progressive Loading
 * Version: 2.0.0
 */

class BrowserCacheManager {
    constructor() {
        this.cacheName = 'ainsiders-assets-v2.0.0';
        this.cacheVersion = '2.0.0';
        this.maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        this.maxCacheSize = 100 * 1024 * 1024; // 100MB
        this.preloadQueue = [];
        this.loadingAssets = new Set();
        this.cacheStats = {
            hits: 0,
            misses: 0,
            size: 0,
            lastCleanup: Date.now()
        };
        
        this.assetManifest = {
            critical: [
                'brain-styles.css',
                'brain-script.js',
                'shared-loader.js',
                'mobile-nav.js'
            ],
            important: [
                'sphere-loader.js',
                'matrix-loader.js',
                'matrix-rain.js',

                'chatbot.js',
                'simple-chatbot.js'
            ],
            images: [
                'ainsiders-logo.png',
                'logo.svg',
                'blake-zimmerman.jpg'
            ],
            fonts: [
                'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
            ],
            external: [
                'https://embed.tawk.to/688b284b9abe48192a749848/1j1fpapuu'
            ]
        };
        
        this.init();
    }

    async init() {
        try {
            // Register service worker
            await this.registerServiceWorker();
            
            // Initialize cache
            await this.initializeCache();
            
            // Start preloading critical assets
            await this.preloadCriticalAssets();
            
            // Setup periodic cleanup
            this.setupPeriodicCleanup();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            console.log('🚀 Browser Cache Manager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Browser Cache Manager:', error);
        }
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });
                
                console.log('✅ Service Worker registered:', registration);
                
                // Handle service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
                
                return registration;
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    async initializeCache() {
        try {
            const cache = await caches.open(this.cacheName);
            const keys = await cache.keys();
            
            // Calculate current cache size
            let totalSize = 0;
            for (const request of keys) {
                const response = await cache.match(request);
                if (response) {
                    const blob = await response.blob();
                    totalSize += blob.size;
                }
            }
            
            this.cacheStats.size = totalSize;
            console.log(`📊 Cache initialized. Current size: ${this.formatBytes(totalSize)}`);
            
            return cache;
        } catch (error) {
            console.error('❌ Cache initialization failed:', error);
        }
    }

    async preloadCriticalAssets() {
        console.log('🔄 Preloading critical assets...');
        
        const criticalAssets = [
            ...this.assetManifest.critical,
            ...this.assetManifest.images
        ];
        
        // Preload with priority
        for (const asset of criticalAssets) {
            await this.preloadAsset(asset, 'high');
        }
        
        // Preload important assets in background
        setTimeout(async () => {
            for (const asset of this.assetManifest.important) {
                await this.preloadAsset(asset, 'low');
            }
        }, 1000);
    }

    async preloadAsset(url, priority = 'auto') {
        if (this.loadingAssets.has(url)) {
            return; // Already loading
        }
        
        this.loadingAssets.add(url);
        
        try {
            // Create preload link
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            
            if (url.endsWith('.css')) {
                link.as = 'style';
            } else if (url.endsWith('.js')) {
                link.as = 'script';
            } else if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
                link.as = 'image';
            } else if (url.includes('fonts.googleapis.com')) {
                link.as = 'style';
            }
            
            link.crossOrigin = 'anonymous';
            
            if (priority !== 'auto') {
                link.setAttribute('importance', priority);
            }
            
            document.head.appendChild(link);
            
            // Also cache the asset
            await this.cacheAsset(url);
            
            console.log(`✅ Preloaded: ${url}`);
        } catch (error) {
            console.error(`❌ Failed to preload ${url}:`, error);
        } finally {
            this.loadingAssets.delete(url);
        }
    }

    async cacheAsset(url) {
        try {
            const cache = await caches.open(this.cacheName);
            const response = await fetch(url, {
                cache: 'force-cache'
            });
            
            if (response.ok) {
                await cache.put(url, response.clone());
                this.cacheStats.hits++;
                
                // Update cache size
                const blob = await response.blob();
                this.cacheStats.size += blob.size;
                
                return response;
            }
        } catch (error) {
            console.error(`❌ Failed to cache ${url}:`, error);
            this.cacheStats.misses++;
        }
    }

    async getCachedAsset(url) {
        try {
            const cache = await caches.open(this.cacheName);
            const response = await cache.match(url);
            
            if (response) {
                this.cacheStats.hits++;
                return response;
            } else {
                this.cacheStats.misses++;
                return null;
            }
        } catch (error) {
            console.error(`❌ Failed to get cached asset ${url}:`, error);
            this.cacheStats.misses++;
            return null;
        }
    }

    async loadAssetWithFallback(url, options = {}) {
        const {
            priority = 'auto',
            showLoader = true,
            timeout = 10000,
            retries = 3
        } = options;
        
        // Show loading indicator
        if (showLoader) {
            this.showAssetLoader(url);
        }
        
        let attempts = 0;
        
        while (attempts < retries) {
            try {
                // Try cache first
                let response = await this.getCachedAsset(url);
                
                if (!response) {
                    // Not in cache, fetch and cache
                    response = await this.cacheAsset(url);
                }
                
                if (response) {
                    if (showLoader) {
                        this.hideAssetLoader(url);
                    }
                    return response;
                }
                
                attempts++;
                await this.delay(1000 * attempts); // Exponential backoff
                
            } catch (error) {
                console.error(`❌ Failed to load ${url} (attempt ${attempts + 1}):`, error);
                attempts++;
                
                if (attempts >= retries) {
                    if (showLoader) {
                        this.hideAssetLoader(url);
                    }
                    throw error;
                }
                
                await this.delay(1000 * attempts);
            }
        }
    }

    showAssetLoader(url) {
        // Create or update loading indicator
        let loader = document.getElementById('asset-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'asset-loader';
            loader.className = 'asset-loader';
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <div class="loader-text">Loading assets...</div>
                    <div class="loader-progress">
                        <div class="progress-bar"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(loader);
        }
        
        loader.style.display = 'flex';
    }

    hideAssetLoader(url) {
        const loader = document.getElementById('asset-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    async cleanupCache() {
        try {
            const cache = await caches.open(this.cacheName);
            const keys = await cache.keys();
            const now = Date.now();
            
            let cleanedSize = 0;
            let cleanedCount = 0;
            
            for (const request of keys) {
                const response = await cache.match(request);
                if (response) {
                    const headers = response.headers;
                    const cacheTime = headers.get('cache-time');
                    
                    if (cacheTime && (now - parseInt(cacheTime)) > this.maxCacheAge) {
                        await cache.delete(request);
                        const blob = await response.blob();
                        cleanedSize += blob.size;
                        cleanedCount++;
                    }
                }
            }
            
            this.cacheStats.size -= cleanedSize;
            this.cacheStats.lastCleanup = now;
            
            console.log(`🧹 Cache cleanup: Removed ${cleanedCount} files (${this.formatBytes(cleanedSize)})`);
            
            // Check if cache is too large
            if (this.cacheStats.size > this.maxCacheSize) {
                await this.trimCache();
            }
            
        } catch (error) {
            console.error('❌ Cache cleanup failed:', error);
        }
    }

    async trimCache() {
        try {
            const cache = await caches.open(this.cacheName);
            const keys = await cache.keys();
            
            // Get all cached items with their sizes and access times
            const items = [];
            for (const request of keys) {
                const response = await cache.match(request);
                if (response) {
                    const blob = await response.blob();
                    const accessTime = response.headers.get('access-time') || '0';
                    items.push({
                        request,
                        size: blob.size,
                        accessTime: parseInt(accessTime),
                        url: request.url
                    });
                }
            }
            
            // Sort by access time (oldest first)
            items.sort((a, b) => a.accessTime - b.accessTime);
            
            // Remove oldest items until cache size is acceptable
            let removedSize = 0;
            for (const item of items) {
                if (this.cacheStats.size - removedSize <= this.maxCacheSize * 0.8) {
                    break;
                }
                
                await cache.delete(item.request);
                removedSize += item.size;
            }
            
            this.cacheStats.size -= removedSize;
            console.log(`✂️ Cache trimmed: Removed ${this.formatBytes(removedSize)}`);
            
        } catch (error) {
            console.error('❌ Cache trimming failed:', error);
        }
    }

    setupPeriodicCleanup() {
        // Cleanup every 6 hours
        setInterval(() => {
            this.cleanupCache();
        }, 6 * 60 * 60 * 1000);
        
        // Also cleanup when page becomes visible (user returns)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.cleanupCache();
            }
        });
    }

    setupPerformanceMonitoring() {
        // Monitor cache performance
        setInterval(() => {
            const hitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100;
            console.log(`📊 Cache Performance: ${hitRate.toFixed(1)}% hit rate, ${this.formatBytes(this.cacheStats.size)} used`);
            
            // Send analytics if available
            if (window.gtag) {
                window.gtag('event', 'cache_performance', {
                    hit_rate: hitRate,
                    cache_size: this.cacheStats.size,
                    cache_hits: this.cacheStats.hits,
                    cache_misses: this.cacheStats.misses
                });
            }
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <h3>🔄 Update Available</h3>
                <p>A new version of the website is available. Click to update.</p>
                <button onclick="location.reload()">Update Now</button>
                <button onclick="this.parentElement.parentElement.remove()">Later</button>
            </div>
        `;
        document.body.appendChild(notification);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API methods
    async preloadPage(pageName) {
        const pageAssets = this.getPageAssets(pageName);
        for (const asset of pageAssets) {
            await this.preloadAsset(asset, 'low');
        }
    }

    getPageAssets(pageName) {
        const pageAssets = {
            'index': ['sphere-loader.js'],

            'about': ['mobile-nav.js'],
            'contact': ['mobile-nav.js'],
            'apps': ['mobile-nav.js'],
    
        };
        
        return pageAssets[pageName] || [];
    }

    getCacheStats() {
        return { ...this.cacheStats };
    }

    async clearCache() {
        try {
            await caches.delete(this.cacheName);
            this.cacheStats.size = 0;
            this.cacheStats.hits = 0;
            this.cacheStats.misses = 0;
            console.log('🗑️ Cache cleared');
        } catch (error) {
            console.error('❌ Failed to clear cache:', error);
        }
    }
}

// Initialize the cache manager
const browserCacheManager = new BrowserCacheManager();

// Export for use in other modules
window.browserCacheManager = browserCacheManager;

// Add CSS for loaders and notifications
const cacheStyles = `
.asset-loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(10px);
}

.loader-content {
    text-align: center;
    color: white;
}

.loader-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

.loader-text {
    font-size: 16px;
    margin-bottom: 15px;
    font-family: 'Inter', sans-serif;
}

.loader-progress {
    width: 200px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
    margin: 0 auto;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    width: 0%;
    animation: progress 2s ease-in-out infinite;
}

.update-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 10001;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
}

.update-content h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
}

.update-content p {
    margin: 0 0 15px 0;
    font-size: 14px;
    opacity: 0.9;
}

.update-content button {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 10px;
    font-size: 14px;
    transition: all 0.3s ease;
}

.update-content button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes progress {
    0% { width: 0%; }
    50% { width: 70%; }
    100% { width: 100%; }
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .update-notification {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = cacheStyles;
document.head.appendChild(styleSheet);

console.log('🎯 Browser Cache Manager loaded successfully'); 