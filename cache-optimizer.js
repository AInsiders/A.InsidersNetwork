/**
 * A.Insiders Cache Optimizer
 * Optimizes caching performance for Cloudflare CDN
 * Version: 1.0.0
 */

class CacheOptimizer {
    constructor() {
        this.cacheVersion = '1.0.0';
        this.cacheStats = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCache();
        this.monitorPerformance();
    }

    setupEventListeners() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            this.measurePageLoadPerformance();
        });

        // Monitor resource loading
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.analyzeResourcePerformance(entry);
                }
            });
            observer.observe({ entryTypes: ['resource', 'navigation'] });
        }
    }

    async initializeCache() {
        try {
            // Check if service worker is available
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    console.log('Cache Optimizer: Service Worker found');
                    this.serviceWorker = registration;
                }
            }

            // Initialize cache statistics
            this.updateCacheStats();
        } catch (error) {
            console.error('Cache Optimizer: Initialization failed:', error);
        }
    }

    async updateCacheStats() {
        try {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                this.cacheStats = {};

                for (const cacheName of cacheNames) {
                    const cache = await caches.open(cacheName);
                    const keys = await cache.keys();
                    let totalSize = 0;

                    for (const request of keys) {
                        const response = await cache.match(request);
                        if (response) {
                            const blob = await response.blob();
                            totalSize += blob.size;
                        }
                    }

                    this.cacheStats[cacheName] = {
                        count: keys.length,
                        size: totalSize,
                        sizeFormatted: this.formatBytes(totalSize)
                    };
                }

                console.log('Cache Optimizer: Cache statistics updated', this.cacheStats);
            }
        } catch (error) {
            console.error('Cache Optimizer: Failed to update cache stats:', error);
        }
    }

    measurePageLoadPerformance() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');

            const metrics = {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
            };

            console.log('Cache Optimizer: Page load metrics', metrics);
            this.reportPerformanceMetrics(metrics);
        }
    }

    analyzeResourcePerformance(entry) {
        if (entry.entryType === 'resource') {
            const resource = {
                name: entry.name,
                duration: entry.duration,
                transferSize: entry.transferSize,
                decodedBodySize: entry.decodedBodySize,
                initiatorType: entry.initiatorType
            };

            // Identify slow resources
            if (entry.duration > 1000) {
                console.warn('Cache Optimizer: Slow resource detected', resource);
            }

            // Check for cache misses
            if (entry.transferSize > 0 && entry.decodedBodySize > 0) {
                const compressionRatio = entry.transferSize / entry.decodedBodySize;
                if (compressionRatio > 0.9) {
                    console.warn('Cache Optimizer: Poor compression detected', resource);
                }
            }
        }
    }

    reportPerformanceMetrics(metrics) {
        // Send metrics to analytics or monitoring service
        if (window.gtag) {
            gtag('event', 'page_performance', {
                event_category: 'performance',
                event_label: 'page_load',
                value: Math.round(metrics.loadComplete),
                custom_map: {
                    'dom_content_loaded': metrics.domContentLoaded,
                    'first_paint': metrics.firstPaint,
                    'first_contentful_paint': metrics.firstContentfulPaint
                }
            });
        }
    }

    async preloadCriticalResources() {
        const criticalResources = [
            '/brain-styles.css',
            '/sidebar-menu.css',
            '/brain-script.js',
            '/shared-loader.js',
            '/ainsiders-logo.png'
        ];

        try {
            for (const resource of criticalResources) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = this.getResourceType(resource);
                link.href = resource;
                document.head.appendChild(link);
            }

            console.log('Cache Optimizer: Critical resources preloaded');
        } catch (error) {
            console.error('Cache Optimizer: Failed to preload resources:', error);
        }
    }

    getResourceType(url) {
        if (url.endsWith('.css')) return 'style';
        if (url.endsWith('.js')) return 'script';
        if (url.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) return 'image';
        if (url.endsWith('.woff') || url.endsWith('.woff2')) return 'font';
        return 'fetch';
    }

    async clearOldCaches() {
        try {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                const currentCaches = cacheNames.filter(name => 
                    name.includes('ainsiders') && !name.includes(this.cacheVersion)
                );

                for (const cacheName of currentCaches) {
                    await caches.delete(cacheName);
                    console.log('Cache Optimizer: Cleared old cache:', cacheName);
                }
            }
        } catch (error) {
            console.error('Cache Optimizer: Failed to clear old caches:', error);
        }
    }

    async optimizeImages() {
        try {
            const images = document.querySelectorAll('img');
            
            for (const img of images) {
                // Add loading="lazy" for images below the fold
                if (!this.isAboveTheFold(img)) {
                    img.loading = 'lazy';
                }

                // Add decoding="async" for better performance
                img.decoding = 'async';

                // Add error handling
                img.addEventListener('error', () => {
                    console.warn('Cache Optimizer: Image failed to load:', img.src);
                });
            }

            console.log('Cache Optimizer: Images optimized');
        } catch (error) {
            console.error('Cache Optimizer: Failed to optimize images:', error);
        }
    }

    isAboveTheFold(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async getCacheInfo() {
        await this.updateCacheStats();
        return {
            version: this.cacheVersion,
            stats: this.cacheStats,
            serviceWorker: !!this.serviceWorker,
            storage: await this.getStorageInfo()
        };
    }

    async getStorageInfo() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            return {
                usage: this.formatBytes(estimate.usage || 0),
                quota: this.formatBytes(estimate.quota || 0),
                percentage: estimate.quota ? Math.round((estimate.usage / estimate.quota) * 100) : 0
            };
        }
        return null;
    }

    monitorPerformance() {
        // Monitor Core Web Vitals
        if ('PerformanceObserver' in window) {
            try {
                // Monitor Largest Contentful Paint (LCP)
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('Cache Optimizer: LCP', lastEntry.startTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                // Monitor First Input Delay (FID)
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    for (const entry of entries) {
                        console.log('Cache Optimizer: FID', entry.processingStart - entry.startTime);
                    }
                });
                fidObserver.observe({ entryTypes: ['first-input'] });

                // Monitor Cumulative Layout Shift (CLS)
                const clsObserver = new PerformanceObserver((list) => {
                    let clsValue = 0;
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    console.log('Cache Optimizer: CLS', clsValue);
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });

            } catch (error) {
                console.error('Cache Optimizer: Failed to monitor Core Web Vitals:', error);
            }
        }
    }
}

// Initialize cache optimizer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.cacheOptimizer = new CacheOptimizer();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CacheOptimizer;
} 