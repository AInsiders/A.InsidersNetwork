/**
 * Secure API Client Wrapper
 * Handles authentication, retries, and error handling for outbound API calls
 * Never exposes API keys to the browser
 */

const API_KEY = process.env.API_KEY;
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Auth style constants
const AUTH_STYLES = {
  BEARER: 'bearer',
  X_API_KEY: 'x-api-key',
  QUERY_KEY: 'query-key',
  NONE: 'none'
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Determine if a request method is idempotent (safe to retry)
 */
const isIdempotent = (method) => {
  const idempotentMethods = ['GET', 'HEAD', 'OPTIONS'];
  return idempotentMethods.includes(method.toUpperCase());
};

/**
 * Build URL with query parameters
 */
const buildUrl = (baseUrl, path, query = {}) => {
  const url = new URL(path, baseUrl);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
};

/**
 * Apply authentication to request based on auth style
 */
const applyAuth = (options, authStyle, queryKeyName = 'api_key') => {
  switch (authStyle) {
    case AUTH_STYLES.BEARER:
      if (!API_KEY) {
        throw new Error('API_KEY not configured in environment');
      }
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${API_KEY}`
      };
      break;
    
    case AUTH_STYLES.X_API_KEY:
      if (!API_KEY) {
        throw new Error('API_KEY not configured in environment');
      }
      options.headers = {
        ...options.headers,
        'X-API-Key': API_KEY
      };
      break;
    
    case AUTH_STYLES.QUERY_KEY:
      // Query params will be handled in buildUrl
      if (!API_KEY) {
        throw new Error('API_KEY not configured in environment');
      }
      break;
    
    case AUTH_STYLES.NONE:
      // No authentication required
      break;
    
    default:
      throw new Error(`Unsupported auth style: ${authStyle}`);
  }
};

/**
 * Main API fetch wrapper with retry logic and error handling
 */
async function apiFetch({
  url,
  method = 'GET',
  headers = {},
  query = {},
  body = null,
  authStyle = AUTH_STYLES.BEARER,
  timeout = DEFAULT_TIMEOUT,
  retries = DEFAULT_RETRIES,
  queryKeyName = 'api_key'
}) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // Log request (without sensitive data)
  console.log(`[${new Date().toISOString()}] API Request ${requestId}: ${method} ${url}`);
  
  // Apply authentication
  const options = {
    method: method.toUpperCase(),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...headers
    },
    timeout
  };

  // Apply auth based on style
  applyAuth(options, authStyle, queryKeyName);
  
  // Add query parameters (including API key for query-key auth style)
  const finalQuery = { ...query };
  if (authStyle === AUTH_STYLES.QUERY_KEY && API_KEY) {
    finalQuery[queryKeyName] = API_KEY;
  }
  
  const finalUrl = buildUrl(url, '', finalQuery);
  
  // Add body for non-GET requests
  if (body && method.toUpperCase() !== 'GET') {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  let lastError;
  const maxAttempts = isIdempotent(method) ? retries + 1 : 1;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(finalUrl, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const responseTime = Date.now() - startTime;
      
      // Log response (without sensitive data)
      console.log(`[${new Date().toISOString()}] API Response ${requestId}: ${response.status} (${responseTime}ms)`);
      
      // Handle different response types
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(`API Error ${response.status}: ${data.message || data.error || 'Unknown error'}`);
        }
        
        return {
          success: true,
          data,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          responseTime
        };
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        
        if (!response.ok) {
          throw new Error(`API Error ${response.status}: ${text}`);
        }
        
        return {
          success: true,
          data: text,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          responseTime,
          isText: true
        };
      }
      
    } catch (error) {
      lastError = error;
      const responseTime = Date.now() - startTime;
      
      // Log error (without sensitive data)
      console.error(`[${new Date().toISOString()}] API Error ${requestId} (attempt ${attempt}/${maxAttempts}): ${error.message} (${responseTime}ms)`);
      
      // Don't retry on certain errors
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      if (error.message.includes('401') || error.message.includes('403')) {
        throw new Error('Authentication failed - check API key');
      }
      
      // Retry logic for idempotent requests
      if (attempt < maxAttempts && isIdempotent(method)) {
        const delay = RETRY_DELAY * attempt; // Exponential backoff
        console.log(`[${new Date().toISOString()}] Retrying ${requestId} in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      
      break;
    }
  }
  
  // If we get here, all retries failed
  throw lastError || new Error('Request failed after all retry attempts');
}

/**
 * Convenience methods for common HTTP methods
 */
const apiClient = {
  get: (url, options = {}) => apiFetch({ ...options, url, method: 'GET' }),
  post: (url, body, options = {}) => apiFetch({ ...options, url, method: 'POST', body }),
  put: (url, body, options = {}) => apiFetch({ ...options, url, method: 'PUT', body }),
  patch: (url, body, options = {}) => apiFetch({ ...options, url, method: 'PATCH', body }),
  delete: (url, options = {}) => apiFetch({ ...options, url, method: 'DELETE' }),
  
  // Raw fetch method
  fetch: apiFetch,
  
  // Constants
  AUTH_STYLES,
  
  // Utility methods
  isIdempotent,
  buildUrl
};

module.exports = apiClient;
