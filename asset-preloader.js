/**
 * Asset Preloader - Advanced Loading System with Skeleton Screens
 * Features: Progressive loading, Skeleton screens, Resource prioritization, Performance monitoring
 * Version: 2.0.0
 */

class AssetPreloader {
    constructor() {
        this.loadingQueue = [];
        this.loadedAssets = new Set();
        this.failedAssets = new Set();
        this.loadingAssets = new Map();
        this.skeletonElements = new Map();
        this.performanceMetrics = {
            totalAssets: 0,
            loadedAssets: 0,
            failedAssets: 0,
            totalLoadTime: 0,
            averageLoadTime: 0,
            startTime: Date.now()
        };
        
        this.loadingStrategies = {
            CRITICAL: 'critical',
            HIGH: 'high',
            MEDIUM: 'medium',
            LOW: 'low',
            BACKGROUND: 'background'
        };
        
        this.assetTypes = {
            CSS: 'css',
            JS: 'js',
            IMAGE: 'image',
            FONT: 'font',
            VIDEO: 'video',
            AUDIO: 'audio',
            DATA: 'data'
        };
        
        this.init();
    }

    init() {
        // Setup intersection observer for lazy loading
        this.setupIntersectionObserver();
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
        
        // Setup error handling
        this.setupErrorHandling();
        
        console.log('🚀 Asset Preloader initialized');
    }

    setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const assetUrl = element.dataset.assetUrl;
                        
                        if (assetUrl && !this.loadedAssets.has(assetUrl)) {
                            this.loadAsset(assetUrl, {
                                priority: element.dataset.priority || 'medium',
                                showSkeleton: element.dataset.showSkeleton === 'true'
                            });
                        }
                    }
                });
            },
            {
                rootMargin: '50px',
                threshold: 0.1
            }
        );
    }

    setupPerformanceMonitoring() {
        // Monitor loading performance
        setInterval(() => {
            const elapsed = Date.now() - this.performanceMetrics.startTime;
            const loadRate = (this.performanceMetrics.loadedAssets / this.performanceMetrics.totalAssets) * 100;
            
            console.log(`📊 Loading Progress: ${loadRate.toFixed(1)}% (${this.performanceMetrics.loadedAssets}/${this.performanceMetrics.totalAssets})`);
            
            // Send analytics
            if (window.gtag) {
                window.gtag('event', 'asset_loading_progress', {
                    load_rate: loadRate,
                    loaded_assets: this.performanceMetrics.loadedAssets,
                    total_assets: this.performanceMetrics.totalAssets,
                    elapsed_time: elapsed
                });
            }
        }, 5000);
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            if (event.target && event.target.src) {
                this.handleAssetError(event.target.src, event.error);
            }
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Unhandled promise rejection:', event.reason);
        });
    }

    async preloadAssets(assets, options = {}) {
        const {
            strategy = 'progressive',
            showProgress = true,
            onProgress = null,
            onComplete = null,
            onError = null
        } = options;
        
        this.performanceMetrics.totalAssets += assets.length;
        
        if (showProgress) {
            this.showProgressBar();
        }
        
        // Sort assets by priority
        const sortedAssets = this.sortAssetsByPriority(assets);
        
        switch (strategy) {
            case 'progressive':
                await this.loadProgressive(sortedAssets, { onProgress, onComplete, onError });
                break;
            case 'parallel':
                await this.loadParallel(sortedAssets, { onProgress, onComplete, onError });
                break;
            case 'sequential':
                await this.loadSequential(sortedAssets, { onProgress, onComplete, onError });
                break;
            default:
                await this.loadProgressive(sortedAssets, { onProgress, onComplete, onError });
        }
        
        if (showProgress) {
            this.hideProgressBar();
        }
    }

    sortAssetsByPriority(assets) {
        return assets.sort((a, b) => {
            const priorityOrder = {
                [this.loadingStrategies.CRITICAL]: 0,
                [this.loadingStrategies.HIGH]: 1,
                [this.loadingStrategies.MEDIUM]: 2,
                [this.loadingStrategies.LOW]: 3,
                [this.loadingStrategies.BACKGROUND]: 4
            };
            
            return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
        });
    }

    async loadProgressive(assets, callbacks) {
        const criticalAssets = assets.filter(a => a.priority === this.loadingStrategies.CRITICAL);
        const highAssets = assets.filter(a => a.priority === this.loadingStrategies.HIGH);
        const mediumAssets = assets.filter(a => a.priority === this.loadingStrategies.MEDIUM);
        const lowAssets = assets.filter(a => a.priority === this.loadingStrategies.LOW);
        const backgroundAssets = assets.filter(a => a.priority === this.loadingStrategies.BACKGROUND);
        
        // Load critical assets first
        await this.loadAssetGroup(criticalAssets, callbacks);
        
        // Load high priority assets
        await this.loadAssetGroup(highAssets, callbacks);
        
        // Load medium priority assets in parallel
        this.loadAssetGroup(mediumAssets, callbacks);
        
        // Load low priority assets in background
        setTimeout(() => {
            this.loadAssetGroup(lowAssets, callbacks);
        }, 1000);
        
        // Load background assets after a delay
        setTimeout(() => {
            this.loadAssetGroup(backgroundAssets, callbacks);
        }, 3000);
    }

    async loadParallel(assets, callbacks) {
        const promises = assets.map(asset => this.loadAsset(asset.url, asset));
        await Promise.allSettled(promises);
        
        if (callbacks.onComplete) {
            callbacks.onComplete();
        }
    }

    async loadSequential(assets, callbacks) {
        for (const asset of assets) {
            await this.loadAsset(asset.url, asset);
            
            if (callbacks.onProgress) {
                const progress = (this.performanceMetrics.loadedAssets / this.performanceMetrics.totalAssets) * 100;
                callbacks.onProgress(progress);
            }
        }
        
        if (callbacks.onComplete) {
            callbacks.onComplete();
        }
    }

    async loadAssetGroup(assets, callbacks) {
        const promises = assets.map(asset => this.loadAsset(asset.url, asset));
        await Promise.allSettled(promises);
        
        if (callbacks.onProgress) {
            const progress = (this.performanceMetrics.loadedAssets / this.performanceMetrics.totalAssets) * 100;
            callbacks.onProgress(progress);
        }
    }

    async loadAsset(url, options = {}) {
        if (this.loadedAssets.has(url) || this.loadingAssets.has(url)) {
            return;
        }
        
        const {
            priority = 'medium',
            showSkeleton = false,
            type = this.getAssetType(url),
            timeout = 10000
        } = options;
        
        const startTime = Date.now();
        this.loadingAssets.set(url, { startTime, priority });
        
        // Show skeleton if requested
        if (showSkeleton) {
            this.showSkeleton(url);
        }
        
        try {
            const asset = await this.loadAssetByType(url, type, timeout);
            
            // Mark as loaded
            this.loadedAssets.add(url);
            this.loadingAssets.delete(url);
            
            // Update performance metrics
            const loadTime = Date.now() - startTime;
            this.performanceMetrics.loadedAssets++;
            this.performanceMetrics.totalLoadTime += loadTime;
            this.performanceMetrics.averageLoadTime = this.performanceMetrics.totalLoadTime / this.performanceMetrics.loadedAssets;
            
            // Hide skeleton
            if (showSkeleton) {
                this.hideSkeleton(url);
            }
            
            console.log(`✅ Loaded: ${url} (${loadTime}ms)`);
            
            return asset;
            
        } catch (error) {
            this.handleAssetError(url, error);
            this.loadingAssets.delete(url);
            
            if (showSkeleton) {
                this.hideSkeleton(url);
            }
            
            throw error;
        }
    }

    async loadAssetByType(url, type, timeout) {
        switch (type) {
            case this.assetTypes.CSS:
                return await this.loadCSS(url, timeout);
                
            case this.assetTypes.JS:
                return await this.loadJS(url, timeout);
                
            case this.assetTypes.IMAGE:
                return await this.loadImage(url, timeout);
                
            case this.assetTypes.FONT:
                return await this.loadFont(url, timeout);
                
            case this.assetTypes.VIDEO:
                return await this.loadVideo(url, timeout);
                
            case this.assetTypes.AUDIO:
                return await this.loadAudio(url, timeout);
                
            case this.assetTypes.DATA:
                return await this.loadData(url, timeout);
                
            default:
                return await this.loadGeneric(url, timeout);
        }
    }

    async loadCSS(url, timeout) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            
            const timeoutId = setTimeout(() => {
                reject(new Error(`CSS load timeout: ${url}`));
            }, timeout);
            
            link.onload = () => {
                clearTimeout(timeoutId);
                resolve(link);
            };
            
            link.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error(`Failed to load CSS: ${url}`));
            };
            
            document.head.appendChild(link);
        });
    }

    async loadJS(url, timeout) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            
            const timeoutId = setTimeout(() => {
                reject(new Error(`JS load timeout: ${url}`));
            }, timeout);
            
            script.onload = () => {
                clearTimeout(timeoutId);
                resolve(script);
            };
            
            script.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error(`Failed to load JS: ${url}`));
            };
            
            document.head.appendChild(script);
        });
    }

    async loadImage(url, timeout) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            const timeoutId = setTimeout(() => {
                reject(new Error(`Image load timeout: ${url}`));
            }, timeout);
            
            img.onload = () => {
                clearTimeout(timeoutId);
                resolve(img);
            };
            
            img.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error(`Failed to load image: ${url}`));
            };
            
            img.src = url;
        });
    }

    async loadFont(url, timeout) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.href = url;
            link.crossOrigin = 'anonymous';
            
            const timeoutId = setTimeout(() => {
                reject(new Error(`Font load timeout: ${url}`));
            }, timeout);
            
            link.onload = () => {
                clearTimeout(timeoutId);
                resolve(link);
            };
            
            link.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error(`Failed to load font: ${url}`));
            };
            
            document.head.appendChild(link);
        });
    }

    async loadVideo(url, timeout) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            
            const timeoutId = setTimeout(() => {
                reject(new Error(`Video load timeout: ${url}`));
            }, timeout);
            
            video.onloadedmetadata = () => {
                clearTimeout(timeoutId);
                resolve(video);
            };
            
            video.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error(`Failed to load video: ${url}`));
            };
            
            video.src = url;
        });
    }

    async loadAudio(url, timeout) {
        return new Promise((resolve, reject) => {
            const audio = document.createElement('audio');
            audio.preload = 'metadata';
            
            const timeoutId = setTimeout(() => {
                reject(new Error(`Audio load timeout: ${url}`));
            }, timeout);
            
            audio.onloadedmetadata = () => {
                clearTimeout(timeoutId);
                resolve(audio);
            };
            
            audio.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error(`Failed to load audio: ${url}`));
            };
            
            audio.src = url;
        });
    }

    async loadData(url, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    async loadGeneric(url, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    getAssetType(url) {
        if (url.endsWith('.css')) return this.assetTypes.CSS;
        if (url.endsWith('.js')) return this.assetTypes.JS;
        if (url.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) return this.assetTypes.IMAGE;
        if (url.match(/\.(woff|woff2|ttf|eot)$/)) return this.assetTypes.FONT;
        if (url.match(/\.(mp4|webm|ogg|mov)$/)) return this.assetTypes.VIDEO;
        if (url.match(/\.(mp3|wav|ogg|aac)$/)) return this.assetTypes.AUDIO;
        if (url.match(/\.(json|xml|csv)$/)) return this.assetTypes.DATA;
        return 'generic';
    }

    showSkeleton(url) {
        const skeleton = document.createElement('div');
        skeleton.className = 'asset-skeleton';
        skeleton.dataset.assetUrl = url;
        skeleton.innerHTML = `
            <div class="skeleton-content">
                <div class="skeleton-shimmer"></div>
                <div class="skeleton-text">Loading...</div>
            </div>
        `;
        
        this.skeletonElements.set(url, skeleton);
        document.body.appendChild(skeleton);
    }

    hideSkeleton(url) {
        const skeleton = this.skeletonElements.get(url);
        if (skeleton) {
            skeleton.remove();
            this.skeletonElements.delete(url);
        }
    }

    showProgressBar() {
        let progressBar = document.getElementById('asset-progress-bar');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'asset-progress-bar';
            progressBar.className = 'asset-progress-bar';
            progressBar.innerHTML = `
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-text">Loading assets...</div>
                </div>
            `;
            document.body.appendChild(progressBar);
        }
        
        progressBar.style.display = 'block';
    }

    hideProgressBar() {
        const progressBar = document.getElementById('asset-progress-bar');
        if (progressBar) {
            progressBar.style.display = 'none';
        }
    }

    updateProgress(progress) {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Loading assets... ${Math.round(progress)}%`;
        }
    }

    handleAssetError(url, error) {
        console.error(`❌ Asset load failed: ${url}`, error);
        
        this.failedAssets.add(url);
        this.performanceMetrics.failedAssets++;
        
        // Send error analytics
        if (window.gtag) {
            window.gtag('event', 'asset_load_error', {
                asset_url: url,
                error_message: error.message,
                error_type: error.name
            });
        }
    }

    // Public API methods
    async preloadPage(pageName) {
        const pageAssets = this.getPageAssets(pageName);
        await this.preloadAssets(pageAssets, {
            strategy: 'progressive',
            showProgress: true
        });
    }

    getPageAssets(pageName) {
        const pageAssets = {
            'index': [
                { url: 'sphere-loader.js', priority: 'critical' },
                { url: 'matrix-loader.js', priority: 'high' }
            ],
            'news': [
                { url: 'news-feeds-enhanced.js', priority: 'critical' },
                { url: 'news-script.js', priority: 'high' }
            ],
            'about': [
                { url: 'mobile-nav.js', priority: 'high' }
            ],
            'contact': [
                { url: 'mobile-nav.js', priority: 'high' }
            ],
            'apps': [
                { url: 'mobile-nav.js', priority: 'high' }
            ]
        };
        
        return pageAssets[pageName] || [];
    }

    getLoadingStats() {
        return {
            ...this.performanceMetrics,
            loadingAssets: this.loadingAssets.size,
            skeletonElements: this.skeletonElements.size
        };
    }

    clearCache() {
        this.loadedAssets.clear();
        this.failedAssets.clear();
        this.loadingAssets.clear();
        this.performanceMetrics = {
            totalAssets: 0,
            loadedAssets: 0,
            failedAssets: 0,
            totalLoadTime: 0,
            averageLoadTime: 0,
            startTime: Date.now()
        };
    }
}

// Initialize the asset preloader
const assetPreloader = new AssetPreloader();

// Export for use in other modules
window.assetPreloader = assetPreloader;

// Add CSS for skeleton screens and progress bars
const preloaderStyles = `
.asset-skeleton {
    position: relative;
    background: #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
    margin: 10px 0;
    min-height: 60px;
    animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-content {
    padding: 20px;
    text-align: center;
}

.skeleton-shimmer {
    width: 100%;
    height: 20px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shimmer 2s infinite;
    margin-bottom: 10px;
}

.skeleton-text {
    color: #666;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
}

.asset-progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: rgba(0, 0, 0, 0.1);
    z-index: 10000;
}

.progress-container {
    display: flex;
    align-items: center;
    padding: 10px 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    font-family: 'Inter', sans-serif;
}

.progress-bar {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    overflow: hidden;
    margin-right: 15px;
}

.progress-fill {
    height: 100%;
    background: white;
    width: 0%;
    transition: width 0.3s ease;
    border-radius: 2px;
}

.progress-text {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
}

@keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

@media (max-width: 768px) {
    .progress-container {
        padding: 8px 15px;
    }
    
    .progress-text {
        font-size: 12px;
    }
}
`;

// Inject styles
const preloaderStyleSheet = document.createElement('style');
preloaderStyleSheet.textContent = preloaderStyles;
document.head.appendChild(preloaderStyleSheet);

console.log('🎯 Asset Preloader loaded successfully'); 