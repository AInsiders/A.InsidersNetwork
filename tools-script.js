/**
 * Tools Page JavaScript
 * Handles tool interactions, filtering, and dynamic functionality
 */

class ToolsManager {
    constructor() {
        this.currentCategory = 'all';
        this.tools = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupToolCards();
        this.setupAnimations();
    }

    setupEventListeners() {
        // Category filtering
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterByCategory(e.target.getAttribute('data-category'));
            });
        });

        // Tool card interactions
        const toolCards = document.querySelectorAll('.tool-card');
        toolCards.forEach(card => {
            this.setupToolCard(card);
        });

        // Tool button interactions
        const toolBtns = document.querySelectorAll('.tool-btn');
        toolBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleToolAction(e);
            });
        });
    }

    setupToolCards() {
        const toolCards = document.querySelectorAll('.tool-card');
        toolCards.forEach(card => {
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 20px 40px rgba(0, 102, 255, 0.3)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
            });

            // Add click effects
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.tool-btn')) {
                    this.showToolDetails(card);
                }
            });
            
            // Setup banner image loading
            const bannerImg = card.querySelector('.tool-banner img');
            if (bannerImg) {
                bannerImg.addEventListener('load', () => {
                    bannerImg.classList.add('loaded');
                });
                
                bannerImg.addEventListener('error', () => {
                    // Fallback for failed banner images
                    bannerImg.style.display = 'none';
                    const banner = card.querySelector('.tool-banner');
                    if (banner) {
                        banner.style.background = 'linear-gradient(135deg, rgba(0, 102, 255, 0.3), rgba(77, 148, 255, 0.3))';
                    }
                });
            }
        });
    }

    setupAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe tool cards and coming soon cards
        document.querySelectorAll('.tool-card, .coming-soon-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }

    filterByCategory(category) {
        this.currentCategory = category;
        const toolCards = document.querySelectorAll('.tool-card');
        const categoryBtns = document.querySelectorAll('.category-btn');

        // Update active button
        categoryBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-category') === category) {
                btn.classList.add('active');
            }
        });

        // Filter and animate cards
        toolCards.forEach((card, index) => {
            const cardCategory = card.getAttribute('data-category');
            const shouldShow = category === 'all' || cardCategory === category;

            if (shouldShow) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });

        // Update stats
        this.updateStats();
    }

    updateStats() {
        const visibleTools = document.querySelectorAll('.tool-card[style*="display: block"], .tool-card:not([style*="display: none"])');
        const statNumber = document.querySelector('.stat-number');
        
        if (statNumber && this.currentCategory === 'all') {
            statNumber.textContent = visibleTools.length + '+';
        }
    }

    setupToolCard(card) {
        const toolTitle = card.querySelector('.tool-title').textContent;
        const toolStatus = card.querySelector('.tool-status');
        
        // Add tool info to data
        this.tools.push({
            title: toolTitle,
            status: toolStatus ? toolStatus.textContent.toLowerCase() : 'live',
            category: card.getAttribute('data-category')
        });
    }

    handleToolAction(e) {
        e.preventDefault();
        const btn = e.target.closest('.tool-btn');
        const toolCard = btn.closest('.tool-card');
        const toolTitle = toolCard.querySelector('.tool-title').textContent;
        const action = btn.textContent.trim();
        
        console.log('Tool action detected:', action, 'for tool:', toolTitle);

        // Handle different tool actions
        switch (action) {
            case 'Check IP':
                window.location.href = 'ip-checker.html';
                break;
            case 'Check URL':
                window.location.href = 'url-redirect-checker.html';
                break;
            case 'Check IP': // IP Blacklist Checker
                window.location.href = 'ip-blacklist-checker.html';
                break;
            case 'Analyze Text': // AI Text Detection
                window.location.href = 'ai-text-detection.html';
                break;
            case 'Check Password':
                window.location.href = 'password-checker.html';
                break;
            case 'Calculate Entropy':
                window.location.href = 'entropy-calculator.html';
                break;
            case 'Launch Checker':
                window.location.href = 'advanced-entropy-simulator.html';
                break;
            case 'Encrypt Now':
                window.location.href = 'encryption-tool.html';
                break;
            case 'Launch Tool':
            case 'Try Beta':
            case 'Create Chart':
            case 'Format Code':
            case 'Test API':
                this.launchTool(toolTitle);
                break;
            case 'Calculate':
                // Handle generic calculate actions
                this.launchTool(toolTitle);
                break;
            case 'Learn More':
            case 'Documentation':
            case 'Security Tips':
            case 'How It Works':
            case 'Templates':
            case 'Examples':
            case 'Supported Languages':
            case 'Analytics':
                this.showToolInfo(toolTitle, action);
                break;
            default:
                console.log(`Action "${action}" for tool "${toolTitle}" not implemented yet`);
        }
    }

    launchTool(toolTitle) {
        // This would be implemented to actually launch the tools
        // For now, show a placeholder message
        this.showNotification(`Launching ${toolTitle}...`, 'info');
        
        // Simulate tool loading
        setTimeout(() => {
            this.showNotification(`${toolTitle} is not yet implemented. Coming soon!`, 'warning');
        }, 1000);
    }

    showToolInfo(toolTitle, action) {
        // This would show detailed information about the tool
        this.showNotification(`Showing ${action.toLowerCase()} for ${toolTitle}...`, 'info');
    }

    showToolDetails(card) {
        const toolTitle = card.querySelector('.tool-title').textContent;
        const toolDescription = card.querySelector('.tool-description').textContent;
        
        // Create modal or expand card to show more details
        this.showNotification(`Viewing details for ${toolTitle}`, 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'warning' ? 'rgba(255, 170, 0, 0.9)' : 'rgba(0, 102, 255, 0.9)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    // Search functionality
    searchTools(query) {
        const toolCards = document.querySelectorAll('.tool-card');
        const searchTerm = query.toLowerCase();

        toolCards.forEach(card => {
            const title = card.querySelector('.tool-title').textContent.toLowerCase();
            const description = card.querySelector('.tool-description').textContent.toLowerCase();
            const features = Array.from(card.querySelectorAll('.tool-features li'))
                .map(li => li.textContent.toLowerCase())
                .join(' ');

            const matches = title.includes(searchTerm) || 
                           description.includes(searchTerm) || 
                           features.includes(searchTerm);

            if (matches) {
                card.style.display = 'block';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    // Export tools data
    exportToolsData() {
        return {
            tools: this.tools,
            currentCategory: this.currentCategory,
            totalTools: this.tools.length
        };
    }
}

// Tools Page Enhancement Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tools page loaded with enhanced performance!');
    
    // Initialize tools page functionality
    initializeToolsPage();
    
    // Preload next likely pages for better UX
    setTimeout(() => {
        if (window.browserCacheManager) {
            window.browserCacheManager.preloadPage('index');
            window.browserCacheManager.preloadPage('apps');
        }
    }, 2000);
});

function initializeToolsPage() {
    // Category filtering functionality
    const categoryButtons = document.querySelectorAll('.category-btn');
    const toolCards = document.querySelectorAll('.tool-card');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter tools with smooth animation
            toolCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Enhanced tool card interactions
    toolCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Add click tracking for analytics
        const primaryBtn = card.querySelector('.tool-btn.primary');
        if (primaryBtn) {
            primaryBtn.addEventListener('click', function() {
                const toolName = card.querySelector('.tool-title').textContent;
                console.log(`Tool accessed: ${toolName}`);
                // Track tool usage for analytics
                if (window.gtag) {
                    window.gtag('event', 'tool_click', {
                        'tool_name': toolName
                    });
                }
            });
        }
    });
    
    // Performance optimization: Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Smooth fade-in animations for sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.fade-section').forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Enhanced loading states for tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.disabled) {
                const originalText = this.textContent;
                this.textContent = 'Loading...';
                this.disabled = true;
                
                // Simulate loading state for better UX
                setTimeout(() => {
                    this.textContent = originalText;
                    this.disabled = false;
                }, 1000);
            }
        });
    });
    
    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close any open modals or dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });
        }
    });
    
    // Touch gesture support for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - could trigger category change
                console.log('Swipe up detected');
            } else {
                // Swipe down - could trigger search or filter
                console.log('Swipe down detected');
            }
        }
    }
    
    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', function() {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Tools page loaded in ${loadTime}ms`);
            
            // Report performance metrics
            if (window.gtag) {
                window.gtag('event', 'timing_complete', {
                    'name': 'load',
                    'value': loadTime
                });
            }
        });
    }
}

// Export for potential use in other scripts
window.toolsPage = {
    initialize: initializeToolsPage
};

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'k':
                e.preventDefault();
                const searchInput = document.querySelector('#toolSearch');
                if (searchInput) {
                    searchInput.focus();
                }
                break;
            case '1':
                e.preventDefault();
                window.toolsManager?.filterByCategory('all');
                break;
            case '2':
                e.preventDefault();
                window.toolsManager?.filterByCategory('ai');
                break;
            case '3':
                e.preventDefault();
                window.toolsManager?.filterByCategory('security');
                break;
        }
    }
}); 