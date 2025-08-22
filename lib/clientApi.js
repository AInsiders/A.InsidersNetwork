/**
 * Client-side API Wrapper
 * Makes secure requests through the server-side proxy
 * Never exposes API keys to the browser
 */

class ClientApi {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.proxyEndpoint = `${baseUrl}/api/proxy`;
  }

  /**
   * Make a secure API request through the proxy
   */
  async request({
    baseUrl,
    path = '',
    method = 'GET',
    query = {},
    body = null,
    authStyle = 'bearer',
    provider = null,
    timeout = 10000
  }) {
    try {
      const response = await fetch(this.proxyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          baseUrl,
          path,
          method,
          query,
          body,
          authStyle,
          provider
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.detail || 'Request failed');
      }

      return result;
    } catch (error) {
      console.error('Client API request failed:', error);
      throw error;
    }
  }

  /**
   * Convenience methods for common HTTP methods
   */
  async get(baseUrl, path = '', query = {}, options = {}) {
    return this.request({
      baseUrl,
      path,
      method: 'GET',
      query,
      ...options
    });
  }

  async post(baseUrl, path = '', body = null, options = {}) {
    return this.request({
      baseUrl,
      path,
      method: 'POST',
      body,
      ...options
    });
  }

  async put(baseUrl, path = '', body = null, options = {}) {
    return this.request({
      baseUrl,
      path,
      method: 'PUT',
      body,
      ...options
    });
  }

  async delete(baseUrl, path = '', options = {}) {
    return this.request({
      baseUrl,
      path,
      method: 'DELETE',
      ...options
    });
  }

  /**
   * IP Geolocation specific methods
   */
  async getIpInfo(ip, options = {}) {
    return this.request({
      baseUrl: 'https://ipinfo.io',
      path: ip,
      provider: 'ipinfo',
      ...options
    });
  }

  async getIpStack(ip, options = {}) {
    return this.request({
      baseUrl: 'http://api.ipstack.com',
      path: ip,
      query: { format: 1 },
      provider: 'ipstack',
      ...options
    });
  }

  async getIpGeolocation(ip, options = {}) {
    return this.request({
      baseUrl: 'https://api.ipgeolocation.io',
      path: 'v2/ipgeo',
      query: { ip },
      provider: 'ipgeolocation',
      ...options
    });
  }

  async getFreeIPAPI(ip, options = {}) {
    return this.request({
      baseUrl: 'https://free.freeipapi.com',
      path: `api/json/${ip}`,
      provider: 'freeipapi',
      ...options
    });
  }

  /**
   * Test the proxy connection
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data
        };
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create global instance
const clientApi = new ClientApi();

// Export for use in browser
if (typeof window !== 'undefined') {
  window.clientApi = clientApi;
}

module.exports = { ClientApi, clientApi };
