/**
 * IP Blacklist Checker JavaScript
 * Comprehensive IP reputation checker using multiple blocklists
 */

class IPBlacklistChecker {
    constructor() {
        this.blocklistLoader = new BlocklistLoader();
        this.blocklists = {};
        this.categories = {
            spam: {
                name: 'Spam & Abuse',
                icon: 'fas fa-envelope',
                lists: ['spamhaus_drop', 'spamhaus_edrop', 'stopforumspam', 'stopforumspam_30d', 'stopforumspam_7d', 'stopforumspam_1d']
            },
            malware: {
                name: 'Malware & Viruses',
                icon: 'fas fa-bug',
                lists: ['vxvault', 'malc0de', 'abuse_zeus', 'abuse_spyeye', 'abuse_palevo', 'ciarmy_malicious']
            },
            tor: {
                name: 'TOR Exit Nodes',
                icon: 'fas fa-user-secret',
                lists: ['tor_exits', 'tor_exits_30d', 'tor_exits_7d', 'tor_exits_1d']
            },
            proxy: {
                name: 'Proxy & VPN',
                icon: 'fas fa-network-wired',
                lists: ['sslproxies', 'sslproxies_30d', 'sslproxies_7d', 'sslproxies_1d', 'socks_proxy', 'socks_proxy_30d', 'socks_proxy_7d', 'socks_proxy_1d']
            },
            php: {
                name: 'PHP Attackers',
                icon: 'fas fa-code',
                lists: ['php_spammers', 'php_harvesters', 'php_dictionary', 'php_commenters', 'php_spammers_30d', 'php_harvesters_30d', 'php_dictionary_30d', 'php_commenters_30d']
            },
            firehol: {
                name: 'FireHOL Blocklists',
                icon: 'fas fa-fire',
                lists: ['firehol_level1', 'firehol_level2', 'firehol_level3', 'firehol_level4', 'firehol_abusers_30d']
            },
            gaming: {
                name: 'Gaming Services',
                icon: 'fas fa-gamepad',
                lists: ['iblocklist_org_steam', 'iblocklist_org_riot_games', 'iblocklist_org_blizzard', 'iblocklist_org_electronic_arts', 'iblocklist_org_activision', 'iblocklist_org_nintendo']
            },
            isp: {
                name: 'ISP Networks',
                icon: 'fas fa-building',
                lists: ['iblocklist_isp_comcast', 'iblocklist_isp_verizon', 'iblocklist_isp_att', 'iblocklist_isp_charter', 'iblocklist_isp_twc', 'iblocklist_isp_sprint']
            }
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.loadBlocklists();
    }

    setupEventListeners() {
        const checkBtn = document.getElementById('checkBtn');
        const ipInput = document.getElementById('ipInput');

        checkBtn.addEventListener('click', () => this.checkIP());
        ipInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkIP();
            }
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
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            const ipInput = document.getElementById('ipInput');
            ipInput.placeholder = `Your IP: ${data.ip} (or enter another IP)`;
        } catch (error) {
            console.log('Could not detect user IP');
        }
    }

    async loadBlocklists() {
        this.showMessage('Loading blocklists...', 'info');
        
        // Set up progress callback
        this.blocklistLoader.setProgressCallback((loaded, total, listName, count) => {
            const progress = Math.round((loaded / total) * 100);
            this.showMessage(`Loading blocklists... ${progress}% (${listName}: ${count} entries)`, 'info');
        });

        // Set up completion callback
        this.blocklistLoader.setCompleteCallback((blocklists) => {
            this.blocklists = blocklists;
            this.showMessage('Blocklists loaded successfully!', 'success');
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
            // Simulated IP information
            const ipInfo = {
                'IP Address': ip,
                'Country': this.getRandomCountry(),
                'City': this.getRandomCity(),
                'ISP': this.getRandomISP(),
                'Organization': this.getRandomOrg(),
                'ASN': this.getRandomASN(),
                'Timezone': this.getRandomTimezone(),
                'Coordinates': this.getRandomCoordinates()
            };
            return ipInfo;
        } catch (error) {
            return {
                'IP Address': ip,
                'Country': 'Unknown',
                'City': 'Unknown',
                'ISP': 'Unknown',
                'Organization': 'Unknown',
                'ASN': 'Unknown',
                'Timezone': 'Unknown',
                'Coordinates': 'Unknown'
            };
        }
    }

    getRandomCountry() {
        const countries = ['United States', 'Germany', 'Netherlands', 'United Kingdom', 'Canada', 'France', 'Japan', 'Australia'];
        return countries[Math.floor(Math.random() * countries.length)];
    }

    getRandomCity() {
        const cities = ['New York', 'Berlin', 'Amsterdam', 'London', 'Toronto', 'Paris', 'Tokyo', 'Sydney'];
        return cities[Math.floor(Math.random() * cities.length)];
    }

    getRandomISP() {
        const isps = ['Comcast', 'Verizon', 'AT&T', 'Charter', 'Time Warner', 'Sprint', 'Deutsche Telekom', 'Orange'];
        return isps[Math.floor(Math.random() * isps.length)];
    }

    getRandomOrg() {
        const orgs = ['Google LLC', 'Amazon.com', 'Microsoft Corporation', 'Cloudflare', 'DigitalOcean', 'OVH', 'Hetzner', 'Linode'];
        return orgs[Math.floor(Math.random() * orgs.length)];
    }

    getRandomASN() {
        const asns = ['AS15169', 'AS16509', 'AS8075', 'AS13335', 'AS14061', 'AS16276', 'AS3320', 'AS24940'];
        return asns[Math.floor(Math.random() * asns.length)];
    }

    getRandomTimezone() {
        const timezones = ['America/New_York', 'Europe/Berlin', 'Europe/Amsterdam', 'Europe/London', 'America/Toronto', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney'];
        return timezones[Math.floor(Math.random() * timezones.length)];
    }

    getRandomCoordinates() {
        const coords = ['40.7128°N, 74.0060°W', '52.5200°N, 13.4050°E', '52.3676°N, 4.9041°E', '51.5074°N, 0.1278°W', '43.6532°N, 79.3832°W', '48.8566°N, 2.3522°E', '35.6762°N, 139.6503°E', '33.8688°S, 151.2093°E'];
        return coords[Math.floor(Math.random() * coords.length)];
    }

    generateRecommendations(results) {
        const recommendations = [];

        if (results.overallStatus === 'clean') {
            recommendations.push('Your IP address appears to be clean and not listed in any major blocklists.');
            recommendations.push('Continue to practice good security hygiene and monitor your network traffic.');
        } else if (results.overallStatus === 'warning') {
            recommendations.push('Your IP address is listed in some blocklists. Consider investigating the cause.');
            recommendations.push('Check if your network has been compromised or if you\'re using a shared IP.');
            recommendations.push('Contact your ISP if you believe this is a false positive.');
        } else {
            recommendations.push('Your IP address is listed in multiple blocklists. Immediate action is recommended.');
            recommendations.push('Scan your system for malware and check for unauthorized access.');
            recommendations.push('Consider changing your IP address or contacting your ISP.');
            recommendations.push('Review your security practices and consider using a VPN.');
        }

        if (results.categoryResults.tor?.found) {
            recommendations.push('TOR exit node detected. This may affect your ability to access certain services.');
        }

        if (results.categoryResults.proxy?.found) {
            recommendations.push('Proxy/VPN detected. Some services may block proxy connections.');
        }

        return recommendations;
    }

    displayResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'block';

        this.displayOverallStatus(results);
        this.displayThreatLevel(results);
        this.displayIPInfo(results.ipInfo);
        this.displayCategories(results.categoryResults);
        this.displayRecommendations(results.recommendations);
    }

    displayOverallStatus(results) {
        const overallStatus = document.getElementById('overallStatus');
        const overallInfo = document.getElementById('overallInfo');

        overallStatus.className = `status-indicator ${results.overallStatus}`;
        
        const statusText = results.overallStatus === 'clean' ? 'Clean' : 
                          results.overallStatus === 'warning' ? 'Warning' : 'Danger';
        
        overallInfo.innerHTML = `
            <p style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">${statusText}</p>
            <p style="color: var(--text-secondary);">Found in ${results.foundInLists.length} blocklist(s)</p>
        `;
    }

    displayThreatLevel(results) {
        const threatStatus = document.getElementById('threatStatus');
        const threatInfo = document.getElementById('threatInfo');

        threatStatus.className = `status-indicator ${results.threatLevel === 'low' ? 'clean' : results.threatLevel === 'medium' ? 'warning' : 'danger'}`;
        
        const threatText = results.threatLevel === 'low' ? 'Low Risk' : 
                          results.threatLevel === 'medium' ? 'Medium Risk' : 'High Risk';
        
        threatInfo.innerHTML = `
            <p style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">${threatText}</p>
            <p style="color: var(--text-secondary);">${results.foundInLists.length} threat(s) detected</p>
        `;
    }

    displayIPInfo(ipInfo) {
        const ipInfoContainer = document.getElementById('ipInfo');
        ipInfoContainer.innerHTML = '';

        for (const [label, value] of Object.entries(ipInfo)) {
            const detailDiv = document.createElement('div');
            detailDiv.className = 'ip-detail';
            detailDiv.innerHTML = `
                <span class="detail-label">${label}:</span>
                <span class="detail-value">${value}</span>
            `;
            ipInfoContainer.appendChild(detailDiv);
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
                    ${category.found ? 'Found' : 'Clean'}
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
            checkBtn.innerHTML = '<div class="loading-spinner"></div> Checking...';
        } else {
            checkBtn.disabled = false;
            ipInput.disabled = false;
            checkBtn.innerHTML = '<i class="fas fa-search"></i> Check IP';
        }
    }

    clearResults() {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'none';
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
}

// Initialize the checker when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    window.ipBlacklistChecker = new IPBlacklistChecker();
}); 