/**
 * IP Ban Tester JavaScript
 * Test IP addresses against multiple ban lists and blocklists
 */

class IPBanTester {
    constructor() {
        this.ipClient = new IPServerClient();
        this.blocklistLoader = new BlocklistLoader();
        this.blocklists = {};
        this.currentIP = null;
        this.map = null;
        this.marker = null;
        this.categories = {
            gaming: {
                name: 'Gaming Bans',
                icon: 'fas fa-gamepad',
                lists: ['iblocklist_org_steam', 'iblocklist_org_riot_games', 'iblocklist_org_blizzard', 'iblocklist_org_electronic_arts', 'iblocklist_org_activision', 'iblocklist_org_nintendo', 'iblocklist_org_sony_online', 'iblocklist_org_ubisoft']
            },
            spam: {
                name: 'Spam Bans',
                icon: 'fas fa-envelope',
                lists: ['spamhaus_drop', 'spamhaus_edrop', 'stopforumspam', 'stopforumspam_30d', 'stopforumspam_7d', 'stopforumspam_1d']
            },
            security: {
                name: 'Security Bans',
                icon: 'fas fa-shield-alt',
                lists: ['vxvault', 'malc0de', 'abuse_zeus', 'abuse_spyeye', 'abuse_palevo', 'ciarmy_malicious', 'feodo', 'feodo_badips']
            },
            proxy: {
                name: 'Proxy/VPN Bans',
                icon: 'fas fa-network-wired',
                lists: ['sslproxies', 'sslproxies_30d', 'sslproxies_7d', 'sslproxies_1d', 'socks_proxy', 'socks_proxy_30d', 'socks_proxy_7d', 'socks_proxy_1d']
            },
            tor: {
                name: 'TOR Exit Bans',
                icon: 'fas fa-user-secret',
                lists: ['tor_exits', 'tor_exits_30d', 'tor_exits_7d', 'tor_exits_1d']
            },
            abuse: {
                name: 'Abuse Bans',
                icon: 'fas fa-exclamation-triangle',
                lists: ['firehol_level1', 'firehol_level2', 'firehol_level3', 'firehol_level4', 'firehol_abusers_30d', 'php_spammers', 'php_harvesters', 'php_dictionary', 'php_commenters']
            },
            isp: {
                name: 'ISP Bans',
                icon: 'fas fa-building',
                lists: ['iblocklist_isp_comcast', 'iblocklist_isp_verizon', 'iblocklist_isp_att', 'iblocklist_isp_charter', 'iblocklist_isp_twc', 'iblocklist_isp_sprint']
            }
        };
        this.init();
    }

    async init() {
        await this.detectUserIP();
        await this.loadBlocklists();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }

    setupEventListeners() {
        const checkBtn = document.getElementById('checkBtn');
        const ipInput = document.getElementById('ipInput');
        const copyCurrentIpBtn = document.getElementById('copyCurrentIpBtn');

        checkBtn.addEventListener('click', () => this.checkIP());
        ipInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkIP();
            }
        });

        // Copy current IP button
        copyCurrentIpBtn.addEventListener('click', () => {
            this.copyToClipboard(this.currentIP);
        });

        // Auto-detect user's IP
        this.detectUserIP();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.checkIP();
            }
        });
    }

    async detectUserIP() {
        try {
            console.log('Detecting user IP via server...');
            const data = await this.ipClient.detectIP();
            this.currentIP = data.ip;
            
            const ipInput = document.getElementById('ipInput');
            const currentIpElement = document.getElementById('currentIp');
            const copyCurrentIpBtn = document.getElementById('copyCurrentIpBtn');
            
            ipInput.placeholder = `Your IP: ${data.ip} (test for bans)`;
            currentIpElement.textContent = this.currentIP;
            
            // Show copy button for current IP
            copyCurrentIpBtn.style.display = 'flex';
        } catch (error) {
            console.log('Server-side IP detection failed, trying fallback...');
            try {
                const data = await this.ipClient.detectIPFallback();
                this.currentIP = data.ip;
                
                const ipInput = document.getElementById('ipInput');
                const currentIpElement = document.getElementById('currentIp');
                const copyCurrentIpBtn = document.getElementById('copyCurrentIpBtn');
                
                ipInput.placeholder = `Your IP: ${data.ip} (test for bans)`;
                currentIpElement.textContent = this.currentIP;
                copyCurrentIpBtn.style.display = 'flex';
            } catch (fallbackError) {
                console.log('All IP detection methods failed');
                document.getElementById('currentIp').textContent = 'Unable to load';
            }
        }
    }

    async loadBlocklists() {
        this.showMessage('Loading ban lists...', 'info');
        
        // Set up progress callback
        this.blocklistLoader.setProgressCallback((loaded, total, listName, count) => {
            const progress = Math.round((loaded / total) * 100);
            this.showMessage(`Loading ban lists... ${progress}% (${listName}: ${count} entries)`, 'info');
        });

        // Set up completion callback
        this.blocklistLoader.setCompleteCallback((blocklists) => {
            this.blocklists = blocklists;
            this.showMessage('Ban lists loaded successfully!', 'success');
            setTimeout(() => this.hideMessage(), 3000);
            
            // Log statistics
            const stats = this.blocklistLoader.getStatistics();
            console.log('📊 Blocklist Statistics:', stats);
        });

        try {
            await this.blocklistLoader.loadEssentialBlocklists();
        } catch (error) {
            console.error('Error loading blocklists:', error);
            this.showMessage('Error loading blocklists. Using simulated data.', 'error');
            this.loadSimulatedBlocklists();
        }
    }



    generateSimulatedIPs(category) {
        // Generate simulated IPs for demonstration
        const simulatedIPs = {
            'spamhaus_drop': [
                '1.10.16.0/20', '1.19.0.0/16', '2.56.192.0/22', '5.42.92.0/24',
                '23.94.58.0/24', '31.24.81.0/24', '37.49.148.0/24'
            ],
            'tor_exits': [
                '2.56.10.36', '2.58.56.35', '5.2.67.226', '5.8.18.30',
                '23.129.64.130', '23.129.64.131', '23.129.64.132'
            ],
            'vxvault': [
                '1.2.3.4', '5.6.7.8', '9.10.11.12', '13.14.15.16',
                '17.18.19.20', '21.22.23.24', '25.26.27.28'
            ],
            'stopforumspam_30d': [
                '192.168.1.1', '10.0.0.1', '172.16.0.1', '8.8.8.8',
                '1.1.1.1', '208.67.222.222', '9.9.9.9'
            ],
            'sslproxies': [
                '185.199.229.156', '185.199.228.220', '185.199.231.45',
                '188.166.168.250', '159.89.49.172', '159.203.61.169'
            ],
            'firehol_level1': [
                '1.0.0.0/8', '2.0.0.0/8', '3.0.0.0/8', '4.0.0.0/8',
                '5.0.0.0/8', '6.0.0.0/8', '7.0.0.0/8'
            ]
        };
        
        return simulatedIPs[category] || [];
    }

    loadSimulatedBlocklists() {
        // Load all simulated blocklists
        Object.keys(this.categories).forEach(category => {
            this.categories[category].lists.forEach(listName => {
                this.blocklists[listName] = this.generateSimulatedIPs(listName);
            });
        });
    }



    async checkIP() {
        const ipInput = document.getElementById('ipInput');
        const ip = ipInput.value.trim();

        if (!ip) {
            this.showMessage('Please enter an IP address', 'error');
            return;
        }

        if (!this.blocklistLoader.isValidIP(ip)) {
            this.showMessage('Please enter a valid IP address', 'error');
            return;
        }

        this.setLoadingState(true);
        this.clearResults();

        try {
            const results = await this.analyzeIP(ip);
            this.displayResults(results);
        } catch (error) {
            console.error('Error checking IP:', error);
            this.showMessage('Error checking IP address', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    async analyzeIP(ip) {
        const results = {
            ip: ip,
            overallStatus: 'clean',
            threatLevel: 'low',
            foundInLists: [],
            categoryResults: {},
            ipInfo: {},
            recommendations: []
        };

        // Check against all blocklists
        for (const [categoryName, category] of Object.entries(this.categories)) {
            results.categoryResults[categoryName] = {
                name: category.name,
                icon: category.icon,
                found: false,
                lists: []
            };

            for (const listName of category.lists) {
                if (this.blocklists[listName]) {
                    const found = this.checkIPInList(ip, this.blocklists[listName]);
                    if (found) {
                        results.foundInLists.push(listName);
                        results.categoryResults[categoryName].found = true;
                        results.categoryResults[categoryName].lists.push(listName);
                    }
                }
            }
        }

        // Determine overall status
        const totalFound = results.foundInLists.length;
        if (totalFound === 0) {
            results.overallStatus = 'clean';
            results.threatLevel = 'low';
        } else if (totalFound <= 2) {
            results.overallStatus = 'warning';
            results.threatLevel = 'medium';
        } else {
            results.overallStatus = 'danger';
            results.threatLevel = 'high';
        }

        // Get IP information
        results.ipInfo = await this.getIPInfo(ip);

        // Generate recommendations
        results.recommendations = this.generateRecommendations(results);

        return results;
    }

    checkIPInList(ip, ipList) {
        for (const entry of ipList) {
            if (entry.includes('/')) {
                // CIDR range
                if (this.blocklistLoader.isIPInCIDR(ip, entry)) {
                    return true;
                }
            } else {
                // Individual IP
                if (ip === entry) {
                    return true;
                }
            }
        }
        return false;
    }

    async getIPInfo(ip) {
        try {
            console.log(`Getting enhanced IP info for ${ip}...`);
            
            // Use enhanced geolocation service if available
            if (window.EnhancedIPGeolocation) {
                const enhancedGeo = new EnhancedIPGeolocation();
                const enhanced = await enhancedGeo.getComprehensiveIPInfo(ip, {
                    includeBasic: true,
                    includeDetailed: true,
                    includeThreatIntel: true
                });
                
                // Extract comprehensive information
                const aggregated = enhanced.aggregated;
                const confidence = enhanced.confidence;
                const threats = enhanced.threats;
                const services = enhanced.services;
                
                const ipInfo = {
                    'IP Address': ip,
                    'Country': aggregated.location.country || 'Unknown',
                    'Region': aggregated.location.region || 'Unknown',
                    'City': aggregated.location.city || 'Unknown',
                    'ISP': aggregated.network.isp || 'Unknown',
                    'Organization': aggregated.network.org || 'Unknown',
                    'ASN': aggregated.network.asn || 'Unknown',
                    'Timezone': aggregated.location.timezone || 'Unknown',
                    'Latitude': aggregated.location.latitude ? `${aggregated.location.latitude.toFixed(4)}°` : 'Unknown',
                    'Longitude': aggregated.location.longitude ? `${aggregated.location.longitude.toFixed(4)}°` : 'Unknown',
                    'Coordinates': `${aggregated.location.latitude || 0},${aggregated.location.longitude || 0}`,
                    'Confidence Score': `${Math.round(confidence.overall * 100)}%`,
                    'Data Sources': Object.keys(enhanced.providers).join(', '),
                    'Threat Level': threats.length > 0 ? this.calculateThreatLevel(threats) : 'Low',
                    'Open Ports': services.length > 0 ? `${services.length} detected` : 'None detected',
                    'Security Flags': threats.map(t => t.type).join(', ') || 'None'
                };
                
                // Store enhanced data for detailed display
                ipInfo._enhanced = {
                    threats: threats,
                    services: services,
                    providers: enhanced.providers,
                    confidence: confidence
                };
                
                return ipInfo;
            }
            
            // Fallback to original method
            const data = await this.ipClient.getIPInfo(ip);
            
            const ipInfo = {
                'IP Address': data.ip,
                'Country': data.country || 'Unknown',
                'City': data.city || 'Unknown',
                'ISP': data.org || 'Unknown',
                'Organization': data.org || 'Unknown',
                'ASN': data.asn || 'Unknown',
                'Timezone': data.timezone || 'Unknown',
                'Latitude': data.latitude ? `${data.latitude}°` : 'Unknown',
                'Longitude': data.longitude ? `${data.longitude}°` : 'Unknown',
                'Coordinates': data.loc || 'Unknown'
            };
            return ipInfo;
        } catch (error) {
            console.error('Error fetching IP info:', error);
            return {
                'IP Address': ip,
                'Country': 'Unknown',
                'City': 'Unknown',
                'ISP': 'Unknown',
                'Organization': 'Unknown',
                'ASN': 'Unknown',
                'Timezone': 'Unknown',
                'Latitude': 'Unknown',
                'Longitude': 'Unknown',
                'Coordinates': 'Unknown'
            };
        }
    }



    calculateThreatLevel(threats) {
        if (!threats || threats.length === 0) return 'Low';
        
        let score = 0;
        threats.forEach(threat => {
            switch (threat.severity) {
                case 'high': score += 3; break;
                case 'medium': score += 2; break;
                case 'low': score += 1; break;
                default: score += 1;
            }
        });
        
        if (score >= 6) return 'High';
        if (score >= 3) return 'Medium';
        return 'Low';
    }

    generateRecommendations(results) {
        const recommendations = [];

        if (results.overallStatus === 'clean') {
            recommendations.push('Your IP address is not banned in any major databases.');
            recommendations.push('You should be able to access most gaming platforms and services normally.');
        } else if (results.overallStatus === 'warning') {
            recommendations.push('Your IP address is partially banned in some databases.');
            recommendations.push('You may experience issues with certain gaming platforms or services.');
            recommendations.push('Consider contacting the service providers if you believe this is a false positive.');
        } else {
            recommendations.push('Your IP address is banned in multiple databases. Immediate action is recommended.');
            recommendations.push('You will likely be blocked from accessing many gaming platforms and services.');
            recommendations.push('Consider changing your IP address or contacting your ISP for a new one.');
            recommendations.push('Review your online activities and ensure compliance with service terms.');
        }

        if (results.categoryResults.gaming?.found) {
            recommendations.push('Gaming platform bans detected. You may be unable to access Steam, Riot Games, or other platforms.');
        }

        if (results.categoryResults.tor?.found) {
            recommendations.push('TOR exit node detected. Many services block TOR connections for security reasons.');
        }

        if (results.categoryResults.proxy?.found) {
            recommendations.push('Proxy/VPN detected. Some gaming platforms and services block proxy connections.');
        }

        if (results.categoryResults.spam?.found) {
            recommendations.push('Spam-related bans detected. This may affect email services and forum access.');
        }

        return recommendations;
    }

    displayResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'block';

        this.displayOverallStatus(results);
        this.displayThreatLevel(results);
        this.displayIPInfo(results.ipInfo);
        this.displayMap(results.ipInfo);
        this.displayCategories(results.categoryResults);
        this.displayRecommendations(results.recommendations);
    }

    displayOverallStatus(results) {
        const overallStatus = document.getElementById('overallStatus');
        const overallInfo = document.getElementById('overallInfo');

        overallStatus.className = `status-indicator ${results.overallStatus}`;
        
        const statusText = results.overallStatus === 'clean' ? 'Not Banned' : 
                          results.overallStatus === 'warning' ? 'Partially Banned' : 'Banned';
        
        overallInfo.innerHTML = `
            <p style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">${statusText}</p>
            <p style="color: var(--text-secondary);">Found in ${results.foundInLists.length} ban list(s)</p>
        `;
    }

    displayThreatLevel(results) {
        const threatStatus = document.getElementById('threatStatus');
        const threatInfo = document.getElementById('threatInfo');

        threatStatus.className = `status-indicator ${results.threatLevel === 'low' ? 'clean' : results.threatLevel === 'medium' ? 'warning' : 'danger'}`;
        
        const threatText = results.threatLevel === 'low' ? 'Low Ban Risk' : 
                          results.threatLevel === 'medium' ? 'Medium Ban Risk' : 'High Ban Risk';
        
        threatInfo.innerHTML = `
            <p style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">${threatText}</p>
            <p style="color: var(--text-secondary);">${results.foundInLists.length} ban(s) detected</p>
        `;
    }

    displayIPInfo(ipInfo) {
        const ipInfoContainer = document.getElementById('ipInfo');
        ipInfoContainer.innerHTML = '';

        for (const [label, value] of Object.entries(ipInfo)) {
            const detailDiv = document.createElement('div');
            detailDiv.className = 'ip-detail';
            
            // Add copy button for IP address
            let valueHtml = value;
            if (label === 'IP Address' && value !== 'Unknown') {
                valueHtml = `
                    ${value}
                    <button class="copy-ip-btn small" onclick="ipBanTester.copyToClipboard('${value}')">
                        <i class="fas fa-copy"></i>
                    </button>
                `;
            }
            
            detailDiv.innerHTML = `
                <span class="detail-label">${label}:</span>
                <span class="detail-value">${valueHtml}</span>
            `;
            ipInfoContainer.appendChild(detailDiv);
        }
    }

    displayMap(ipInfo) {
        const mapPlaceholder = document.getElementById('mapPlaceholder');
        const ipMap = document.getElementById('ipMap');
        
        // Extract latitude and longitude from IP info
        const lat = ipInfo['Latitude']?.replace('°', '');
        const lng = ipInfo['Longitude']?.replace('°', '');
        
        if (lat && lng && lat !== 'Unknown' && lng !== 'Unknown') {
            // Hide placeholder and show map
            mapPlaceholder.style.display = 'none';
            ipMap.style.display = 'block';
            
            // Initialize map with Leaflet
            this.initializeMap(parseFloat(lat), parseFloat(lng), `${ipInfo['City'] || 'Unknown'}, ${ipInfo['Country'] || 'Unknown'}`);
        } else {
            // Show placeholder if coordinates are not available
            mapPlaceholder.style.display = 'flex';
            ipMap.style.display = 'none';
            mapPlaceholder.innerHTML = `
                <i class="fas fa-map"></i>
                <p>Location coordinates not available</p>
            `;
        }
    }

    initializeMap(lat, lng, location) {
        const mapContainer = document.getElementById('ipMap');

        // Remove existing map
        if (this.map) {
            this.map.remove();
        }

        // Initialize new map
        this.map = L.map('ipMap').setView([lat || 0, lng || 0], 10);

        // Add tile layer (dark theme)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '©OpenStreetMap, ©CartoDB',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);

        // Add marker
        if (lat && lng) {
            this.marker = L.marker([lat, lng]).addTo(this.map);
            this.marker.bindPopup(`<b>${location}</b><br>IP Location`).openPopup();
        }
    }

    displayCategories(categoryResults) {
        const categoryGrid = document.getElementById('categoryGrid');
        categoryGrid.innerHTML = '';

        for (const [categoryName, category] of Object.entries(categoryResults)) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = `category-item ${category.found ? 'found' : 'clean'}`;
            
            categoryDiv.innerHTML = `
                <div class="category-icon">
                    <i class="${category.icon}"></i>
                </div>
                <div class="category-name">${category.name}</div>
                <div class="category-status ${category.found ? 'found' : 'clean'}">
                    ${category.found ? 'Banned' : 'Not Banned'}
                </div>
            `;
            
            categoryGrid.appendChild(categoryDiv);
        }
    }

    displayRecommendations(recommendations) {
        const recommendationsContainer = document.getElementById('recommendations');
        const list = document.createElement('ul');
        list.className = 'recommendation-list';

        recommendations.forEach(recommendation => {
            const li = document.createElement('li');
            li.textContent = recommendation;
            list.appendChild(li);
        });

        recommendationsContainer.innerHTML = '';
        recommendationsContainer.appendChild(list);
    }

    setLoadingState(loading) {
        const checkBtn = document.getElementById('checkBtn');
        const ipInput = document.getElementById('ipInput');

        if (loading) {
            checkBtn.disabled = true;
            ipInput.disabled = true;
            checkBtn.innerHTML = '<div class="loading-spinner"></div> Testing...';
        } else {
            checkBtn.disabled = false;
            ipInput.disabled = false;
            checkBtn.innerHTML = '<i class="fas fa-ban"></i> Test for Bans';
        }
    }

    clearResults() {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'none';
        
        // Reset map to placeholder
        const mapPlaceholder = document.getElementById('mapPlaceholder');
        const ipMap = document.getElementById('ipMap');
        mapPlaceholder.style.display = 'flex';
        ipMap.style.display = 'none';
        mapPlaceholder.innerHTML = `
            <i class="fas fa-map"></i>
            <p>Map will be displayed here after IP check</p>
        `;
        
        // Remove existing map
        if (this.map) {
            this.map.remove();
            this.map = null;
            this.marker = null;
        }
    }

    showMessage(message, type = 'info') {
        const messageContainer = document.getElementById('messageContainer');
        messageContainer.textContent = message;
        messageContainer.className = `message-container ${type}`;
        messageContainer.style.display = 'block';
    }

    hideMessage() {
        const messageContainer = document.getElementById('messageContainer');
        messageContainer.style.display = 'none';
    }

    async copyToClipboard(text) {
        if (!text || text === 'N/A') {
            this.showMessage('No IP address to copy', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showCopySuccess();
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.showCopySuccess();
            } catch (fallbackErr) {
                this.showMessage('Failed to copy IP address', 'error');
            }
            document.body.removeChild(textArea);
        }
    }

    showCopySuccess() {
        // Show success message
        this.showMessage('IP address copied to clipboard!', 'success');
        
        // Update button appearance temporarily
        const copyButtons = document.querySelectorAll('.copy-ip-btn');
        copyButtons.forEach(btn => {
            const originalHTML = btn.innerHTML;
            btn.classList.add('copied');
            btn.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>';
            
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = originalHTML;
            }, 2000);
        });
    }
}

// Initialize the ban tester when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    window.ipBanTester = new IPBanTester();
}); 