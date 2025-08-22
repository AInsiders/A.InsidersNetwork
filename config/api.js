/**
 * Centralized API Configuration
 * Defines allowed upstream URLs, auth styles, and security settings
 */

// Allowed upstream base URLs (whitelist for security)
const ALLOWED_BASE_URLS = [
  'https://ipinfo.io',
  'https://api.ipstack.com',
  'https://api.ipgeolocation.io',
  'https://free.freeipapi.com',
  'https://api.ipapi.com',
  'https://ip-api.com',
  'https://httpbin.org',
  'https://api.github.com',
  'https://jsonplaceholder.typicode.com'
];

// Default auth style for APIs
const DEFAULT_AUTH_STYLE = 'bearer'; // 'bearer' | 'x-api-key' | 'query-key'

// Query parameter name for API key (when using query-key auth style)
const QUERY_KEY_NAME = 'api_key';

// Rate limiting configuration
const RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 60,
  WINDOW_MS: 60 * 1000, // 1 minute
  BURST_LIMIT: 10 // Allow burst of 10 requests
};

// Timeout configuration
const TIMEOUTS = {
  DEFAULT: 10000, // 10 seconds
  SHORT: 5000,    // 5 seconds
  LONG: 30000     // 30 seconds
};

// Retry configuration
const RETRY_CONFIG = {
  DEFAULT_RETRIES: 2,
  MAX_RETRIES: 3,
  BASE_DELAY: 1000, // 1 second
  MAX_DELAY: 10000  // 10 seconds
};

// SSRF protection - blocked IP ranges
const BLOCKED_IP_RANGES = [
  '127.0.0.0/8',      // localhost
  '10.0.0.0/8',       // private network
  '172.16.0.0/12',    // private network
  '192.168.0.0/16',   // private network
  '169.254.0.0/16',   // link-local
  '::1/128',          // IPv6 localhost
  'fc00::/7',         // IPv6 unique local
  'fe80::/10'         // IPv6 link-local
];

// CORS configuration
const CORS_CONFIG = {
  ALLOWED_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    // Add your production domain here
    // 'https://yourdomain.com'
  ],
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  MAX_AGE: 86400 // 24 hours
};

// API provider specific configurations
const API_PROVIDERS = {
  ipinfo: {
    baseUrl: 'https://ipinfo.io',
    authStyle: 'query-key',
    queryKeyName: 'token',
    timeout: TIMEOUTS.DEFAULT,
    retries: RETRY_CONFIG.DEFAULT_RETRIES
  },
  ipstack: {
    baseUrl: 'http://api.ipstack.com',
    authStyle: 'query-key',
    queryKeyName: 'access_key',
    timeout: TIMEOUTS.DEFAULT,
    retries: RETRY_CONFIG.DEFAULT_RETRIES
  },
  ipgeolocation: {
    baseUrl: 'https://api.ipgeolocation.io',
    authStyle: 'query-key',
    queryKeyName: 'apiKey',
    timeout: TIMEOUTS.DEFAULT,
    retries: RETRY_CONFIG.DEFAULT_RETRIES
  },
  freeipapi: {
    baseUrl: 'https://free.freeipapi.com',
    authStyle: 'none', // No auth required
    timeout: TIMEOUTS.SHORT,
    retries: RETRY_CONFIG.DEFAULT_RETRIES
  }
};

/**
 * Check if a URL is allowed (SSRF protection)
 */
function isAllowedUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Check against allowed base URLs
    const isAllowed = ALLOWED_BASE_URLS.some(allowedUrl => {
      const allowedHostname = new URL(allowedUrl).hostname;
      return hostname === allowedHostname || hostname.endsWith(`.${allowedHostname}`);
    });
    
    if (!isAllowed) {
      console.warn(`[${new Date().toISOString()}] Blocked request to unauthorized URL: ${url}`);
      return false;
    }
    
    // Additional security checks
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.warn(`[${new Date().toISOString()}] Blocked localhost request: ${url}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Invalid URL: ${url}`, error.message);
    return false;
  }
}

/**
 * Get provider configuration by name
 */
function getProviderConfig(providerName) {
  return API_PROVIDERS[providerName] || null;
}

/**
 * Validate API key format (basic validation)
 */
function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // Basic validation - adjust based on your API key format
  if (apiKey.length < 10) {
    return false;
  }
  
  return true;
}

/**
 * Rate limiting helper
 */
class RateLimiter {
  constructor() {
    this.requests = new Map();
  }
  
  isAllowed(clientId) {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT.WINDOW_MS;
    
    if (!this.requests.has(clientId)) {
      this.requests.set(clientId, []);
    }
    
    const clientRequests = this.requests.get(clientId);
    
    // Remove old requests outside the window
    const recentRequests = clientRequests.filter(timestamp => timestamp > windowStart);
    this.requests.set(clientId, recentRequests);
    
    // Check if under limit
    if (recentRequests.length >= RATE_LIMIT.REQUESTS_PER_MINUTE) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    return true;
  }
  
  getRemainingRequests(clientId) {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT.WINDOW_MS;
    
    if (!this.requests.has(clientId)) {
      return RATE_LIMIT.REQUESTS_PER_MINUTE;
    }
    
    const clientRequests = this.requests.get(clientId);
    const recentRequests = clientRequests.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, RATE_LIMIT.REQUESTS_PER_MINUTE - recentRequests.length);
  }
  
  reset() {
    this.requests.clear();
  }
}

// Create global rate limiter instance
const rateLimiter = new RateLimiter();

module.exports = {
  ALLOWED_BASE_URLS,
  DEFAULT_AUTH_STYLE,
  QUERY_KEY_NAME,
  RATE_LIMIT,
  TIMEOUTS,
  RETRY_CONFIG,
  BLOCKED_IP_RANGES,
  CORS_CONFIG,
  API_PROVIDERS,
  isAllowedUrl,
  getProviderConfig,
  validateApiKey,
  RateLimiter,
  rateLimiter
};
