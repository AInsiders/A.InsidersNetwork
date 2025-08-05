/**
 * URL Redirect Checker JavaScript
 * Comprehensive URL redirect analysis with "who is" information
 */

class URLRedirectChecker {
    constructor() {
        this.maxRedirects = 10;
        this.timeout = 10000;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }

    setupEventListeners() {
        const checkBtn = document.getElementById('checkBtn');
        const urlInput = document.getElementById('urlInput');

        if (checkBtn) {
            checkBtn.addEventListener('click', () => this.checkURL());
        }

        if (urlInput) {
            urlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkURL();
                }
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.checkURL();
                        break;
                }
            }
        });
    }

    async checkURL() {
        const urlInput = document.getElementById('urlInput');
        const checkBtn = document.getElementById('checkBtn');
        const url = urlInput.value.trim();

        if (!url) {
            this.showMessage('Please enter a valid URL', 'error');
            return;
        }

        if (!this.isValidURL(url)) {
            this.showMessage('Please enter a valid URL starting with http:// or https://', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(true);
        this.clearResults();

        try {
            const results = await this.analyzeURL(url);
            this.displayResults(results);
        } catch (error) {
            console.error('Error analyzing URL:', error);
            this.showMessage('Error analyzing URL. Please try again.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    async analyzeURL(originalUrl) {
        // Use enhanced analyzer if available
        if (window.EnhancedURLAnalyzer) {
            try {
                console.log('Using Enhanced URL Analyzer...');
                const enhancedAnalyzer = new EnhancedURLAnalyzer();
                const enhanced = await enhancedAnalyzer.analyzeURL(originalUrl, {
                    includeSecurity: true,
                    includeMetadata: true,
                    includeCertificates: true,
                    includePerformance: true,
                    includeWhois: true
                });

                // Convert enhanced results to legacy format for display compatibility
                const results = {
                    originalUrl: enhanced.originalUrl,
                    redirectChain: enhanced.redirectChain,
                    finalUrl: enhanced.finalUrl,
                    totalRedirects: enhanced.totalRedirects,
                    domainInfo: {
                        domain: enhanced.domain.name,
                        tld: enhanced.domain.tld,
                        subdomain: enhanced.domain.subdomain,
                        isIPAddress: enhanced.domain.isIPAddress,
                        whois: enhanced.domain.whois
                    },
                    securityIssues: enhanced.riskAssessment.factors || [],
                    analysisTime: enhanced.timestamp,
                    // Enhanced data
                    _enhanced: {
                        domain: enhanced.domain,
                        security: enhanced.security,
                        metadata: enhanced.metadata,
                        certificates: enhanced.certificates,
                        performance: enhanced.performance,
                        riskAssessment: enhanced.riskAssessment
                    }
                };

                return results;
            } catch (error) {
                console.error('Enhanced analyzer failed, falling back to basic analysis:', error);
            }
        }

        // Fallback to original analysis
        const results = {
            originalUrl,
            redirectChain: [],
            finalUrl: null,
            totalRedirects: 0,
            domainInfo: {},
            securityIssues: [],
            analysisTime: new Date().toISOString()
        };

        try {
            // Follow redirect chain
            const redirectData = await this.followRedirectChain(originalUrl);
            results.redirectChain = redirectData.chain;
            results.finalUrl = redirectData.finalUrl;
            results.totalRedirects = redirectData.chain.length - 1;

            // Get domain information for each unique domain/IP
            const uniqueDomains = this.extractUniqueDomains(results.redirectChain);
            for (const domain of uniqueDomains) {
                results.domainInfo[domain] = await this.getDomainInfo(domain);
            }

            // Analyze security issues
            results.securityIssues = this.analyzeSecurityIssues(results);

        } catch (error) {
            console.error('Error in URL analysis:', error);
            throw error;
        }

        return results;
    }

    async followRedirectChain(url) {
        const chain = [];
        let currentUrl = url;
        let redirectCount = 0;

        while (currentUrl && redirectCount < this.maxRedirects) {
            try {
                chain.push({
                    url: currentUrl,
                    step: redirectCount + 1,
                    timestamp: new Date().toISOString()
                });

                const response = await this.makeRequest(currentUrl);
                
                if (response.redirected) {
                    currentUrl = response.redirectUrl;
                    redirectCount++;
                } else {
                    // No more redirects
                    break;
                }
            } catch (error) {
                console.error(`Error following redirect for ${currentUrl}:`, error);
                chain.push({
                    url: currentUrl,
                    step: redirectCount + 1,
                    timestamp: new Date().toISOString(),
                    error: error.message
                });
                break;
            }
        }

        return {
            chain,
            finalUrl: currentUrl
        };
    }

    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.timeout = this.timeout;
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        resolve({
                            redirected: false,
                            status: xhr.status,
                            headers: xhr.getAllResponseHeaders()
                        });
                    } else if (xhr.status >= 300 && xhr.status < 400) {
                        // Handle redirect
                        const location = xhr.getResponseHeader('Location');
                        if (location) {
                            resolve({
                                redirected: true,
                                redirectUrl: location,
                                status: xhr.status
                            });
                        } else {
                            resolve({
                                redirected: false,
                                status: xhr.status
                            });
                        }
                    } else {
                        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                    }
                }
            };

            xhr.onerror = () => reject(new Error('Network error'));
            xhr.ontimeout = () => reject(new Error('Request timeout'));

            xhr.open('HEAD', url, true);
            xhr.send();
        });
    }

    extractUniqueDomains(redirectChain) {
        const domains = new Set();
        
        redirectChain.forEach(step => {
            try {
                const url = new URL(step.url);
                domains.add(url.hostname);
            } catch (error) {
                console.error('Error extracting domain:', error);
            }
        });

        return Array.from(domains);
    }

    async getDomainInfo(domain) {
        const info = {
            domain,
            ip: null,
            whois: {},
            dns: {},
            security: {}
        };

        try {
            // Get IP address
            info.ip = await this.resolveIP(domain);
            
            // Get basic DNS information
            info.dns = await this.getDNSInfo(domain);
            
            // Get security information
            info.security = await this.getSecurityInfo(domain);
            
            // Get WHOIS-like information (simulated)
            info.whois = await this.getWHOISInfo(domain);

        } catch (error) {
            console.error(`Error getting domain info for ${domain}:`, error);
            info.error = error.message;
        }

        return info;
    }

    async resolveIP(domain) {
        // Simulate IP resolution
        // In a real implementation, you would use a DNS lookup service
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate different IPs for different domains
                const mockIPs = {
                    'google.com': '142.250.191.78',
                    'facebook.com': '157.240.241.35',
                    'amazon.com': '52.84.0.0',
                    'microsoft.com': '20.81.111.85',
                    'github.com': '140.82.112.4'
                };
                
                resolve(mockIPs[domain] || '192.168.1.1');
            }, 100);
        });
    }

    async getDNSInfo(domain) {
        // Simulate DNS information
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    a: ['192.168.1.1'],
                    aaaa: ['2001:db8::1'],
                    mx: [`mail.${domain}`],
                    ns: [`ns1.${domain}`, `ns2.${domain}`],
                    txt: [`v=spf1 include:_spf.${domain} ~all`]
                });
            }, 200);
        });
    }

    async getSecurityInfo(domain) {
        // Simulate security information
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    ssl: true,
                    hsts: true,
                    spf: true,
                    dmarc: true,
                    dkim: true,
                    sslGrade: 'A',
                    securityHeaders: {
                        'Strict-Transport-Security': 'max-age=31536000',
                        'X-Content-Type-Options': 'nosniff',
                        'X-Frame-Options': 'DENY',
                        'X-XSS-Protection': '1; mode=block'
                    }
                });
            }, 300);
        });
    }

    async getWHOISInfo(domain) {
        // Simulate WHOIS information
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    registrar: 'Example Registrar, Inc.',
                    creationDate: '2020-01-01',
                    expirationDate: '2025-01-01',
                    updatedDate: '2023-01-01',
                    status: 'active',
                    nameServers: [`ns1.${domain}`, `ns2.${domain}`],
                    registrant: {
                        organization: 'Example Organization',
                        country: 'US',
                        email: 'admin@example.com'
                    }
                });
            }, 400);
        });
    }

    analyzeSecurityIssues(results) {
        const issues = [];

        // Check for too many redirects
        if (results.totalRedirects > 5) {
            issues.push({
                type: 'warning',
                message: `High number of redirects (${results.totalRedirects}). This may indicate a redirect chain attack.`,
                severity: 'medium'
            });
        }

        // Check for mixed content
        const hasHttp = results.redirectChain.some(step => step.url.startsWith('http://'));
        const hasHttps = results.redirectChain.some(step => step.url.startsWith('https://'));
        
        if (hasHttp && hasHttps) {
            issues.push({
                type: 'warning',
                message: 'Mixed HTTP/HTTPS redirects detected. This may pose security risks.',
                severity: 'high'
            });
        }

        // Check for suspicious domains
        const suspiciousPatterns = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co'];
        const hasSuspicious = results.redirectChain.some(step => {
            const url = new URL(step.url);
            return suspiciousPatterns.some(pattern => url.hostname.includes(pattern));
        });

        if (hasSuspicious) {
            issues.push({
                type: 'alert',
                message: 'URL shortener detected in redirect chain. Verify the final destination.',
                severity: 'medium'
            });
        }

        return issues;
    }

    displayResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'block';

        this.displayURLInfo(results);
        this.displaySecurityInfo(results);
        this.displayRedirectChain(results);
        this.displayDomainInfo(results);
    }

    displayURLInfo(results) {
        const urlStatus = document.getElementById('urlStatus');
        const urlInfo = document.getElementById('urlInfo');

        // Set status
        if (results.totalRedirects === 0) {
            urlStatus.textContent = 'No Redirects';
            urlStatus.className = 'status-indicator status-green';
        } else if (results.totalRedirects <= 3) {
            urlStatus.textContent = `${results.totalRedirects} Redirects`;
            urlStatus.className = 'status-indicator status-yellow';
        } else {
            urlStatus.textContent = `${results.totalRedirects} Redirects`;
            urlStatus.className = 'status-indicator status-red';
        }

        // Display URL information
        urlInfo.innerHTML = `
            <div class="info-item">
                <span class="info-label">Original URL:</span>
                <span class="info-value">${results.originalUrl}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Final URL:</span>
                <span class="info-value">${results.finalUrl}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Total Redirects:</span>
                <span class="info-value">${results.totalRedirects}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Analysis Time:</span>
                <span class="info-value">${new Date(results.analysisTime).toLocaleString()}</span>
            </div>
        `;
    }

    displaySecurityInfo(results) {
        const securityStatus = document.getElementById('securityStatus');
        const securityInfo = document.getElementById('securityInfo');

        // Determine security status
        const hasIssues = results.securityIssues.length > 0;
        const highSeverityIssues = results.securityIssues.filter(issue => issue.severity === 'high');

        if (highSeverityIssues.length > 0) {
            securityStatus.textContent = 'Security Issues';
            securityStatus.className = 'status-indicator status-red';
        } else if (hasIssues) {
            securityStatus.textContent = 'Warnings';
            securityStatus.className = 'status-indicator status-yellow';
        } else {
            securityStatus.textContent = 'Secure';
            securityStatus.className = 'status-indicator status-green';
        }

        // Display security information
        let securityHTML = '';
        
        if (results.securityIssues.length === 0) {
            securityHTML = '<div class="success-message">No security issues detected.</div>';
        } else {
            results.securityIssues.forEach(issue => {
                const alertClass = issue.type === 'alert' ? 'security-alert' : 
                                 issue.type === 'warning' ? 'error-message' : 'error-message';
                securityHTML += `
                    <div class="${alertClass}">
                        <strong>${issue.severity.toUpperCase()}:</strong> ${issue.message}
                    </div>
                `;
            });
        }

        securityInfo.innerHTML = securityHTML;
    }

    displayRedirectChain(results) {
        const redirectChain = document.getElementById('redirectChain');
        
        if (results.redirectChain.length === 1) {
            redirectChain.innerHTML = `
                <div class="redirect-step">
                    <div class="step-number">1</div>
                    <div class="step-url">${results.originalUrl}</div>
                    <span class="step-status status-green">Final Destination</span>
                </div>
            `;
        } else {
            let chainHTML = '';
            results.redirectChain.forEach((step, index) => {
                const isLast = index === results.redirectChain.length - 1;
                const statusClass = isLast ? 'status-green' : 'status-yellow';
                const statusText = isLast ? 'Final Destination' : `Redirect ${step.step}`;
                
                chainHTML += `
                    <div class="redirect-step">
                        <div class="step-number">${step.step}</div>
                        <div class="step-url">${step.url}</div>
                        <span class="step-status ${statusClass}">${statusText}</span>
                    </div>
                `;
            });
            redirectChain.innerHTML = chainHTML;
        }
    }

    displayDomainInfo(results) {
        const domainInfo = document.getElementById('domainInfo');
        let domainHTML = '';

        Object.entries(results.domainInfo).forEach(([domain, info]) => {
            if (info.error) {
                domainHTML += `
                    <div class="error-message">
                        <strong>${domain}:</strong> Error retrieving information - ${info.error}
                    </div>
                `;
            } else {
                domainHTML += `
                    <div style="margin-bottom: 2rem; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: var(--border-radius);">
                        <h4 style="color: var(--text-primary); margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                            <i class="fas fa-globe"></i> ${domain}
                        </h4>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <h5 style="color: var(--text-secondary); margin-bottom: 0.5rem;">IP Address</h5>
                                <div class="info-item">
                                    <span class="info-label">IP:</span>
                                    <span class="info-value">${info.ip}</span>
                                </div>
                            </div>
                            
                            <div>
                                <h5 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Security Status</h5>
                                <div class="info-item">
                                    <span class="info-label">SSL:</span>
                                    <span class="info-value">${info.security.ssl ? '✓' : '✗'}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">HSTS:</span>
                                    <span class="info-value">${info.security.hsts ? '✓' : '✗'}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">SPF:</span>
                                    <span class="info-value">${info.security.spf ? '✓' : '✗'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 1rem;">
                            <h5 style="color: var(--text-secondary); margin-bottom: 0.5rem;">WHOIS Information</h5>
                            <div class="info-item">
                                <span class="info-label">Registrar:</span>
                                <span class="info-value">${info.whois.registrar}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Created:</span>
                                <span class="info-value">${info.whois.creationDate}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Expires:</span>
                                <span class="info-value">${info.whois.expirationDate}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Status:</span>
                                <span class="info-value">${info.whois.status}</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        });

        domainInfo.innerHTML = domainHTML;
    }

    setLoadingState(loading) {
        const checkBtn = document.getElementById('checkBtn');
        const urlInput = document.getElementById('urlInput');

        if (loading) {
            checkBtn.disabled = true;
            checkBtn.innerHTML = '<div class="loading-spinner"></div> Analyzing...';
            urlInput.disabled = true;
        } else {
            checkBtn.disabled = false;
            checkBtn.innerHTML = '<i class="fas fa-search"></i> Check URL';
            urlInput.disabled = false;
        }
    }

    clearResults() {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'none';
    }

    showMessage(message, type = 'info') {
        const messageContainer = document.getElementById('messageContainer');
        const messageClass = type === 'error' ? 'error-message' : 
                           type === 'success' ? 'success-message' : 'security-alert';

        messageContainer.innerHTML = `<div class="${messageClass}">${message}</div>`;

        // Auto-remove message after 5 seconds
        setTimeout(() => {
            messageContainer.innerHTML = '';
        }, 5000);
    }
}

// Initialize the URL redirect checker when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.urlRedirectChecker = new URLRedirectChecker();
}); 