// Client-side utility for server-side IP detection
class IPServerClient {
    constructor(serverUrl = 'http://localhost:3001') {
        this.serverUrl = serverUrl;
        this.endpoints = {
            detect: `${serverUrl}/api/ip/detect`,
            info: `${serverUrl}/api/ip/info`
        };
    }

    async detectIP() {
        try {
            console.log('Detecting IP via server...');
            const response = await fetch(this.endpoints.detect, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Server error');
            }

            console.log('IP detected successfully:', result.data.ip);
            return result.data;
        } catch (error) {
            console.error('Error detecting IP via server:', error);
            throw error;
        }
    }

    async getIPInfo(ip) {
        try {
            console.log(`Getting IP info for ${ip} via server...`);
            const response = await fetch(`${this.endpoints.info}/${ip}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Server error');
            }

            console.log('IP info retrieved successfully');
            return result.data;
        } catch (error) {
            console.error('Error getting IP info via server:', error);
            throw error;
        }
    }

    // Fallback method for when server is unavailable
    async detectIPFallback() {
        try {
            // Try local IP detection methods
            const response = await fetch('https://httpbin.org/ip');
            const data = await response.json();
            return {
                ip: data.origin,
                country: 'Unknown',
                region: 'Unknown',
                city: 'Unknown',
                org: 'Unknown',
                timezone: 'Unknown',
                loc: 'Unknown',
                detectedBy: 'fallback',
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Fallback IP detection failed:', error);
            throw new Error('Unable to detect IP address');
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IPServerClient;
} 