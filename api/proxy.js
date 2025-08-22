/**
 * Secure API Proxy Endpoint
 * Handles authenticated requests to external APIs with SSRF protection
 */

const apiClient = require('../lib/apiClient');
const apiConfig = require('../config/api');

/**
 * Get client IP address from request
 */
function getClientIp(req) {
  const xff = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const raw = xff || req.ip || req.connection?.remoteAddress || '';
  return raw.replace('::ffff:', '');
}

/**
 * Handle CORS preflight requests
 */
function handleCORS(req, res) {
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  if (origin && apiConfig.CORS_CONFIG.ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', apiConfig.CORS_CONFIG.ALLOWED_METHODS.join(', '));
  res.setHeader('Access-Control-Allow-Headers', apiConfig.CORS_CONFIG.ALLOWED_HEADERS.join(', '));
  res.setHeader('Access-Control-Max-Age', apiConfig.CORS_CONFIG.MAX_AGE);
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return false;
}

/**
 * Main proxy handler
 */
async function handleProxy(req, res) {
  const startTime = Date.now();
  
  // Handle CORS
  if (handleCORS(req, res)) {
    return;
  }
  
  try {
    // Rate limiting
    const clientId = getClientIp(req);
    if (!apiConfig.rateLimiter.isAllowed(clientId)) {
      const remaining = apiConfig.rateLimiter.getRemainingRequests(clientId);
      res.status(429).json({
        error: 'Rate limit exceeded',
        detail: 'Too many requests',
        retryAfter: 60,
        remainingRequests: remaining
      });
      return;
    }
    
    // Parse request parameters
    const { baseUrl, path, method = 'GET', query = {}, body, authStyle, provider } = req.body;
    
    // Validate required parameters
    if (!baseUrl) {
      res.status(400).json({
        error: 'Missing required parameter: baseUrl',
        detail: 'baseUrl is required to specify the target API endpoint'
      });
      return;
    }
    
    // SSRF protection - check if URL is allowed
    if (!apiConfig.isAllowedUrl(baseUrl)) {
      res.status(403).json({
        error: 'Forbidden',
        detail: 'Request to unauthorized URL blocked for security'
      });
      return;
    }
    
    // Build full URL
    const fullUrl = path ? `${baseUrl}/${path.replace(/^\/+/, '')}` : baseUrl;
    
    // Determine auth style
    let finalAuthStyle = authStyle || apiConfig.DEFAULT_AUTH_STYLE;
    let queryKeyName = apiConfig.QUERY_KEY_NAME;
    
    // If provider is specified, use provider-specific config
    if (provider) {
      const providerConfig = apiConfig.getProviderConfig(provider);
      if (providerConfig) {
        finalAuthStyle = providerConfig.authStyle;
        queryKeyName = providerConfig.queryKeyName || apiConfig.QUERY_KEY_NAME;
      }
    }
    
    // Prepare request options
    const requestOptions = {
      url: fullUrl,
      method: method.toUpperCase(),
      query,
      body,
      authStyle: finalAuthStyle,
      queryKeyName,
      timeout: apiConfig.TIMEOUTS.DEFAULT,
      retries: apiConfig.RETRY_CONFIG.DEFAULT_RETRIES
    };
    
    // Add custom headers if provided
    if (req.headers['x-custom-headers']) {
      try {
        const customHeaders = JSON.parse(req.headers['x-custom-headers']);
        requestOptions.headers = customHeaders;
      } catch (error) {
        console.warn(`[${new Date().toISOString()}] Invalid custom headers: ${req.headers['x-custom-headers']}`);
      }
    }
    
    // Make the API request
    const result = await apiClient.fetch(requestOptions);
    
    const responseTime = Date.now() - startTime;
    
    // Log successful request (without sensitive data)
    console.log(`[${new Date().toISOString()}] Proxy success: ${method} ${fullUrl} (${responseTime}ms)`);
    
    // Return the response
    res.status(result.status || 200).json({
      success: true,
      data: result.data,
      status: result.status,
      responseTime,
      headers: result.headers,
      isText: result.isText || false
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Log error (without sensitive data)
    console.error(`[${new Date().toISOString()}] Proxy error: ${error.message} (${responseTime}ms)`);
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error.message.includes('timeout')) {
      statusCode = 408;
    } else if (error.message.includes('401') || error.message.includes('403')) {
      statusCode = 401;
    } else if (error.message.includes('404')) {
      statusCode = 404;
    } else if (error.message.includes('429')) {
      statusCode = 429;
    }
    
    res.status(statusCode).json({
      success: false,
      error: 'Proxy request failed',
      detail: error.message,
      responseTime
    });
  }
}

/**
 * Express middleware for the proxy endpoint
 */
function proxyMiddleware(req, res) {
  // Only allow POST requests for security
  if (req.method !== 'POST') {
    res.status(405).json({
      error: 'Method not allowed',
      detail: 'Only POST requests are allowed for the proxy endpoint'
    });
    return;
  }
  
  handleProxy(req, res);
}

module.exports = {
  handleProxy,
  proxyMiddleware
};
