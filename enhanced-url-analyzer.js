/**
 * Enhanced URL Analysis Service
 * Comprehensive URL and domain analysis with security intelligence and detailed metadata
 * Version: 2.0.0
 */

class EnhancedURLAnalyzer {
    constructor() {
        this.maxRedirects = 15;
        this.timeout = 15000;
        this.cache = new Map();
        this.cacheExpiry = 60 * 60 * 1000; // 1 hour
        
        this.securityProviders = {
            safebrowsing: {
                name: 'Google Safe Browsing',
                baseUrl: 'https://safebrowsing.googleapis.com/v4/threatMatches:find'
            },
            virustotal: {
                name: 'VirusTotal',
                baseUrl: 'https://www.virustotal.com/vtapi/v2/url/report'
            },
            urlvoid: {
                name: 'URLVoid',
                baseUrl: 'https://api.urlvoid.com/v1'
            }
        };
        
        this.whoisProviders = {
            whoisjson: {
                name: 'WhoisJSON',
                baseUrl: 'https://whoisjson.com/api/v1/whois'
            },
            whoisapi: {
                name: 'WhoisAPI',
                baseUrl: 'https://www.whoisxmlapi.com/whoisserver/WhoisService'
            }
        };
    }

    /**
     * Comprehensive URL analysis with security checks
     */
    async analyzeURL(originalUrl, options = {}) {
        try {
            // Validate URL
            if (!this.isValidURL(originalUrl)) {
                throw new Error('Invalid URL format');
            }

            // Check cache
            const cached = this.getFromCache(originalUrl);
            if (cached && !options.forceRefresh) {
                console.log(`Returning cached analysis for ${originalUrl}`);
                return cached;
            }

            console.log(`Starting comprehensive analysis of ${originalUrl}...`);

            const analysis = {
                originalUrl: originalUrl,
                timestamp: new Date().toISOString(),
                redirectChain: [],
                finalUrl: null,
                totalRedirects: 0,
                domain: {},
                security: {},
                metadata: {},
                certificates: {},
                performance: {},
                errors: []
            };

            // Extract domain information
            analysis.domain = await this.analyzeDomain(originalUrl);

            // Follow redirect chain with enhanced tracking
            const redirectResult = await this.followEnhancedRedirectChain(originalUrl);
            analysis.redirectChain = redirectResult.chain;
            analysis.finalUrl = redirectResult.finalUrl;
            analysis.totalRedirects = redirectResult.totalRedirects;

            // Security analysis
            if (options.includeSecurity !== false) {
                analysis.security = await this.performSecurityAnalysis(originalUrl, analysis.finalUrl);
            }

            // Extract metadata from final URL
            if (options.includeMetadata !== false) {
                analysis.metadata = await this.extractMetadata(analysis.finalUrl || originalUrl);
            }

            // SSL certificate analysis
            if (options.includeCertificates !== false) {
                analysis.certificates = await this.analyzeCertificates(analysis.finalUrl || originalUrl);
            }

            // Performance analysis
            if (options.includePerformance !== false) {
                analysis.performance = await this.analyzePerformance(analysis.finalUrl || originalUrl);
            }

            // WHOIS and domain intelligence
            if (options.includeWhois !== false) {
                analysis.domain.whois = await this.getWhoisData(analysis.domain.name);
            }

            // Risk assessment
            analysis.riskAssessment = this.calculateRiskScore(analysis);

            // Cache results
            this.cacheResults(originalUrl, analysis);

            return analysis;

        } catch (error) {
            console.error(`Error analyzing URL ${originalUrl}:`, error);
            throw new Error(`URL analysis failed: ${error.message}`);
        }
    }

    /**
     * Enhanced domain analysis with comprehensive metadata
     */
    async analyzeDomain(url) {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            
            const domainInfo = {
                name: domain,
                tld: this.extractTLD(domain),
                subdomain: this.extractSubdomain(domain),
                isIPAddress: this.isIPAddress(domain),
                dnsSuffix: this.getDNSSuffix(domain),
                registrarInfo: {},
                dnsRecords: {},
                reputation: {},
                age: null,
                isParked: false,
                isSuspicious: false
            };

            // DNS analysis
            domainInfo.dnsRecords = await this.analyzeDNSRecords(domain);
            
            // Domain reputation check
            domainInfo.reputation = await this.checkDomainReputation(domain);
            
            // Subdomain analysis
            if (domainInfo.subdomain) {
                domainInfo.subdomainAnalysis = await this.analyzeSubdomain(domain);
            }

            return domainInfo;

        } catch (error) {
            console.error('Domain analysis error:', error);
            return {
                name: 'unknown',
                error: error.message
            };
        }
    }

    /**
     * Enhanced redirect chain following with detailed tracking
     */
    async followEnhancedRedirectChain(startUrl) {
        const chain = [];
        let currentUrl = startUrl;
        let redirectCount = 0;

        try {
            while (redirectCount < this.maxRedirects) {
                const response = await fetch(currentUrl, {
                    method: 'HEAD',
                    redirect: 'manual',
                    headers: {
                        'User-Agent': 'A.Insiders Enhanced URL Analyzer/2.0'
                    }
                });

                const redirectInfo = {
                    url: currentUrl,
                    statusCode: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    timestamp: new Date().toISOString(),
                    loadTime: Date.now(),
                    security: this.analyzeResponseSecurity(response)
                };

                chain.push(redirectInfo);

                // Check if this is a redirect
                if (response.status >= 300 && response.status < 400) {
                    const location = response.headers.get('location');
                    if (!location) {
                        break;
                    }

                    // Handle relative URLs
                    currentUrl = new URL(location, currentUrl).href;
                    redirectCount++;
                } else {
                    break;
                }
            }

            return {
                chain: chain,
                finalUrl: currentUrl,
                totalRedirects: redirectCount,
                reachedMaxRedirects: redirectCount >= this.maxRedirects
            };

        } catch (error) {
            console.error('Error following redirect chain:', error);
            return {
                chain: chain,
                finalUrl: startUrl,
                totalRedirects: 0,
                error: error.message
            };
        }
    }

    /**
     * Security analysis using multiple providers
     */
    async performSecurityAnalysis(originalUrl, finalUrl) {
        const security = {
            safeBrowsing: {},
            virusTotal: {},
            reputation: {},
            certificates: {},
            headers: {},
            malwareDetection: [],
            phishingScore: 0,
            overallRisk: 'unknown'
        };

        try {
            // Check both original and final URLs
            const urlsToCheck = [originalUrl];
            if (finalUrl && finalUrl !== originalUrl) {
                urlsToCheck.push(finalUrl);
            }

            // Safe Browsing check
            security.safeBrowsing = await this.checkSafeBrowsing(urlsToCheck);

            // VirusTotal check
            security.virusTotal = await this.checkVirusTotal(urlsToCheck);

            // Header security analysis
            security.headers = await this.analyzeSecurityHeaders(finalUrl || originalUrl);

            // Calculate overall risk
            security.overallRisk = this.calculateSecurityRisk(security);

        } catch (error) {
            console.error('Security analysis error:', error);
            security.error = error.message;
        }

        return security;
    }

    /**
     * Extract comprehensive metadata from URL
     */
    async extractMetadata(url) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'A.Insiders Enhanced URL Analyzer/2.0'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            const metadata = {
                title: this.extractTitle(html),
                description: this.extractDescription(html),
                keywords: this.extractKeywords(html),
                ogTags: this.extractOpenGraphTags(html),
                twitterCards: this.extractTwitterCards(html),
                canonicalUrl: this.extractCanonicalUrl(html),
                language: this.extractLanguage(html),
                charset: this.extractCharset(html),
                robots: this.extractRobots(html),
                contentType: response.headers.get('content-type'),
                contentLength: response.headers.get('content-length'),
                lastModified: response.headers.get('last-modified'),
                server: response.headers.get('server'),
                technologies: this.detectTechnologies(html, response.headers),
                links: this.extractLinks(html),
                images: this.extractImages(html),
                scripts: this.extractScripts(html)
            };

            return metadata;

        } catch (error) {
            console.error('Metadata extraction error:', error);
            return {
                error: error.message
            };
        }
    }

    /**
     * SSL certificate analysis
     */
    async analyzeCertificates(url) {
        try {
            const urlObj = new URL(url);
            if (urlObj.protocol !== 'https:') {
                return {
                    hasSSL: false,
                    reason: 'URL uses HTTP protocol'
                };
            }

            // This would typically require a backend service to perform SSL analysis
            // For demonstration, return a placeholder structure
            return {
                hasSSL: true,
                issuer: 'Unknown',
                subject: urlObj.hostname,
                validFrom: null,
                validTo: null,
                algorithm: 'Unknown',
                keySize: 'Unknown',
                certificateChain: [],
                isValid: true,
                errors: []
            };

        } catch (error) {
            console.error('Certificate analysis error:', error);
            return {
                hasSSL: false,
                error: error.message
            };
        }
    }

    /**
     * Performance analysis
     */
    async analyzePerformance(url) {
        const startTime = Date.now();
        
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                headers: {
                    'User-Agent': 'A.Insiders Enhanced URL Analyzer/2.0'
                }
            });

            const endTime = Date.now();
            const loadTime = endTime - startTime;

            return {
                responseTime: loadTime,
                statusCode: response.status,
                contentLength: parseInt(response.headers.get('content-length')) || 0,
                serverTiming: response.headers.get('server-timing'),
                cacheControl: response.headers.get('cache-control'),
                expires: response.headers.get('expires'),
                lastModified: response.headers.get('last-modified'),
                etag: response.headers.get('etag'),
                compression: response.headers.get('content-encoding')
            };

        } catch (error) {
            console.error('Performance analysis error:', error);
            return {
                responseTime: Date.now() - startTime,
                error: error.message
            };
        }
    }

    /**
     * WHOIS data retrieval
     */
    async getWhoisData(domain) {
        try {
            // This would typically use a WHOIS API service
            // For demonstration, return a placeholder structure
            return {
                registrar: 'Unknown',
                registrationDate: null,
                expirationDate: null,
                registrant: {},
                nameServers: [],
                dnssec: false,
                status: []
            };

        } catch (error) {
            console.error('WHOIS lookup error:', error);
            return {
                error: error.message
            };
        }
    }

    /**
     * Utility functions for analysis
     */
    analyzeResponseSecurity(response) {
        const headers = Object.fromEntries(response.headers.entries());
        
        return {
            hasHTTPS: response.url.startsWith('https://'),
            hasHSTS: !!headers['strict-transport-security'],
            hasCSP: !!headers['content-security-policy'],
            hasXFrameOptions: !!headers['x-frame-options'],
            hasXContentTypeOptions: !!headers['x-content-type-options'],
            hasReferrerPolicy: !!headers['referrer-policy']
        };
    }

    calculateRiskScore(analysis) {
        let riskScore = 0;
        const factors = [];

        // Redirect analysis
        if (analysis.totalRedirects > 5) {
            riskScore += 2;
            factors.push('Multiple redirects detected');
        }

        // Domain analysis
        if (analysis.domain.isIPAddress) {
            riskScore += 3;
            factors.push('URL uses IP address instead of domain');
        }

        // Security factors
        if (analysis.security.overallRisk === 'high') {
            riskScore += 5;
            factors.push('High security risk detected');
        } else if (analysis.security.overallRisk === 'medium') {
            riskScore += 3;
            factors.push('Medium security risk detected');
        }

        // SSL/HTTPS
        if (!analysis.certificates.hasSSL) {
            riskScore += 2;
            factors.push('No SSL certificate');
        }

        // Performance issues
        if (analysis.performance.responseTime > 5000) {
            riskScore += 1;
            factors.push('Slow response time');
        }

        let riskLevel = 'low';
        if (riskScore >= 7) riskLevel = 'high';
        else if (riskScore >= 4) riskLevel = 'medium';

        return {
            score: riskScore,
            level: riskLevel,
            factors: factors,
            recommendation: this.getRiskRecommendation(riskLevel, factors)
        };
    }

    getRiskRecommendation(level, factors) {
        const recommendations = [];

        switch (level) {
            case 'high':
                recommendations.push('⚠️ HIGH RISK: Exercise extreme caution');
                recommendations.push('❌ Consider avoiding this URL');
                break;
            case 'medium':
                recommendations.push('⚡ MEDIUM RISK: Proceed with caution');
                recommendations.push('🔍 Verify the URL legitimacy');
                break;
            default:
                recommendations.push('✅ LOW RISK: URL appears safe');
                recommendations.push('👍 Safe to proceed');
        }

        factors.forEach(factor => {
            recommendations.push(`• ${factor}`);
        });

        return recommendations;
    }

    // Helper methods for metadata extraction
    extractTitle(html) {
        const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        return match ? match[1].trim() : null;
    }

    extractDescription(html) {
        const match = html.match(/<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"']+)["\'][^>]*>/i);
        return match ? match[1].trim() : null;
    }

    extractKeywords(html) {
        const match = html.match(/<meta[^>]+name=["\']keywords["\'][^>]+content=["\']([^"']+)["\'][^>]*>/i);
        return match ? match[1].split(',').map(k => k.trim()) : [];
    }

    extractOpenGraphTags(html) {
        const ogTags = {};
        const matches = html.matchAll(/<meta[^>]+property=["\']og:([^"']+)["\'][^>]+content=["\']([^"']+)["\'][^>]*>/gi);
        for (const match of matches) {
            ogTags[match[1]] = match[2];
        }
        return ogTags;
    }

    extractTwitterCards(html) {
        const twitterTags = {};
        const matches = html.matchAll(/<meta[^>]+name=["\']twitter:([^"']+)["\'][^>]+content=["\']([^"']+)["\'][^>]*>/gi);
        for (const match of matches) {
            twitterTags[match[1]] = match[2];
        }
        return twitterTags;
    }

    // Additional utility methods
    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    isIPAddress(domain) {
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipv4Regex.test(domain);
    }

    extractTLD(domain) {
        const parts = domain.split('.');
        return parts.length > 1 ? parts[parts.length - 1] : null;
    }

    extractSubdomain(domain) {
        const parts = domain.split('.');
        return parts.length > 2 ? parts.slice(0, -2).join('.') : null;
    }

    getFromCache(url) {
        const cached = this.cache.get(url);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    }

    cacheResults(url, data) {
        this.cache.set(url, {
            timestamp: Date.now(),
            data: data
        });
    }

    // Placeholder methods for external service integration
    async checkSafeBrowsing(urls) { return { status: 'safe' }; }
    async checkVirusTotal(urls) { return { detections: 0 }; }
    async analyzeDNSRecords(domain) { return {}; }
    async checkDomainReputation(domain) { return { score: 0 }; }
    async analyzeSubdomain(domain) { return {}; }
    async analyzeSecurityHeaders(url) { return {}; }
    calculateSecurityRisk(security) { return 'low'; }
    extractCanonicalUrl(html) { return null; }
    extractLanguage(html) { return null; }
    extractCharset(html) { return null; }
    extractRobots(html) { return null; }
    detectTechnologies(html, headers) { return []; }
    extractLinks(html) { return []; }
    extractImages(html) { return []; }
    extractScripts(html) { return []; }
    getDNSSuffix(domain) { return null; }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedURLAnalyzer;
}

// Global instance for browser usage
if (typeof window !== 'undefined') {
    window.EnhancedURLAnalyzer = EnhancedURLAnalyzer;
}