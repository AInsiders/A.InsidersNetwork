/**
 * Enhanced IP Geolocation Service
 * Comprehensive IP analysis with multiple providers, threat intelligence, and detailed information
 * Version: 2.0.0
 */

class EnhancedIPGeolocation {
    constructor() {
        this.providers = {
            ipinfo: {
                name: 'IPInfo.io',
                baseUrl: 'https://ipinfo.io',
                requiresToken: true,
                rateLimit: 50000, // requests per month
                features: ['location', 'org', 'hostname', 'asn', 'privacy']
            },
            ipapi: {
                name: 'IP-API.com',
                baseUrl: 'http://ip-api.com/json',
                requiresToken: false,
                rateLimit: 1000, // requests per hour
                features: ['location', 'org', 'isp', 'threat', 'mobile']
            },
            ipgeolocation: {
                name: 'IPGeolocation.io',
                baseUrl: 'https://api.ipgeolocation.io/ipgeo',
                requiresToken: true,
                rateLimit: 1000, // requests per day
                features: ['location', 'org', 'isp', 'threat', 'timezone', 'currency']
            },
            maxmind: {
                name: 'MaxMind GeoLite2',
                baseUrl: 'https://geoip.maxmind.com/geoip/v2.1/insights',
                requiresToken: true,
                rateLimit: 1000, // requests per day
                features: ['location', 'org', 'confidence', 'accuracy']
            },
            shodan: {
                name: 'Shodan',
                baseUrl: 'https://api.shodan.io/shodan/host',
                requiresToken: true,
                rateLimit: 100, // requests per day
                features: ['ports', 'services', 'vulnerabilities', 'hostnames']
            }
        };
        
        this.cache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        this.requestHistory = [];
        this.maxHistorySize = 100;
    }

    /**
     * Get comprehensive IP information from multiple providers
     */
    async getComprehensiveIPInfo(ip, options = {}) {
        try {
            // Validate IP address
            if (!this.isValidIP(ip)) {
                throw new Error('Invalid IP address format');
            }

            // Check cache first
            const cached = this.getFromCache(ip);
            if (cached && !options.forceRefresh) {
                console.log(`Returning cached data for ${ip}`);
                return cached;
            }

            console.log(`Fetching comprehensive IP info for ${ip}...`);
            
            const results = {
                ip: ip,
                timestamp: new Date().toISOString(),
                providers: {},
                aggregated: {},
                confidence: {},
                threats: [],
                services: [],
                errors: []
            };

            // Fetch from multiple providers in parallel
            const providerPromises = [];
            
            if (options.includeBasic !== false) {
                providerPromises.push(this.fetchFromIPAPI(ip));
                providerPromises.push(this.fetchFromIPInfo(ip));
            }
            
            if (options.includeDetailed) {
                providerPromises.push(this.fetchFromIPGeolocation(ip));
                providerPromises.push(this.fetchFromMaxMind(ip));
            }
            
            if (options.includeThreatIntel) {
                providerPromises.push(this.fetchFromShodan(ip));
                providerPromises.push(this.fetchThreatIntelligence(ip));
            }

            // Wait for all providers to respond
            const providerResults = await Promise.allSettled(providerPromises);
            
            // Process results from each provider
            providerResults.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    const providerName = result.value.provider;
                    results.providers[providerName] = result.value.data;
                } else if (result.status === 'rejected') {
                    results.errors.push({
                        provider: `provider_${index}`,
                        error: result.reason.message
                    });
                }
            });

            // Aggregate data from all providers
            results.aggregated = this.aggregateProviderData(results.providers);
            
            // Calculate confidence scores
            results.confidence = this.calculateConfidenceScores(results.providers);
            
            // Analyze security threats
            results.threats = this.analyzeThreatData(results.providers);
            
            // Extract service information
            results.services = this.extractServiceInfo(results.providers);
            
            // Cache the results
            this.cacheResults(ip, results);
            
            // Add to request history
            this.addToHistory(ip, results);

            return results;

        } catch (error) {
            console.error(`Error getting IP info for ${ip}:`, error);
            throw new Error(`Failed to get IP information: ${error.message}`);
        }
    }

    /**
     * Fetch basic location data from IP-API.com (free tier)
     */
    async fetchFromIPAPI(ip) {
        try {
            const url = `${this.providers.ipapi.baseUrl}/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,mobile,proxy,hosting`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'A.Insiders Enhanced IP Geolocation/2.0'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.status === 'fail') {
                throw new Error(data.message || 'IP-API request failed');
            }

            return {
                provider: 'ipapi',
                data: {
                    country: data.country,
                    countryCode: data.countryCode,
                    region: data.regionName,
                    city: data.city,
                    postal: data.zip,
                    latitude: data.lat,
                    longitude: data.lon,
                    timezone: data.timezone,
                    isp: data.isp,
                    org: data.org,
                    asn: data.as,
                    isMobile: data.mobile,
                    isProxy: data.proxy,
                    isHosting: data.hosting,
                    accuracy: 'medium'
                }
            };
        } catch (error) {
            console.error('IP-API error:', error);
            throw error;
        }
    }

    /**
     * Fetch detailed data from IPInfo.io
     */
    async fetchFromIPInfo(ip) {
        try {
            // Note: This requires an API token for detailed info
            const token = process.env.IPINFO_TOKEN || 'demo'; // Use demo for basic info
            const url = `${this.providers.ipinfo.baseUrl}/${ip}?token=${token}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'A.Insiders Enhanced IP Geolocation/2.0'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            const [lat, lon] = (data.loc || '0,0').split(',').map(Number);

            return {
                provider: 'ipinfo',
                data: {
                    country: data.country,
                    region: data.region,
                    city: data.city,
                    postal: data.postal,
                    latitude: lat,
                    longitude: lon,
                    timezone: data.timezone,
                    org: data.org,
                    hostname: data.hostname,
                    asn: data.asn ? data.asn.asn : null,
                    asnName: data.asn ? data.asn.name : null,
                    asnDomain: data.asn ? data.asn.domain : null,
                    accuracy: 'high'
                }
            };
        } catch (error) {
            console.error('IPInfo error:', error);
            throw error;
        }
    }

    /**
     * Fetch detailed geolocation from IPGeolocation.io
     */
    async fetchFromIPGeolocation(ip) {
        try {
            const token = process.env.IPGEOLOCATION_TOKEN;
            if (!token) {
                throw new Error('IPGeolocation.io API token not configured');
            }

            const url = `${this.providers.ipgeolocation.baseUrl}?apiKey=${token}&ip=${ip}&fields=*`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'A.Insiders Enhanced IP Geolocation/2.0'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                provider: 'ipgeolocation',
                data: {
                    country: data.country_name,
                    countryCode: data.country_code2,
                    region: data.state_prov,
                    city: data.city,
                    postal: data.zipcode,
                    latitude: parseFloat(data.latitude),
                    longitude: parseFloat(data.longitude),
                    timezone: data.time_zone.name,
                    isp: data.isp,
                    org: data.organization,
                    asn: data.asn,
                    currency: data.currency.name,
                    languages: data.languages,
                    threatLevel: data.threat ? data.threat.threat_level : 'low',
                    isProxy: data.threat ? data.threat.is_proxy : false,
                    accuracy: 'very_high'
                }
            };
        } catch (error) {
            console.error('IPGeolocation error:', error);
            throw error;
        }
    }

    /**
     * Fetch threat intelligence and service data from Shodan
     */
    async fetchFromShodan(ip) {
        try {
            const token = process.env.SHODAN_TOKEN;
            if (!token) {
                throw new Error('Shodan API token not configured');
            }

            const url = `${this.providers.shodan.baseUrl}/${ip}?key=${token}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'A.Insiders Enhanced IP Geolocation/2.0'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                provider: 'shodan',
                data: {
                    country: data.country_name,
                    countryCode: data.country_code,
                    region: data.region_code,
                    city: data.city,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    org: data.org,
                    isp: data.isp,
                    asn: data.asn,
                    hostnames: data.hostnames || [],
                    domains: data.domains || [],
                    ports: data.ports || [],
                    services: data.data ? data.data.map(service => ({
                        port: service.port,
                        protocol: service.transport,
                        service: service.product,
                        version: service.version,
                        banner: service.data
                    })) : [],
                    vulnerabilities: data.vulns || [],
                    lastSeen: data.last_update,
                    accuracy: 'high'
                }
            };
        } catch (error) {
            console.error('Shodan error:', error);
            throw error;
        }
    }

    /**
     * Fetch additional threat intelligence
     */
    async fetchThreatIntelligence(ip) {
        try {
            // This would integrate with threat intelligence providers
            // For now, return a placeholder structure
            return {
                provider: 'threat_intel',
                data: {
                    threatScore: 0,
                    categories: [],
                    malwareDetections: [],
                    reputation: 'unknown',
                    lastSeen: null,
                    sources: []
                }
            };
        } catch (error) {
            console.error('Threat intelligence error:', error);
            throw error;
        }
    }

    /**
     * Aggregate data from multiple providers
     */
    aggregateProviderData(providers) {
        const aggregated = {
            location: {},
            network: {},
            organization: {},
            security: {}
        };

        const values = {
            countries: [],
            regions: [],
            cities: [],
            latitudes: [],
            longitudes: [],
            timezones: [],
            isps: [],
            orgs: [],
            asns: []
        };

        // Collect all values from providers
        Object.values(providers).forEach(provider => {
            if (provider.country) values.countries.push(provider.country);
            if (provider.region) values.regions.push(provider.region);
            if (provider.city) values.cities.push(provider.city);
            if (provider.latitude) values.latitudes.push(provider.latitude);
            if (provider.longitude) values.longitudes.push(provider.longitude);
            if (provider.timezone) values.timezones.push(provider.timezone);
            if (provider.isp) values.isps.push(provider.isp);
            if (provider.org) values.orgs.push(provider.org);
            if (provider.asn) values.asns.push(provider.asn);
        });

        // Use most common values or averages
        aggregated.location = {
            country: this.getMostCommon(values.countries),
            region: this.getMostCommon(values.regions),
            city: this.getMostCommon(values.cities),
            latitude: this.getAverage(values.latitudes),
            longitude: this.getAverage(values.longitudes),
            timezone: this.getMostCommon(values.timezones)
        };

        aggregated.network = {
            isp: this.getMostCommon(values.isps),
            org: this.getMostCommon(values.orgs),
            asn: this.getMostCommon(values.asns)
        };

        return aggregated;
    }

    /**
     * Calculate confidence scores for aggregated data
     */
    calculateConfidenceScores(providers) {
        const providerCount = Object.keys(providers).length;
        if (providerCount === 0) return {};

        const confidence = {
            overall: 0,
            location: 0,
            network: 0,
            security: 0
        };

        // Simple confidence calculation based on provider agreement
        // In a real implementation, this would be more sophisticated
        confidence.overall = Math.min(providerCount * 0.25, 1.0);
        confidence.location = confidence.overall;
        confidence.network = confidence.overall;
        confidence.security = confidence.overall * 0.8; // Security data is often less reliable

        return confidence;
    }

    /**
     * Analyze threat data from all providers
     */
    analyzeThreatData(providers) {
        const threats = [];
        
        Object.values(providers).forEach(provider => {
            if (provider.isProxy) {
                threats.push({
                    type: 'proxy',
                    severity: 'medium',
                    description: 'IP appears to be a proxy server',
                    source: 'provider_detection'
                });
            }
            
            if (provider.isHosting) {
                threats.push({
                    type: 'hosting',
                    severity: 'low',
                    description: 'IP belongs to a hosting provider',
                    source: 'provider_detection'
                });
            }
            
            if (provider.vulnerabilities && provider.vulnerabilities.length > 0) {
                threats.push({
                    type: 'vulnerabilities',
                    severity: 'high',
                    description: `${provider.vulnerabilities.length} known vulnerabilities detected`,
                    details: provider.vulnerabilities,
                    source: 'shodan'
                });
            }
        });

        return threats;
    }

    /**
     * Extract service information
     */
    extractServiceInfo(providers) {
        const services = [];
        
        Object.values(providers).forEach(provider => {
            if (provider.services && Array.isArray(provider.services)) {
                services.push(...provider.services);
            }
            
            if (provider.ports && Array.isArray(provider.ports)) {
                provider.ports.forEach(port => {
                    services.push({
                        port: port,
                        protocol: 'unknown',
                        service: 'unknown',
                        source: 'port_scan'
                    });
                });
            }
        });

        return services;
    }

    /**
     * Utility functions
     */
    isValidIP(ip) {
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    }

    getMostCommon(array) {
        if (!array || array.length === 0) return null;
        const counts = {};
        array.forEach(item => counts[item] = (counts[item] || 0) + 1);
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }

    getAverage(array) {
        if (!array || array.length === 0) return null;
        const sum = array.reduce((a, b) => a + b, 0);
        return sum / array.length;
    }

    getFromCache(ip) {
        const cached = this.cache.get(ip);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    }

    cacheResults(ip, data) {
        this.cache.set(ip, {
            timestamp: Date.now(),
            data: data
        });
    }

    addToHistory(ip, results) {
        this.requestHistory.unshift({
            ip: ip,
            timestamp: Date.now(),
            providers: Object.keys(results.providers),
            success: true
        });
        
        if (this.requestHistory.length > this.maxHistorySize) {
            this.requestHistory = this.requestHistory.slice(0, this.maxHistorySize);
        }
    }

    /**
     * Get request history and statistics
     */
    getAnalytics() {
        return {
            cacheSize: this.cache.size,
            requestHistory: this.requestHistory,
            totalRequests: this.requestHistory.length,
            successRate: this.requestHistory.filter(r => r.success).length / this.requestHistory.length,
            providers: this.providers
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedIPGeolocation;
}

// Global instance for browser usage
if (typeof window !== 'undefined') {
    window.EnhancedIPGeolocation = EnhancedIPGeolocation;
}