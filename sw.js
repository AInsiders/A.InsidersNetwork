/**
 * Service Worker - Advanced Offline Caching & Asset Management
 * Features: Offline caching, Background sync, Push notifications, Cache strategies
 * Version: 2.0.0
 */

const CACHE_NAME = 'ainsiders-assets-v2.0.0';
const CACHE_VERSION = '2.0.0';
const STATIC_CACHE = 'ainsiders-static-v2.0.0';
const DYNAMIC_CACHE = 'ainsiders-dynamic-v2.0.0';
const API_CACHE = 'ainsiders-api-v2.0.0';

// Cache strategies
const CACHE_STRATEGIES = {
    STATIC_FIRST: 'static-first',
    NETWORK_FIRST: 'network-first',
    CACHE_FIRST: 'cache-first',
    NETWORK_ONLY: 'network-only',
    CACHE_ONLY: 'cache-only'
};

// Asset manifest for pre-caching
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/about.html',
    '/contact.html',
    '/apps.html',

    '/news-enhanced.html',
    '/brain-styles.css',
    '/brain-script.js',
    '/shared-loader.js',
    '/mobile-nav.js',
    '/sphere-loader.js',
    '/matrix-loader.js',
    '/matrix-rain.js',
    '/news-feeds-enhanced.js',
    '/news-script.js',
    '/chatbot.js',
    '/simple-chatbot.js',
    '/ainsiders-logo.png',
    '/logo.svg',
    '/blake-zimmerman.jpg',
    '/browser-cache-manager.js'
];

// External resources to cache
const EXTERNAL_RESOURCES = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
    'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
];

// API endpoints to cache
const API_ENDPOINTS = [
    '/api/cache',
    '/api/cache/status',
    '/api/cache/AI',
    '/api/cache/cybersecurity',
    '/api/cache/tech-reviews'
];

// Install event - pre-cache static assets
self.addEventListener('install', event => {
    console.log('🚀 Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            // Pre-cache static assets
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Pre-caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            }),
            
            // Pre-cache external resources
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('🌐 Pre-caching external resources...');
                return cache.addAll(EXTERNAL_RESOURCES);
            }),
            
            // Skip waiting to activate immediately
            self.skipWaiting()
        ]).then(() => {
            console.log('✅ Service Worker installed successfully');
        }).catch(error => {
            console.error('❌ Service Worker installation failed:', error);
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🔄 Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old caches
                    if (cacheName !== STATIC_CACHE && 
                        cacheName !== DYNAMIC_CACHE && 
                        cacheName !== API_CACHE &&
                        cacheName.startsWith('ainsiders-')) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Determine cache strategy based on request type
    const strategy = getCacheStrategy(request);
    
    event.respondWith(
        handleRequest(request, strategy)
    );
});

// Determine cache strategy for a request
function getCacheStrategy(request) {
    const url = new URL(request.url);
    
    // Static assets - cache first
    if (STATIC_ASSETS.includes(url.pathname) || 
        url.pathname.endsWith('.css') || 
        url.pathname.endsWith('.js') ||
        url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
        return CACHE_STRATEGIES.CACHE_FIRST;
    }
    
    // API requests - network first
    if (url.pathname.startsWith('/api/')) {
        return CACHE_STRATEGIES.NETWORK_FIRST;
    }
    
    // HTML pages - network first with fallback
    if (url.pathname.endsWith('.html') || url.pathname === '/') {
        return CACHE_STRATEGIES.NETWORK_FIRST;
    }
    
    // External resources - cache first
    if (url.hostname !== self.location.hostname) {
        return CACHE_STRATEGIES.CACHE_FIRST;
    }
    
    // Default to network first
    return CACHE_STRATEGIES.NETWORK_FIRST;
}

// Handle request with specified strategy
async function handleRequest(request, strategy) {
    const url = new URL(request.url);
    
    try {
        switch (strategy) {
            case CACHE_STRATEGIES.CACHE_FIRST:
                return await cacheFirst(request);
                
            case CACHE_STRATEGIES.NETWORK_FIRST:
                return await networkFirst(request);
                
            case CACHE_STRATEGIES.STATIC_FIRST:
                return await staticFirst(request);
                
            case CACHE_STRATEGIES.NETWORK_ONLY:
                return await networkOnly(request);
                
            case CACHE_STRATEGIES.CACHE_ONLY:
                return await cacheOnly(request);
                
            default:
                return await networkFirst(request);
        }
    } catch (error) {
        console.error('❌ Request handling failed:', error);
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/offline.html');
        }
        
        throw error;
    }
}

// Cache First Strategy
async function cacheFirst(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        console.log('📦 Cache hit:', request.url);
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            await cache.put(request, networkResponse.clone());
            console.log('💾 Cached:', request.url);
        }
        
        return networkResponse;
    } catch (error) {
        console.error('❌ Network request failed:', error);
        throw error;
    }
}

// Network First Strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            await cache.put(request, networkResponse.clone());
            console.log('💾 Cached (network first):', request.url);
        }
        
        return networkResponse;
    } catch (error) {
        console.log('🌐 Network failed, trying cache:', request.url);
        
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log('📦 Cache fallback hit:', request.url);
            return cachedResponse;
        }
        
        throw error;
    }
}

// Static First Strategy
async function staticFirst(request) {
    const staticCache = await caches.open(STATIC_CACHE);
    const cachedResponse = await staticCache.match(request);
    
    if (cachedResponse) {
        console.log('📦 Static cache hit:', request.url);
        return cachedResponse;
    }
    
    const dynamicCache = await caches.open(DYNAMIC_CACHE);
    const dynamicResponse = await dynamicCache.match(request);
    
    if (dynamicResponse) {
        console.log('📦 Dynamic cache hit:', request.url);
        return dynamicResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            await dynamicCache.put(request, networkResponse.clone());
            console.log('💾 Cached (static first):', request.url);
        }
        
        return networkResponse;
    } catch (error) {
        console.error('❌ All strategies failed:', error);
        throw error;
    }
}

// Network Only Strategy
async function networkOnly(request) {
    return await fetch(request);
}

// Cache Only Strategy
async function cacheOnly(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    throw new Error('Cache only - no cached response available');
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(performBackgroundSync());
    }
});

// Perform background sync
async function performBackgroundSync() {
    try {
        // Sync cached data with server
        const cache = await caches.open(API_CACHE);
        const requests = await cache.keys();
        
        for (const request of requests) {
            try {
                const response = await fetch(request);
                if (response.ok) {
                    await cache.put(request, response);
                    console.log('🔄 Synced:', request.url);
                }
            } catch (error) {
                console.error('❌ Sync failed for:', request.url, error);
            }
        }
        
        console.log('✅ Background sync completed');
    } catch (error) {
        console.error('❌ Background sync failed:', error);
    }
}

// Push notification handling
self.addEventListener('push', event => {
    console.log('📱 Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: '/ainsiders-logo.png',
        badge: '/logo.svg',
        vibrate: [200, 100, 200],
        data: {
            url: '/',
            timestamp: Date.now()
        },
        actions: [
            {
                action: 'view',
                title: 'View',
                icon: '/logo.svg'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/logo.svg'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('A.Insiders', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('👆 Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

// Message handling for communication with main thread
self.addEventListener('message', event => {
    console.log('💬 Message received:', event.data);
    
    const { type, data } = event.data;
    
    switch (type) {
        case 'CACHE_ASSET':
            cacheAsset(data.url, data.response);
            break;
            
        case 'CLEAR_CACHE':
            clearCache(data.cacheName);
            break;
            
        case 'GET_CACHE_STATS':
            getCacheStats(event.ports[0]);
            break;
            
        case 'PRELOAD_ASSETS':
            preloadAssets(data.assets);
            break;
            
        default:
            console.log('Unknown message type:', type);
    }
});

// Cache an asset
async function cacheAsset(url, response) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.put(url, response);
        console.log('💾 Asset cached via message:', url);
    } catch (error) {
        console.error('❌ Failed to cache asset:', error);
    }
}

// Clear cache
async function clearCache(cacheName) {
    try {
        if (cacheName) {
            await caches.delete(cacheName);
            console.log('🗑️ Cache cleared:', cacheName);
        } else {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(name => caches.delete(name))
            );
            console.log('🗑️ All caches cleared');
        }
    } catch (error) {
        console.error('❌ Failed to clear cache:', error);
    }
}

// Get cache statistics
async function getCacheStats(port) {
    try {
        const cacheNames = await caches.keys();
        const stats = {};
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            let size = 0;
            
            for (const request of keys) {
                const response = await cache.match(request);
                if (response) {
                    const blob = await response.blob();
                    size += blob.size;
                }
            }
            
            stats[cacheName] = {
                count: keys.length,
                size: size
            };
        }
        
        port.postMessage({ type: 'CACHE_STATS', data: stats });
    } catch (error) {
        console.error('❌ Failed to get cache stats:', error);
        port.postMessage({ type: 'ERROR', data: error.message });
    }
}

// Preload assets
async function preloadAssets(assets) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        
        for (const asset of assets) {
            try {
                const response = await fetch(asset);
                if (response.ok) {
                    await cache.put(asset, response);
                    console.log('💾 Preloaded:', asset);
                }
            } catch (error) {
                console.error('❌ Failed to preload:', asset, error);
            }
        }
        
        console.log('✅ Asset preloading completed');
    } catch (error) {
        console.error('❌ Asset preloading failed:', error);
    }
}

// Periodic cache cleanup
setInterval(async () => {
    try {
        const cacheNames = await caches.keys();
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            
            for (const request of keys) {
                const response = await cache.match(request);
                if (response) {
                    const headers = response.headers;
                    const cacheTime = headers.get('cache-time');
                    
                    if (cacheTime && (now - parseInt(cacheTime)) > maxAge) {
                        await cache.delete(request);
                        console.log('🧹 Cleaned up old cache entry:', request.url);
                    }
                }
            }
        }
    } catch (error) {
        console.error('❌ Cache cleanup failed:', error);
    }
}, 6 * 60 * 60 * 1000); // Every 6 hours

console.log('🎯 Service Worker loaded successfully'); 