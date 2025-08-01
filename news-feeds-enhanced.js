// Enhanced News Feed Aggregator with Color-Coded Category Buttons
class EnhancedNewsFeedAggregator {
    constructor() {
        console.log('EnhancedNewsFeedAggregator constructor called');
        this.currentCategory = 'all';
        this.currentDateFilter = 'all';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.allArticles = [];
        this.filteredArticles = [];
        this.isLoading = false;
        this.loadingCategories = new Set();
        this.categoryStates = {}; // Track category states
        this.failedFeeds = new Set(); // Track failed feeds for retry functionality
        
        // Caching system for static UI
        this.articleCache = new Map(); // Cache articles by feed URL
        this.lastFetchTimes = new Map(); // Track last fetch time for each feed
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache expiry
        this.isInitialLoad = true; // Track if this is the first load
        this.staticArticles = []; // Articles that should remain static in UI
        
        // Server-side cache system for instant loading
        this.serverCacheUrl = 'http://localhost:3001/api/cache';
        this.backgroundRefreshInterval = null;
        
        console.log('Constructor properties initialized, calling init()...');
        this.init();
    }

    async initializeFeeds() {
        try {
            // Load feeds from JSON files
            const feeds = await this.loadFeedsFromJSON();
            console.log('Feeds loaded from JSON files:', Object.keys(feeds));
            return feeds;
        } catch (error) {
            console.error('Error loading feeds from JSON, falling back to hardcoded feeds:', error);
            return this.getFallbackFeeds();
        }
    }

    async loadFeedsFromJSON() {
        const feeds = {};
        
        try {
            // Load the categories index first
            const categoriesResponse = await fetch('json-feeds/news-categories-index.json');
            const categoriesData = await categoriesResponse.json();
            
            // Load each category's feeds
            for (const category of categoriesData.categories) {
                try {
                    const feedResponse = await fetch(`json-feeds/${category.file}`);
                    const feedData = await feedResponse.json();
                    
                    if (feedData.feeds && Array.isArray(feedData.feeds)) {
                        feeds[category.name] = feedData.feeds;
                        console.log(`Loaded ${feedData.feeds.length} feeds for category: ${category.name}`);
                    }
                } catch (error) {
                    console.error(`Error loading feeds for category ${category.name}:`, error);
                    // Continue with other categories
                }
            }
            
            return feeds;
        } catch (error) {
            console.error('Error loading categories index:', error);
            throw error;
        }
    }

    getFallbackFeeds() {
        return {
            'AI': [
                { name: 'NVIDIA Blog', url: 'https://blogs.nvidia.com/blog/category/auto/feed/', type: 'rss' },
                { name: 'Wired AI', url: 'https://www.wired.com/feed/tag/ai/latest/rss', type: 'rss' },
                { name: 'Feeder News', url: 'https://news.nononsenseapps.com/index.atom', type: 'rss' },
                { name: 'AI Research', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCkUedU1YAz3QEYycpxz5HKw', type: 'youtube' },
                { name: 'AI Revolution', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC5l7RouTQ60oUjLjt1Nh-UQ', type: 'youtube' },
                { name: 'AI Samson', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCED3hlYdD0SlCff7jJ8tF3Q', type: 'youtube' },
                { name: 'AI Search', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCIgnGlGkVRhd4qNFcEwLL4A', type: 'youtube' },
                { name: 'AI Trends', url: 'https://www.aitrends.com/feed/', type: 'rss' },
                { name: 'AI Uncovered', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCUTF61UNExRdjmoK5mXwWfQ', type: 'youtube' },
                { name: 'Andy Stapleton', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCFqXmQ56-Gp1rIKa-GoAJvQ', type: 'youtube' },
                { name: 'DailyAI', url: 'https://dailyai.com/feed/', type: 'rss' },
                { name: 'DeepLearningAI', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCcIXc5mJsHVYTZR1maL5l9w', type: 'youtube' },
                { name: 'Dr. Know-it-all', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCyqpZ8HY9FY5jH-RoVcwlnw', type: 'youtube' },
                { name: 'Gadgets 360', url: 'https://www.gadgets360.com/rss/ai/feeds', type: 'rss' },
                { name: 'Google DeepMind', url: 'https://deepmind.google/blog/rss.xml', type: 'rss' },
                { name: 'Julia McCoy', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCqzK60-oUOEq36uU9B1MMUg', type: 'youtube' },
                { name: 'Machine Learning Mastery', url: 'https://machinelearningmastery.com/blog/feed/', type: 'rss' },
                { name: 'Matt Szaton', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBvDIqM6rPVgdQ-D9JqKTGA', type: 'youtube' },
                { name: 'Product Hunt AI', url: 'https://www.producthunt.com/feed?category=artificial-intelligence', type: 'rss' },
                { name: 'Skill Leap AI', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCwSozl89jl2zUDzQ4jGJD3g', type: 'youtube' },
                { name: 'The AI Advantage', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCHhYXsLBEVVnbvsq57n1MTQ', type: 'youtube' },
                { name: 'The AI Daily Brief', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCKelCK4ZaO6HeEI1KQjqzWA', type: 'youtube' },
                { name: 'Berkeley AI Research', url: 'https://bair.berkeley.edu/blog/feed.xml', type: 'rss' },
                { name: 'TheAIGRID', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCbY9xX3_jW5c2fjlZVBI4cg', type: 'youtube' },
                { name: 'Theoretically Media', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC9Ryt3XOGYBoAJVsBHNGDzA', type: 'youtube' },
                { name: 'Two Minute Papers', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCbfYPyITQ-7l4upoX8nvctg', type: 'youtube' },
                { name: 'MIT Technology Review AI', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', type: 'rss' },
                { name: 'ArXiv AI', url: 'https://export.arxiv.org/rss/cs.AI', type: 'rss' },
                { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', type: 'rss' }
            ],
            'Bioengineering': [
                { name: 'BioPharma Dive', url: 'https://www.biopharmadive.com/feeds/news/', type: 'rss' },
                { name: 'Healthcare Data Breaches', url: 'https://federalnewsnetwork.com/category/federal-insights/combating-healthcare-data-breaches-with-intelligence/feed/', type: 'rss' },
                { name: 'Dangerous Things Forum', url: 'https://forum.dangerousthings.com/latest.rss', type: 'rss' },
                { name: 'Digital Health', url: 'https://www.bioworld.com/rss/22', type: 'rss' },
                { name: 'HOLOLIFE Summit', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCpbppWVgOJcU0lf5rDYSSXw', type: 'youtube' },
                { name: 'Labiotech.eu', url: 'https://www.labiotech.eu/feed/', type: 'rss' },
                { name: 'Nature Biotechnology', url: 'https://www.nature.com/nbt.rss', type: 'rss' },
                { name: 'Neuralink', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCLt4d8cACHzrVvAz9gtaARA', type: 'youtube' },
                { name: 'Science', url: 'https://newatlas.com/science/index.rss', type: 'rss' },
                { name: 'The Medical Futurist', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8vwN4Sju7ER6KZzDADBKBQ', type: 'youtube' },
                { name: 'Biohacking', url: 'https://hackaday.com/tag/biohacking/feed/', type: 'rss' }
            ],
            'CRM Tools': [
                { name: 'Agencys Ai', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCI4yaNEFssXnlrQRmBt2FMg', type: 'youtube' },
                { name: 'HubSpot', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCaAx1xeTgF3rs4rBPDq6-Kw', type: 'youtube' },
                { name: 'Zoho CRM', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCy5GY9WtEg8SMgAZ_AiSlVw', type: 'youtube' }
            ],
            'Crypto': [
                { name: 'Alex Becker', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCKQvGU-qtjEthINeViNbn6A', type: 'youtube' },
                { name: 'Lark Davis', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCl2oCaw8hdR_kbqyqd2klIA', type: 'youtube' }
            ],
            'Cybersecurity': [
                { name: 'AI Dark Files', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCRoXUiP5sBe5CZfh9yUv1lw', type: 'youtube' },
                { name: 'Black Hat', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCJ6q9Ie29ajGqKApbLqfBOg', type: 'youtube' },
                { name: 'David Bombal', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCP7WmQ_U4GB3K51Od9QvM0w', type: 'youtube' },
                { name: 'HackerOne', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCsgzmECky2Q9lQMWzDwMhYw', type: 'youtube' },
                { name: 'Hak5', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC3s0BtrBJpwNDaflRSoiieQ', type: 'youtube' },
                { name: 'NetworkChuck', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC9x0AN7BWHpCDHSm9NiJFJQ', type: 'youtube' },
                { name: 'Spyboy Blog', url: 'https://spyboy.blog/category/networking/feed/', type: 'rss' },
                { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews', type: 'rss' },
                { name: 'Security Week', url: 'https://www.securityweek.com/feed/', type: 'rss' },
                { name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml', type: 'rss' },
                { name: 'Threat Post', url: 'https://threatpost.com/feed/', type: 'rss' },
                { name: 'Bleeping Computer', url: 'https://www.bleepingcomputer.com/feed/', type: 'rss' },
                { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', type: 'rss' }
            ],
            'Flipper': [
                { name: 'Talking Sasquach', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCUoJk48pujh29p8zLsnD5PQ', type: 'youtube' }
            ],
            'Marketing': [
                { name: 'AI Filmmaking Academy', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCz94LN8mm0Nv_5g79qPryrg', type: 'youtube' },
                { name: 'AI Space', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCTq6xMw_BHR5dgKQDs4qhsg', type: 'youtube' },
                { name: 'AIQUEST', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCdFRvwde9cmdVm_Q-ODZTZg', type: 'youtube' },
                { name: 'Chorus by ZoomInfo', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCRf8sxSbq-TvtWJZq_V1q_w', type: 'youtube' },
                { name: 'Darcy\'s Business', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCNzm7D-tRMg3Dw7nNA2fQhw', type: 'youtube' },
                { name: 'HeyGen', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCV0FmNF3iM-022BF1KbVtxA', type: 'youtube' },
                { name: 'Jonathan\'s Hub Jam', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCeFlDDx4rcssh2cO_yB4y-w', type: 'youtube' },
                { name: 'Jono Catliff', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCnzxPyNnn8jk4bHFk3JUBhA', type: 'youtube' },
                { name: 'Make', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8KWRrf8wqyowmWhXJ9DRjQ', type: 'youtube' },
                { name: 'Marketing AI Institute', url: 'https://www.marketingaiinstitute.com/blog/rss.xml', type: 'rss' },
                { name: 'Rick Mulready', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCmNAkARqTFvNoyxmFhKTS9Q', type: 'youtube' },
                { name: 'Romayroh', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCxI3-49z98MUKF3wTVJ9nkg', type: 'youtube' },
                { name: 'Shinefy', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC6z07Hh9Muy6urJgA0F0azg', type: 'youtube' },
                { name: 'Spencer Benterud', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCpOITtvjPXP53yRwDpliC2Q', type: 'youtube' },
                { name: 'Synthesia', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC0Rqs6pyPoGaMT5HFMFdslg', type: 'youtube' },
                { name: 'Tao Prompts', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCc1qMq2UBJD9cSKbeBwGoZQ', type: 'youtube' },
                { name: 'The AI Filmmaking Advantage', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCU6UHXn_S-FijQyy_mi8xcA', type: 'youtube' },
                { name: 'WesGPT', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCgzH02aZzAcX0bDvdzy928w', type: 'youtube' },
                { name: 'Zapier', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCEvsxF4Z12vwpwDUaU02yiA', type: 'youtube' },
                { name: 'metricsmule', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCSNF2YIUV3g-uZwuNSmA1Rw', type: 'youtube' }
            ],
            'Matrix': [
                { name: 'Bloomberg Technology', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCrM7B7SL_g1edFOnmj-SDKg', type: 'youtube' },
                { name: 'Defense', url: 'https://federalnewsnetwork.com/category/defense-main/feed/', type: 'rss' },
                { name: 'Defense News', url: 'https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml', type: 'rss' },
                { name: 'Technology', url: 'https://federalnewsnetwork.com/category/technology-main/feed/', type: 'rss' },
                { name: 'The Military Show', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCKfak8fBm_Lhy4eX9UKxEpA', type: 'youtube' }
            ],
            'Matrix FUTURE': [
                { name: 'Exoskeletons and Wearable Robotics', url: 'https://feeds.buzzsprout.com/2402589.rss', type: 'rss' },
                { name: 'Freethink', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UConJDkGk921yT9hISzFqpzw', type: 'youtube' },
                { name: 'Future of Government', url: 'https://federalnewsnetwork.com/category/federal-insights/future-of-government/feed/', type: 'rss' },
                { name: 'IT Innovation Insider', url: 'https://federalnewsnetwork.com/category/federal-insights/it-innovation-insider/feed/', type: 'rss' },
                { name: 'Innovation in Government', url: 'https://federalnewsnetwork.com/category/federal-insights/innovation-in-government/feed/', type: 'rss' },
                { name: 'Innovation in Government videos', url: 'https://federalnewsnetwork.com/category/federal-insights/innovation-in-government/innovation-in-government-videos/feed/', type: 'rss' },
                { name: 'Artificial intelligence (Bioworld)', url: 'https://www.bioworld.com/rss/20', type: 'rss' },
                { name: 'Quartz', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC9f78Z5hgtDt0n8JWyfBk8Q', type: 'youtube' },
                { name: 'Special Bulletin Review', url: 'https://federalnewsnetwork.com/category/federal-insights/special-bulletin-review-securing-our-citizens-while-modernizing/feed/', type: 'rss' }
            ],
            'NEW TECH': [
                { name: 'Military Trends', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCveyvadzzSXdNYjynAm_APA', type: 'youtube' },
                { name: 'Rowan Cheung', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8LUzR34nNX8KH3Edd0un1g', type: 'youtube' },
                { name: 'TechZone', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC6H07z6zAwbHRl4Lbl0GSsw', type: 'youtube' },
                { name: 'Technology (New Atlas)', url: 'https://newatlas.com/technology/index.rss', type: 'rss' }
            ],
            'Open AI': [
                { name: 'OpenAI', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCXZCJLdBC09xxGZ6gcdrc6A', type: 'youtube' }
            ],
            'Phones': [
                { name: 'Android Authority', url: 'https://www.androidauthority.com/feed/', type: 'rss' },
                { name: 'Apple Newsroom', url: 'https://www.apple.com/newsroom/rss-feed.rss', type: 'rss' },
                { name: 'GSMArena', url: 'https://www.gsmarena.com/rss-news-reviews.php3', type: 'rss' },
                { name: 'Matt Talks Tech', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCz6PEeVLG1TL6jMRTvSLm4g', type: 'youtube' }
            ],
            'Robotics': [
                { name: 'AI and Robotics', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCVtWNlve83y5i8rm5HQw6sg', type: 'youtube' },
                { name: 'Boston Dynamics', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC7vVhkEfw4nOGp8TyDk7RcQ', type: 'youtube' },
                { name: 'Figure', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCYlq-KmwPjc1DtsGmthFqSQ', type: 'youtube' },
                { name: 'The Robot Report', url: 'https://www.therobotreport.com/feed/', type: 'rss' },
                { name: 'Unitree Robotics', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCsMbp4V8oxzHCMdOUP-3oWw', type: 'youtube' },
                { name: 'Robohub', url: 'https://robohub.org/feed/', type: 'rss' },
                { name: 'Robotics Business Review (mirrors Robot Report)', url: 'https://www.therobotreport.com/feed/', type: 'rss' },
                { name: 'Will Robots Take My Job (TEDx Talks)', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCsT0YIqwnpJCM-mx7-gSA4Q', type: 'youtube' },
                { name: 'Real Engineering', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCR1IuLEqb6UEA_zQ81kwXfg', type: 'youtube' }
            ],
            'Space': [
                { name: 'ALPHA TECH', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCO9Vgn2ayVe67fE5tP6JQFA', type: 'youtube' },
                { name: 'ESA Space Science', url: 'https://www.esa.int/rssfeed/science', type: 'rss' },
                { name: 'GREAT SPACEX', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCRAu2aXcH-B5h9SREfyhXuA', type: 'youtube' },
                { name: 'NASASpaceflight', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCSUu1lih2RifWkKtDOJdsBA', type: 'youtube' },
                { name: 'Sciencephile the AI', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC7BhHN8NyMMru2RUygnDXSg', type: 'youtube' },
                { name: 'Starlink', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCOd-T4fKh4hjWx1qQHmhiJQ', type: 'youtube' },
                { name: 'The Aerospace Corporation', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCP1gMWD_BqVL4YXeJyhb7ng', type: 'youtube' },
                { name: 'NASA', url: 'https://www.nasa.gov/feed/', type: 'rss' },
                { name: 'Space.com', url: 'https://www.space.com/feeds/all', type: 'rss' },
                { name: 'SpaceNews', url: 'https://spacenews.com/feed/', type: 'rss' },
                { name: 'Astronomy Now', url: 'https://astronomynow.com/feed/', type: 'rss' },
                { name: 'Universe Today', url: 'https://www.universetoday.com/feed/', type: 'rss' },
                { name: 'Everyday Astronaut', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC6uKrU_WqJ1r2H7Y0cKTlJA', type: 'youtube' },
                { name: 'Scott Manley', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCxzC4EngIsMrPmbm6Nxvb-A', type: 'youtube' }
            ],
            'Tech Reviews': [
                { name: 'Marques Brownlee', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBJycsmduvYEL83R_U4JriQ', type: 'youtube' },
                { name: 'Mrwhosetheboss', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCMiJRAwDNSNzuYeN2uWa0pA', type: 'youtube' }
            ],
            'Transportation': [
                { name: 'Automotive IQ News', url: 'https://www.automotive-iq.com/rss/news', type: 'rss' },
                { name: 'Automotive IQ Reports', url: 'https://www.automotive-iq.com/rss/reports', type: 'rss' },
                { name: 'Vehicle Electrification', url: 'https://www.automotive-iq.com/rss/categories/electrics-electronics', type: 'rss' },
                { name: 'A Boring Revolution', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCxaChRLSN-k6QkUqF17sGjg', type: 'youtube' },
                { name: 'AI & CAR', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4AExSxU3TT8GxAYUeEZXVg', type: 'youtube' },
                { name: 'AmpedAuto', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCCF6WAhvjydnXUHl85cDXpA', type: 'youtube' },
                { name: 'Boat & Sail Magazine', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCgCMYcDTo077fYXhDB27C_Q', type: 'youtube' },
                { name: 'Form Trends', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCpifTlKKeTyZllzUBrWFtjA', type: 'youtube' },
                { name: 'Global Railway Review', url: 'https://feeds.feedburner.com/GlobalRailwayReview', type: 'rss' },
                { name: 'LatestCarsPro', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCgVYEv7-4Cug-1Gd4DjULfg', type: 'youtube' },
                { name: 'The Tesla Space', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCJjAIBWeY022ZNj_Cp_6wAw', type: 'youtube' }
            ],
            'Hydrogen': [
                { name: 'Hydrogen Cars Now', url: 'https://www.hydrogencarsnow.com/index.php/feed/', type: 'rss' },
                { name: 'Hydrogen Fuel News', url: 'https://www.hydrogenfuelnews.com/feed/', type: 'rss' }
            ],
            'Trends': [
                { name: 'TrendHunter AI', url: 'https://www.trendhunter.com/rss/category/Cool-Gadgets-and-Gifts', type: 'rss' }
            ]
        };
    }

    async init() {
        console.log('EnhancedNewsFeedAggregator initializing...');
        
        try {
            // Initialize feeds from JSON files
            this.feeds = await this.initializeFeeds();
            console.log('Feeds initialized, categories:', Object.keys(this.feeds));
            console.log('Total feeds to load:', Object.keys(this.feeds).reduce((total, category) => total + this.feeds[category].length, 0));
            
            this.setupEventListeners();
            console.log('Event listeners setup complete');
            
            // Try to load from server cache first for instant display
            const cachedNews = await this.loadFromServerCache();
            if (cachedNews && cachedNews.length > 0) {
                this.allArticles = cachedNews;
                this.staticArticles = [...cachedNews];
                this.filteredArticles = [...this.allArticles];
                this.isInitialLoad = false;
                this.filterArticles();
                this.renderNews();
                this.updateActiveFilter();
                this.updateActiveDateFilter();
                this.handleURLParameters();
                this.updateCategoryButtonColors();
                console.log(`Loaded ${cachedNews.length} articles from server cache for instant display`);
                
                // Set up periodic refresh for background updates
                this.setupPeriodicRefresh();
            } else {
                // No cache available, show loading and load normally
                console.log('No server cache found, loading feeds normally...');
                this.showLoadingBanner();
                await this.loadAllFeeds();
                this.renderNews();
                this.updateActiveFilter();
                this.updateActiveDateFilter();
                this.handleURLParameters();
                this.updateCategoryButtonColors();
            }
            
            console.log('EnhancedNewsFeedAggregator initialization complete');
        } catch (error) {
            console.error('Error during news aggregator initialization:', error);
            this.handleInitializationError(error);
        }
        
        // Set up cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }
    
    cleanup() {
        // Clear background refresh interval
        if (this.backgroundRefreshInterval) {
            clearInterval(this.backgroundRefreshInterval);
            this.backgroundRefreshInterval = null;
            console.log('Cleaned up background refresh interval');
        }
    }

    handleInitializationError(error) {
        console.log('Handling initialization error, adding fallback content...');
        const container = document.getElementById('news-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 2rem; background: rgba(255, 68, 68, 0.1); border: 1px solid rgba(255, 68, 68, 0.3); border-radius: 8px; color: #ff4444;">
                    <h3><i class="fas fa-exclamation-triangle"></i> News Feed Error</h3>
                    <p>There was an issue loading the news feeds. This could be due to:</p>
                    <ul style="text-align: left; max-width: 500px; margin: 1rem auto;">
                        <li>Network connectivity issues</li>
                        <li>CORS proxy limitations</li>
                        <li>Feed source availability</li>
                    </ul>
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-refresh"></i> Reload Page
                    </button>
                </div>
            `;
        }
        
        // Still try to add test articles as fallback
        setTimeout(() => {
            this.addTestArticles();
        }, 1000);
    }

    setupEventListeners() {
        // Category filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-filter')) {
                const selectedCategory = e.target.dataset.category;
                
                // Always allow category switching, regardless of loading state
                this.currentCategory = selectedCategory;
                this.currentPage = 1;
                this.filterArticles();
                this.renderNews();
                this.updateActiveFilter();
                this.updateDateFilterCounts(); // Update date filter counts for new category
                this.resetLoadMoreButton(); // Reset load more button state
                
                // Only show loading indicator for categories without content
                if (selectedCategory !== 'all' && this.isLoading && !this.hasContentInCategory(selectedCategory)) {
                    this.updateCategoryLoadingState(selectedCategory, true);
                    
                    // Remove loading indicator after a short delay
                    setTimeout(() => {
                        this.updateCategoryLoadingState(selectedCategory, false);
                    }, 1500);
                }
                
                // Show appropriate notification based on category state
                if (selectedCategory !== 'all') {
                    const articleCount = this.getCategoryArticleCount(selectedCategory);
                    const isCurrentlyLoading = this.isCategoryLoading(selectedCategory);
                    
                    if (isCurrentlyLoading) {
                        showNotification(`${selectedCategory} feeds are currently loading...`, 'info');
                    } else if (articleCount > 0) {
                        showNotification(`Showing ${articleCount} ${selectedCategory} articles`, 'success');
                    } else if (this.isLoading) {
                        showNotification(`Switched to ${selectedCategory} - feeds are still loading in background`, 'info');
                    } else {
                        showNotification(`No ${selectedCategory} articles available yet`, 'warning');
                    }
                }
            }
        });

        // Date filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('date-filter')) {
                const selectedDateFilter = e.target.dataset.dateFilter;
                
                this.currentDateFilter = selectedDateFilter;
                this.currentPage = 1;
                this.filterArticles();
                this.renderNews();
                this.updateActiveDateFilter();
                this.resetLoadMoreButton(); // Reset load more button state
            }
        });

        // Search functionality
        const searchInput = document.getElementById('news-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                console.log('Search input changed:', e.target.value);
                this.currentPage = 1; // Reset to first page when searching
                this.filterArticles(e.target.value);
                this.renderNews();
                this.resetLoadMoreButton(); // Reset load more button state
            });
            
            // Also handle 'Enter' key for search
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    console.log('Search submitted:', e.target.value);
                    this.currentPage = 1;
                    this.filterArticles(e.target.value);
                    this.renderNews();
                    this.resetLoadMoreButton(); // Reset load more button state
                }
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-news');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreArticles();
            });
        }

        // Retry failed button
        const retryFailedBtn = document.getElementById('retry-failed-btn');
        if (retryFailedBtn) {
            retryFailedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Retry failed button clicked');
                this.retryFailedFeeds();
            });
        }

        // Refresh new content button
        const refreshNewBtn = document.getElementById('refresh-new-btn');
        if (refreshNewBtn) {
            refreshNewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Refresh new content button clicked');
                this.refreshNewContent();
            });
        }

    }



    hasContentInCategory(category) {
        const categoryArticles = this.allArticles.filter(article => article.category === category);
        return categoryArticles.length > 0;
    }
    
    getCategoryArticleCount(category) {
        const categoryArticles = this.allArticles.filter(article => article.category === category);
        return categoryArticles.length;
    }
    
    isCategoryLoading(category) {
        return this.loadingCategories.has(category);
    }



    updateCategoryButtonColors() {
        // Update all category buttons based on content availability
        Object.keys(this.feeds).forEach(category => {
            const button = document.querySelector(`[data-category="${category}"]`);
            if (button) {
                const hasContent = this.hasContentInCategory(category);
                
                // Debug logging
                console.log(`Category ${category}: hasContent = ${hasContent}, total articles = ${this.allArticles.filter(a => a.category === category).length}`);
                
                // Remove existing color classes and loading state
                button.style.removeProperty('background-color');
                button.style.removeProperty('border-color');
                button.style.removeProperty('color');
                button.style.removeProperty('box-shadow');
                button.classList.remove('pulse-green', 'pulse-red', 'loading');
                button.style.opacity = '1';
                
                if (hasContent) {
                    // GREEN for categories with any content present - NO LOADING INDICATOR
                    button.style.backgroundColor = '#00aa00';
                    button.style.borderColor = '#00aa00';
                    button.style.color = 'white';
                    button.style.boxShadow = '0 0 15px rgba(0, 170, 0, 0.4)';
                    button.classList.add('pulse-green');
                    console.log(`Setting ${category} button to GREEN (has content) - no loading indicator`);
                } else {
                    // RED for categories with no content - SHOW LOADING INDICATOR
                    button.style.backgroundColor = '#ff4444';
                    button.style.borderColor = '#ff4444';
                    button.style.color = 'white';
                    button.style.boxShadow = '0 0 15px rgba(255, 68, 68, 0.4)';
                    button.classList.add('pulse-red', 'loading');
                    console.log(`Setting ${category} button to RED (no content) - showing loading indicator`);
                }
            }
        });
        
        // Update retry button text based on whether all categories have content
        this.updateRetryButtonText();
    }

    updateRetryButtonText() {
        const retryBtn = document.getElementById('retry-failed-btn');
        if (!retryBtn) return;

        // Check if there are any failed feeds to retry
        const hasFailedFeeds = this.failedFeeds.size > 0;
        
        // Check if there are any empty categories (red categories)
        const emptyCategories = Object.keys(this.feeds).filter(category => 
            !this.hasContentInCategory(category)
        );
        const hasEmptyCategories = emptyCategories.length > 0;
        
        // Check if all categories have content
        const allCategoriesHaveContent = Object.keys(this.feeds).every(category => 
            this.hasContentInCategory(category)
        );

        // Debug logging
        console.log(`updateRetryButtonText: failedFeeds.size = ${this.failedFeeds.size}, hasFailedFeeds = ${hasFailedFeeds}, emptyCategories = ${emptyCategories.length}, hasEmptyCategories = ${hasEmptyCategories}, allCategoriesHaveContent = ${allCategoriesHaveContent}`);
        if (hasFailedFeeds) {
            console.log('Failed feeds:', Array.from(this.failedFeeds));
        }
        if (hasEmptyCategories) {
            console.log('Empty categories:', emptyCategories);
        }

        if (hasFailedFeeds || hasEmptyCategories) {
            // If there are failed feeds or empty categories, show "Retry Failed Categories"
            const totalCategoriesToRetry = new Set([...emptyCategories, ...Array.from(this.failedFeeds).map(feedKey => feedKey.split(':')[0])]).size;
            retryBtn.innerHTML = '<i class="fas fa-redo-alt"></i> Retry Failed Categories';
            retryBtn.title = `Retry ${totalCategoriesToRetry} categories with failed feeds or no content`;
            
            // Auto-retry after 1 second if there are failed categories
            setTimeout(() => {
                if (this.failedFeeds.size > 0 || emptyCategories.length > 0) {
                    console.log(`Auto-retrying ${totalCategoriesToRetry} failed categories after 1 second...`);
                    this.retryFailedFeeds();
                }
            }, 1000);
        } else if (allCategoriesHaveContent) {
            // If no failed feeds and all categories have content, hide the button
            retryBtn.style.display = 'none';
        } else {
            // Fallback case
            retryBtn.innerHTML = '<i class="fas fa-redo-alt"></i> Retry Failed Categories';
            retryBtn.title = 'Retry categories with failed feeds or no content';
        }
    }





    async refreshNewContent() {
        console.log('Refreshing new content only...');
        
        // Don't clear static articles, just fetch new content
        const currentStaticCount = this.staticArticles.length;
        
        // Show loading states
        this.isLoading = true;
        this.showLoadingBanner();
        this.updateAllCategoryLoadingStates(true);
        
        try {
            await this.loadAllFeeds();
            this.renderNews();
            
            const newArticlesCount = this.allArticles.length - currentStaticCount;
            if (newArticlesCount > 0) {
                showNotification(`${newArticlesCount} new articles found!`, 'success');
            } else {
                showNotification('No new articles found.', 'info');
            }
        } catch (error) {
            console.error('Error refreshing new content:', error);
            showNotification('Error refreshing content. Please try again.', 'error');
        } finally {
            // Remove loading state from all categories
            this.updateAllCategoryLoadingStates(false);
            this.hideLoadingBanner();
        }
    }

    async loadAllFeeds() {
        this.isLoading = true;
        this.showLoadingBanner(); // Show the loading banner
        this.updateAllCategoryLoadingStates(true); // Show loading for all categories

        const feedPromises = [];
        const feedInfo = []; // Track feed info for failed feeds
        let totalFeeds = 0;
        let newArticlesCount = 0;
        
        // Count total feeds and create promises
        for (const [category, feeds] of Object.entries(this.feeds)) {
            totalFeeds += feeds.length;
            for (const feed of feeds) {
                const promise = this.fetchFeedWithCache(feed, category);
                feedPromises.push(promise);
                feedInfo.push({ feed, category, name: feed.name });
            }
        }

        console.log(`Loading ${totalFeeds} feeds across ${Object.keys(this.feeds).length} categories...`);

        try {
            const results = await Promise.allSettled(feedPromises);
            let successfulFeeds = 0;
            let failedFeeds = 0;
            let emptyFeeds = 0;
            let cachedFeeds = 0;
            
            // Clear previous failed feeds tracking
            this.failedFeeds.clear();
            
            results.forEach((result, index) => {
                const { feed, category, name } = feedInfo[index];
                const feedKey = `${category}:${name}`;
                
                if (result.status === 'fulfilled' && result.value) {
                    if (result.value.articles && result.value.articles.length > 0) {
                        // Add new articles to the collection
                        this.allArticles.push(...result.value.articles);
                        newArticlesCount += result.value.articles.length;
                        successfulFeeds++;
                        
                        if (result.value.fromCache) {
                            cachedFeeds++;
                            console.log(`Using cached data for: ${name}`);
                        } else {
                            console.log(`Fresh data loaded for: ${name}`);
                        }
                    } else {
                        emptyFeeds++;
                        console.warn(`Feed returned no articles (empty but successful): ${name}`);
                    }
                } else {
                    failedFeeds++;
                    // Track failed feed for retry functionality
                    this.failedFeeds.add(feedKey);
                    if (result.status === 'rejected') {
                        console.error(`Feed ${name} (${category}) failed:`, result.reason);
                    } else {
                        console.error(`Feed ${name} (${category}) returned null/undefined`);
                    }
                }
            });

            console.log(`Feed loading complete: ${successfulFeeds} successful (${cachedFeeds} cached), ${emptyFeeds} empty, ${failedFeeds} failed`);
            console.log(`Failed feeds:`, Array.from(this.failedFeeds));
            console.log(`Total articles loaded: ${this.allArticles.length} (${newArticlesCount} new)`);

            // Remove duplicate articles based on title and URL
            const seenArticles = new Set();
            this.allArticles = this.allArticles.filter(article => {
                if (!article || !article.title || !article.link) {
                    return false;
                }
                
                // Create a unique key for each article
                const articleKey = `${article.title.toLowerCase().trim()}-${article.link}`;
                
                if (seenArticles.has(articleKey)) {
                    console.log(`Removing duplicate article: ${article.title}`);
                    return false;
                }
                
                seenArticles.add(articleKey);
                return true;
            });
            
            console.log(`After deduplication: ${this.allArticles.length} unique articles`);
            
            // Sort articles by date
            this.allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
            
            // Save to server cache for future loads
            await this.saveToServerCache(this.allArticles);
            
            // On initial load, set static articles
            if (this.isInitialLoad) {
                this.staticArticles = [...this.allArticles];
                this.isInitialLoad = false;
                console.log(`Initial load complete. ${this.staticArticles.length} articles set as static.`);
            }
            
            // Set up aggressive periodic refresh (every minute) for future updates
            this.setupAggressivePeriodicRefresh();
            
            // Apply current filters
            this.filterArticles();
            
            // Log articles per category
            const categoryCounts = {};
            this.allArticles.forEach(article => {
                categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
            });
            console.log('Articles per category:', categoryCounts);
            
            // Update category button colors after loading all feeds
            this.updateCategoryButtonColors();
            
            // Update date filter counts after loading all feeds
            this.updateDateFilterCounts();
            
        } catch (error) {
            console.error('Error loading feeds:', error);
        } finally {
            this.isLoading = false;
            this.hideLoadingBanner(); // Hide the loading banner
            this.updateAllCategoryLoadingStates(false); // Remove loading from all categories
            this.updateRetryButtonText(); // Update retry button text based on current state
            console.log('loadAllFeeds completed, total articles loaded:', this.allArticles.length);
            
            // If no articles were loaded, add some test articles
            if (this.allArticles.length === 0) {
                console.log('No articles loaded, adding test articles...');
                this.addTestArticles();
            }
        }
    }

    addTestArticles() {
        console.log('Adding test articles for demonstration...');
        
        const testArticles = [
            {
                title: 'AI Breakthrough: New Language Model Achieves Human-Level Understanding',
                description: 'Researchers have developed a revolutionary AI model that demonstrates unprecedented language comprehension capabilities, marking a significant milestone in artificial intelligence development.',
                link: 'https://www.google.com',
                pubDate: new Date().toISOString(),
                category: 'AI',
                image: this.getDefaultImage('AI'),
                source: 'AI Research News',
                type: 'article'
            },
            {
                title: 'Cybersecurity Alert: New Zero-Day Vulnerability Discovered',
                description: 'Security researchers have identified a critical zero-day vulnerability affecting major operating systems. Users are advised to update their systems immediately.',
                link: 'https://www.github.com',
                pubDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                category: 'Cybersecurity',
                image: this.getDefaultImage('Cybersecurity'),
                source: 'Security Weekly',
                type: 'article'
            },
            {
                title: 'Bioengineering Milestone: Artificial Organs Show Promise in Clinical Trials',
                description: 'Breakthrough developments in bioengineering have led to successful artificial organ transplants in early clinical trials, offering hope for patients on transplant waiting lists.',
                link: 'https://www.wikipedia.org',
                pubDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                category: 'Bioengineering',
                image: this.getDefaultImage('Bioengineering'),
                source: 'BioTech Today',
                type: 'article'
            },
            {
                title: 'Cryptocurrency Market Analysis: Bitcoin Reaches New Heights',
                description: 'Bitcoin has achieved a new all-time high, driven by institutional adoption and growing mainstream acceptance of digital currencies.',
                link: 'https://www.youtube.com',
                pubDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                category: 'Crypto',
                image: this.getDefaultImage('Crypto'),
                source: 'Crypto Daily',
                type: 'article'
            },
            {
                title: 'Marketing Revolution: AI-Powered Campaigns Outperform Traditional Methods',
                description: 'New AI-driven marketing platforms are delivering unprecedented ROI, revolutionizing how businesses approach customer acquisition and retention.',
                link: 'https://www.stackoverflow.com',
                pubDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
                category: 'Marketing',
                image: this.getDefaultImage('Marketing'),
                source: 'Marketing Insights',
                type: 'article'
            },
            {
                title: 'Space Exploration: Mars Mission Discovers Evidence of Ancient Water',
                description: 'NASA\'s latest Mars rover has discovered compelling evidence of ancient water systems, providing new insights into the planet\'s geological history.',
                link: 'https://www.nasa.gov',
                pubDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
                category: 'Space',
                image: this.getDefaultImage('Space'),
                source: 'Space News',
                type: 'article'
            }
        ];
        
        this.allArticles.push(...testArticles);
        console.log(`Added ${testArticles.length} test articles`);
        
        // Re-filter and render with the new test articles
        this.filterArticles();
        this.renderNews();
        this.updateCategoryButtonColors();
        this.updateDateFilterCounts();
    }

    async retryFailedFeeds() {
        const retryBtn = document.getElementById('retry-failed-btn');
        if (!retryBtn) return;

        // Get categories that have no content (red categories)
        const emptyCategories = Object.keys(this.feeds).filter(category => 
            !this.hasContentInCategory(category)
        );

        // Get categories that have failed feeds
        const categoriesWithFailedFeeds = new Set();
        for (const feedKey of this.failedFeeds) {
            const [category] = feedKey.split(':');
            categoriesWithFailedFeeds.add(category);
        }

        // Combine empty categories with categories that have failed feeds
        const categoriesToRetry = new Set([...emptyCategories, ...categoriesWithFailedFeeds]);

        if (categoriesToRetry.size === 0) {
            showNotification('No categories need retrying! All categories have content.', 'info');
            return;
        }

        // Show loading state
        retryBtn.classList.add('loading');
        retryBtn.innerHTML = '<i class="fas fa-spinner"></i> Retrying...';
        this.showLoadingBanner(); // Show loading banner during retry

        try {
            console.log(`Retrying categories: ${Array.from(categoriesToRetry).join(', ')}`);
            console.log(`Empty categories: ${emptyCategories.join(', ')}`);
            console.log(`Categories with failed feeds: ${Array.from(categoriesWithFailedFeeds).join(', ')}`);
            
            // Show loading state only for categories that need retrying
            for (const category of categoriesToRetry) {
                this.updateCategoryLoadingState(category, true);
            }
            
            // Collect all feeds from categories that need retrying
            const feedsToRetry = [];
            const retryFeedInfo = [];
            
            for (const category of categoriesToRetry) {
                const categoryFeeds = this.feeds[category] || [];
                for (const feed of categoryFeeds) {
                    const feedKey = `${category}:${feed.name}`;
                    feedsToRetry.push(this.fetchFeed(feed, category));
                    retryFeedInfo.push({ feed, category, name: feed.name, feedKey });
                }
            }
            
            console.log(`Retrying ${feedsToRetry.length} feeds from ${categoriesToRetry.size} categories...`);
            
            const results = await Promise.allSettled(feedsToRetry);
            let successfulRetries = 0;
            let failedRetries = 0;
            const newFailedFeeds = new Set();
            
            results.forEach((result, index) => {
                const { feed, category, name, feedKey } = retryFeedInfo[index];
                
                if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
                    // Successfully retried - add articles and remove from failed feeds
                    this.allArticles.push(...result.value);
                    successfulRetries++;
                    console.log(`Successfully retried feed: ${name} (${category})`);
                } else {
                    // Still failed - keep in failed feeds
                    newFailedFeeds.add(feedKey);
                    failedRetries++;
                    console.error(`Failed to retry feed: ${name} (${category})`);
                }
            });
            
            // Update failed feeds set
            this.failedFeeds = newFailedFeeds;
            
            // Sort articles by date
            this.allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
            
            // Apply current filters
            this.filterArticles();
            
            // Update category button colors
            this.updateCategoryButtonColors();
            
            // Update date filter counts after retry
            this.updateDateFilterCounts();
            
            // Show appropriate notification
            if (successfulRetries > 0) {
                showNotification(`Successfully retried ${successfulRetries} feeds from ${categoriesToRetry.size} categories!`, 'success');
                console.log(`Retry completed: ${successfulRetries} successful, ${failedRetries} still failed`);
            } else {
                showNotification('No feeds could be retried successfully.', 'warning');
                console.log('Retry failed for all feeds');
            }
            
        } catch (error) {
            console.error('Error during retry:', error);
            showNotification('Error occurred while retrying feeds. Please try again.', 'error');
        } finally {
            // Remove loading state from all categories
            this.updateAllCategoryLoadingStates(false);
            
            // Remove loading state from retry button
            retryBtn.classList.remove('loading');
            this.updateRetryButtonText(); // Update button text based on current state
            this.hideLoadingBanner(); // Hide loading banner after retry
        }
    }

    async fetchFeedWithCache(feed, category) {
        try {
            const feedKey = `${category}:${feed.name}`;
            const now = Date.now();
            const lastFetch = this.lastFetchTimes.get(feedKey) || 0;
            
            // Check if we have cached data and it's still valid
            if (this.articleCache.has(feedKey) && (now - lastFetch) < this.cacheExpiry) {
                console.log(`Using cached data for ${feed.name} (cache age: ${Math.round((now - lastFetch) / 1000)}s)`);
                return {
                    articles: this.articleCache.get(feedKey),
                    fromCache: true
                };
            }
            
            console.log(`Fetching fresh data for: ${feed.name} (${category}) - ${feed.url}`);
            
            // Fetch fresh data
            const articles = await this.fetchFeed(feed, category);
            
            // Cache the results
            if (articles && articles.length > 0) {
                this.articleCache.set(feedKey, articles);
                this.lastFetchTimes.set(feedKey, now);
                console.log(`Cached ${articles.length} articles for ${feed.name}`);
            }
            
            return {
                articles: articles || [],
                fromCache: false
            };
            
        } catch (error) {
            console.error(`Error in fetchFeedWithCache for ${feed.name}:`, error);
            
            // If fetch fails, try to return cached data even if expired
            const feedKey = `${category}:${feed.name}`;
            if (this.articleCache.has(feedKey)) {
                console.log(`Fetch failed, using expired cache for ${feed.name}`);
                return {
                    articles: this.articleCache.get(feedKey),
                    fromCache: true
                };
            }
            
            return {
                articles: [],
                fromCache: false
            };
        }
    }

    // Server-side cache management methods
    async loadFromServerCache() {
        try {
            const response = await fetch(this.serverCacheUrl);
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    // Combine all cached categories
                    const allArticles = [];
                    for (const [category, cacheData] of Object.entries(result.data)) {
                        if (cacheData.articles && Array.isArray(cacheData.articles)) {
                            allArticles.push(...cacheData.articles);
                        }
                    }
                    
                    if (allArticles.length > 0) {
                        console.log(`Loaded ${allArticles.length} articles from server cache`);
                        return allArticles;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading from server cache:', error);
        }
        return null;
    }

    async saveToServerCache(articles) {
        try {
            if (articles && articles.length > 0) {
                // Group articles by category
                const articlesByCategory = {};
                articles.forEach(article => {
                    if (!articlesByCategory[article.category]) {
                        articlesByCategory[article.category] = [];
                    }
                    articlesByCategory[article.category].push(article);
                });
                
                // Save each category to server cache
                for (const [category, categoryArticles] of Object.entries(articlesByCategory)) {
                    const response = await fetch(`${this.serverCacheUrl}/${category}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ articles: categoryArticles })
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        console.log(`Saved ${categoryArticles.length} articles to server cache for ${category}`);
                    } else {
                        console.warn(`Failed to save ${category} articles to server cache`);
                    }
                }
            }
        } catch (error) {
            console.error('Error saving to server cache:', error);
        }
    }

    setupAggressivePeriodicRefresh() {
        // Clear any existing interval
        if (this.backgroundRefreshInterval) {
            clearInterval(this.backgroundRefreshInterval);
        }

        // Set up aggressive refresh every 1 minute
        this.backgroundRefreshInterval = setInterval(() => {
            console.log('Performing aggressive background refresh (every minute)...');
            this.performAggressiveBackgroundRefresh();
        }, 60 * 1000); // 1 minute

        console.log('Set up aggressive periodic refresh every 1 minute');
    }

    startBackgroundRefresh() {
        console.log('Starting immediate background refresh...');
        this.performBackgroundRefresh();
    }

    async performAggressiveBackgroundRefresh() {
        try {
            console.log('Performing aggressive background refresh to check for new articles...');
            
            const currentArticleCount = this.allArticles.length;
            const currentArticlesByCategory = {};
            
            // Group current articles by category for better duplicate detection
            this.allArticles.forEach(article => {
                if (!currentArticlesByCategory[article.category]) {
                    currentArticlesByCategory[article.category] = new Set();
                }
                const articleKey = this.generateArticleKey(article);
                currentArticlesByCategory[article.category].add(articleKey);
            });
            
            // Load feeds in the background without showing loading indicators
            const feedPromises = [];
            const feedInfo = [];
            
            for (const [category, feeds] of Object.entries(this.feeds)) {
                for (const feed of feeds) {
                    const promise = this.fetchFeed(feed, category);
                    feedPromises.push(promise);
                    feedInfo.push({ feed, category, name: feed.name });
                }
            }
            
            const results = await Promise.allSettled(feedPromises);
            const newArticles = [];
            const categoryUpdates = {};
            
            results.forEach((result, index) => {
                const { category, name } = feedInfo[index];
                if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
                    // Check for duplicates within this category
                    const categoryExistingKeys = currentArticlesByCategory[category] || new Set();
                    const categoryNewArticles = [];
                    
                    result.value.forEach(article => {
                        const articleKey = this.generateArticleKey(article);
                        if (!categoryExistingKeys.has(articleKey)) {
                            categoryNewArticles.push(article);
                            categoryExistingKeys.add(articleKey);
                        }
                    });
                    
                    if (categoryNewArticles.length > 0) {
                        newArticles.push(...categoryNewArticles);
                        categoryUpdates[category] = categoryNewArticles.length;
                        console.log(`Found ${categoryNewArticles.length} new articles in ${category}`);
                    }
                }
            });
            
            if (newArticles.length > 0) {
                // Add new articles to existing collection
                this.allArticles.push(...newArticles);
                
                // Sort by date
                this.allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
                
                // Save to server cache
                await this.saveToServerCache(this.allArticles);
                
                // Update the UI if user is still on the page
                this.filterArticles();
                this.updateCategoryButtonColors();
                this.updateDateFilterCounts();
                
                console.log(`Aggressive background refresh found ${newArticles.length} total new articles`);
                console.log('Category updates:', categoryUpdates);
                
                // Show detailed notification about new content
                this.showDetailedNewContentNotification(newArticles.length, categoryUpdates);
            } else {
                console.log('Aggressive background refresh completed - no new articles found');
            }
            
        } catch (error) {
            console.error('Error during aggressive background refresh:', error);
        }
    }
    
    generateArticleKey(article) {
        // Create a unique key for duplicate detection
        const title = article.title ? article.title.toLowerCase().trim() : '';
        const link = article.link ? article.link.trim() : '';
        const pubDate = article.pubDate ? new Date(article.pubDate).toISOString().split('T')[0] : '';
        
        // Use title + link + date for more accurate duplicate detection
        return `${title}-${link}-${pubDate}`;
    }

    showDetailedNewContentNotification(totalCount, categoryUpdates) {
        // Create a detailed notification that new content is available
        const existingNotification = document.getElementById('new-content-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create category breakdown
        const categoryList = Object.entries(categoryUpdates)
            .map(([category, count]) => `${category}: ${count}`)
            .join(', ');

        const notification = document.createElement('div');
        notification.id = 'new-content-notification';
        notification.className = 'new-content-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-bell"></i>
                <div class="notification-text">
                    <div class="notification-title">${totalCount} new articles found!</div>
                    <div class="notification-details">${categoryList}</div>
                </div>
                <button onclick="location.reload()" class="btn btn-sm btn-primary">Refresh</button>
                <button onclick="this.parentElement.parentElement.remove()" class="btn btn-sm btn-secondary">Dismiss</button>
            </div>
        `;

        // Add CSS for the notification if it doesn't exist
        if (!document.getElementById('new-content-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'new-content-notification-styles';
            style.textContent = `
                .new-content-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(0, 102, 255, 0.95);
                    color: white;
                    padding: 1rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    z-index: 10000;
                    animation: slideInRight 0.3s ease-out;
                    max-width: 400px;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .notification-text {
                    flex: 1;
                    min-width: 0;
                }
                
                .notification-title {
                    font-weight: bold;
                    margin-bottom: 0.25rem;
                }
                
                .notification-details {
                    font-size: 0.8rem;
                    opacity: 0.9;
                }
                
                .notification-content .btn {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.8rem;
                    white-space: nowrap;
                }
                
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 15000);
    }

    async fetchFeed(feed, category) {
        try {
            console.log(`Fetching feed: ${feed.name} (${category}) - ${feed.url}`);
            
            // Category-specific CORS proxies for better load distribution and reliability
            const categoryProxies = {
                'AI': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'Bioengineering': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'CRM Tools': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'Crypto': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'Cybersecurity': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'Flipper': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'Hydrogen': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'Marketing': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'Matrix': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'Matrix FUTURE': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'NEW TECH': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'Open AI': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'Phones': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'Robotics': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'Space': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'Tech Reviews': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'Transportation': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'Trends': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ],
                'Video Games': [
                    'https://api.allorigins.win/get?url=',
                    'https://thingproxy.freeboard.io/fetch/',
                    'https://api.codetabs.com/v1/proxy?quest=',
                    'https://corsproxy.io/?'
                ]
            };
            
            // Use category-specific proxies, fallback to general proxies if category not found
            const proxies = categoryProxies[category] || [
                'https://api.allorigins.win/get?url=',
                'https://thingproxy.freeboard.io/fetch/',
                'https://api.codetabs.com/v1/proxy?quest=',
                'https://corsproxy.io/?'
            ];
            
            console.log(`Using ${proxies.length} category-specific proxies for ${category}:`, proxies.map(p => p.split('/')[2]));
            
            let response = null;
            let lastError = null;
            let responseText = null;
            
            for (const proxyUrl of proxies) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                    
                    console.log(`Trying proxy: ${proxyUrl.split('/')[2]} for ${feed.name}`);
                    
                    response = await fetch(proxyUrl + encodeURIComponent(feed.url), {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        },
                        signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (response.ok) {
                        const text = await response.text();
                        
                        // Handle allorigins.win JSON response
                        if (proxyUrl.includes('allorigins.win/get')) {
                            try {
                                const jsonData = JSON.parse(text);
                                if (jsonData.contents) {
                                    responseText = jsonData.contents;
                                    console.log(`Successfully got content from allorigins for ${feed.name}`);
                                    break;
                                } else if (jsonData.status && jsonData.status.url) {
                                    // Sometimes allorigins returns different structure
                                    responseText = jsonData.data || text;
                                    console.log(`Successfully got alternate content from allorigins for ${feed.name}`);
                                    break;
                                }
                            } catch (jsonError) {
                                console.warn(`Failed to parse allorigins JSON for ${feed.name}:`, jsonError);
                                // Try treating it as direct response
                                if (text && text.includes('<rss') || text.includes('<feed') || text.includes('<entry')) {
                                    responseText = text;
                                    console.log(`Using raw response from allorigins for ${feed.name}`);
                                    break;
                                }
                                continue;
                            }
                        } else {
                            responseText = text;
                            console.log(`Successfully got content from ${proxyUrl.split('/')[2]} for ${feed.name}`);
                            break;
                        }
                    }
                } catch (error) {
                    console.warn(`Proxy ${proxyUrl.split('/')[2]} failed for ${feed.name}:`, error.message);
                    lastError = error;
                    continue;
                }
            }
            
            if (!responseText) {
                console.warn(`All CORS proxies failed for ${feed.name}, trying direct fetch...`);
                
                // Try direct fetch as last resort
                try {
                    response = await fetch(feed.url, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });
                    
                    if (response.ok) {
                        responseText = await response.text();
                        console.log(`Direct fetch succeeded for ${feed.name}`);
                    } else {
                        throw lastError || new Error(`All proxies and direct fetch failed for ${feed.url}`);
                    }
                } catch (directError) {
                    console.error(`Direct fetch also failed for ${feed.name}:`, directError);
                    throw lastError || directError || new Error(`All proxies and direct fetch failed for ${feed.url}`);
                }
            }
            
            const text = responseText;
            
            if (!text || text.trim() === '') {
                throw new Error('Empty response received');
            }
            
            // Check if response is HTML error page instead of RSS/XML
            if (text.includes('<html') && !text.includes('<rss') && !text.includes('<feed')) {
                throw new Error('Received HTML instead of RSS/XML feed');
            }
            
            let articles = [];
            if (feed.type === 'youtube') {
                articles = this.parseYouTubeFeed(text, feed.name, category);
            } else {
                articles = this.parseRSSFeed(text, feed.name, category);
            }
            
            console.log(`Successfully parsed ${articles.length} articles from ${feed.name}`);
            
            // If no articles found, log the feed structure for debugging
            if (articles.length === 0) {
                console.warn(`No articles parsed from ${feed.name}. Response length: ${text.length}`);
                if (text.length < 1000) {
                    console.log('Feed response preview:', text.substring(0, 500));
                }
            }
            
            return articles;
            
        } catch (error) {
            console.error(`Error fetching ${feed.name} (${category}):`, error);
            console.error(`Feed URL: ${feed.url}`);
            return [];
        }
    }

    parseRSSFeed(xmlText, feedName, category) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            // Check for parsing errors
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('XML parsing error: ' + parserError.textContent);
            }
            
            // Try different selectors for different feed formats
            let items = xmlDoc.querySelectorAll('item');
            if (items.length === 0) {
                items = xmlDoc.querySelectorAll('entry');
            }
            if (items.length === 0) {
                items = xmlDoc.querySelectorAll('rss > channel > item');
            }
            
            if (items.length === 0) {
                console.warn(`No items found in feed: ${feedName}`);
                return [];
            }
            
            console.log(`Found ${items.length} items in ${feedName}`);
            
            return Array.from(items).map(item => {
                // Try multiple selectors for title
                let title = item.querySelector('title')?.textContent || '';
                if (!title) {
                    title = item.querySelector('atom\\:title, a\\:title')?.textContent || '';
                }
                
                // Try multiple selectors for link
                let link = item.querySelector('link')?.textContent || 
                          item.querySelector('link')?.getAttribute('href') || '';
                if (!link) {
                    link = item.querySelector('atom\\:link, a\\:link')?.getAttribute('href') || '';
                }
                
                // Debug logging for link extraction
                if (link) {
                    console.log(`Extracted link from ${feedName}:`, link);
                } else {
                    console.warn(`No link found for item in ${feedName}`);
                }
                
                // Try multiple selectors for description
                let description = item.querySelector('description')?.textContent || 
                                item.querySelector('summary')?.textContent || 
                                item.querySelector('content')?.textContent || '';
                if (!description) {
                    description = item.querySelector('atom\\:summary, a\\:summary, atom\\:content, a\\:content')?.textContent || '';
                }
                
                // Try multiple selectors for date
                let pubDate = item.querySelector('pubDate')?.textContent || 
                            item.querySelector('published')?.textContent || 
                            item.querySelector('updated')?.textContent || 
                            item.querySelector('dc\\:date')?.textContent || '';
                if (!pubDate) {
                    pubDate = item.querySelector('atom\\:published, a\\:published, atom\\:updated, a\\:updated')?.textContent || '';
                }
                
                const image = this.extractImageFromRSS(item, description);
                
                return {
                    title: this.cleanText(title),
                    link: link.trim(),
                    description: this.cleanText(description),
                    pubDate: pubDate || new Date().toISOString(),
                    image,
                    feedName,
                    category,
                    type: 'article'
                };
            }).filter(article => {
                // Enhanced validation for articles
                const isValid = article.title && article.link && article.link.trim() !== '';
                if (!isValid) {
                    console.warn(`Filtering out invalid article from ${feedName}:`, {
                        title: article.title,
                        link: article.link,
                        hasTitle: !!article.title,
                        hasLink: !!article.link,
                        linkNotEmpty: article.link && article.link.trim() !== ''
                    });
                }
                return isValid;
            }); // Filter out invalid articles
            
        } catch (error) {
            console.error(`Error parsing RSS feed ${feedName}:`, error);
            return [];
        }
    }

    parseYouTubeFeed(xmlText, feedName, category) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            // Check for parsing errors
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('XML parsing error: ' + parserError.textContent);
            }
            
            const entries = xmlDoc.querySelectorAll('entry');
            
            if (entries.length === 0) {
                console.warn(`No entries found in YouTube feed: ${feedName}`);
                return [];
            }
            
            console.log(`Found ${entries.length} entries in YouTube feed ${feedName}`);
            
            return Array.from(entries).map(entry => {
                const title = entry.querySelector('title')?.textContent || '';
                const link = entry.querySelector('link')?.getAttribute('href') || '';
                
                // Debug logging for YouTube link extraction
                if (link) {
                    console.log(`Extracted YouTube link from ${feedName}:`, link);
                } else {
                    console.warn(`No link found for YouTube entry in ${feedName}`);
                }
                
                // Try different selectors for description
                let description = entry.querySelector('media\\:description')?.textContent || 
                                entry.querySelector('description')?.textContent || 
                                entry.querySelector('summary')?.textContent || '';
                
                const pubDate = entry.querySelector('published')?.textContent || 
                              entry.querySelector('updated')?.textContent || '';
                                  
                const videoId = this.extractYouTubeVideoId(link);
                
                if (!videoId) {
                    console.warn(`Could not extract video ID from: ${link}`);
                    return null;
                }
                
                const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                
                return {
                    title: this.cleanText(title),
                    link,
                    description: this.cleanText(description),
                    pubDate: pubDate || new Date().toISOString(),
                    image: thumbnail,
                    videoId,
                    feedName,
                    category,
                    type: 'video'
                };
            }).filter(entry => {
                // Enhanced validation for YouTube entries
                const isValid = entry !== null && entry.title && entry.videoId && entry.link && entry.link.trim() !== '';
                if (!isValid) {
                    console.warn(`Filtering out invalid YouTube entry from ${feedName}:`, {
                        title: entry?.title,
                        link: entry?.link,
                        videoId: entry?.videoId,
                        hasTitle: !!entry?.title,
                        hasLink: !!entry?.link,
                        hasVideoId: !!entry?.videoId,
                        linkNotEmpty: entry?.link && entry.link.trim() !== ''
                    });
                }
                return isValid;
            }); // Filter out invalid entries
            
        } catch (error) {
            console.error(`Error parsing YouTube feed ${feedName}:`, error);
            return [];
        }
    }

    extractImageFromRSS(item, description) {
        // Try to find image in media:content
        const mediaContent = item.querySelector('media\\:content, media\\:thumbnail');
        if (mediaContent) {
            const imageUrl = mediaContent.getAttribute('url');
            if (imageUrl && imageUrl.trim() !== '') {
                return imageUrl;
            }
        }
        
        // Try to extract from description
        const imgMatch = description.match(/<img[^>]+src="([^"]+)"/);
        if (imgMatch && imgMatch[1] && imgMatch[1].trim() !== '') {
            return imgMatch[1];
        }
        
        // No image available
        return null;
    }

    extractYouTubeVideoId(url) {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        return match ? match[1] : '';
    }

    getDefaultImage(category) {
        const defaultImages = {
            'ai': '/images/ai-default.jpg',
            'cybersecurity': '/images/cyber-default.jpg',
            'robotics': '/images/robotics-default.jpg',
            'space': '/images/space-default.jpg',
            'transportation': '/images/transport-default.jpg',
            'bioengineering': '/images/bio-default.jpg',
            'marketing': '/images/marketing-default.jpg',
            'matrix': '/images/matrix-default.jpg',
            'new tech': '/images/tech-default.jpg',
            'open ai': '/images/openai-default.jpg',
            'phones': '/images/phones-default.jpg',
            'tech reviews': '/images/reviews-default.jpg',
            'hydrogen': '/images/hydrogen-default.jpg',
            'video games': '/images/games-default.jpg',
            'crypto': '/images/crypto-default.jpg',
            'crm tools': '/images/crm-default.jpg',
            'flipper': '/images/flipper-default.jpg',
            'matrix future': '/images/future-default.jpg',
            'trends': '/images/trends-default.jpg'
        };
        return defaultImages[category.toLowerCase()] || '/images/default-news.jpg';
    }

    cleanText(text) {
        return text.replace(/<[^>]*>/g, '').trim();
    }

    filterArticles(searchTerm = '') {
        console.log(`filterArticles called with searchTerm: "${searchTerm}", currentCategory: "${this.currentCategory}", total articles: ${this.allArticles.length}`);
        
        // Ensure we have articles to filter
        if (!this.allArticles || this.allArticles.length === 0) {
            console.log('No articles available to filter');
            this.filteredArticles = [];
            return;
        }
        
        // Start with static articles (already loaded and stable)
        let articlesToFilter = [...this.staticArticles];
        
        // Add new articles that aren't in static articles
        const staticArticleKeys = new Set(this.staticArticles.map(article => 
            `${article.title.toLowerCase().trim()}-${article.link}`
        ));
        
        const newArticles = this.allArticles.filter(article => {
            if (!article || !article.title || !article.link) return false;
            const articleKey = `${article.title.toLowerCase().trim()}-${article.link}`;
            return !staticArticleKeys.has(articleKey);
        });
        
        articlesToFilter.push(...newArticles);
        
        this.filteredArticles = articlesToFilter.filter(article => {
            // Ensure article has required properties
            if (!article || !article.title || !article.category) {
                return false;
            }
            
            const matchesCategory = this.currentCategory === 'all' || article.category === this.currentCategory;
            const matchesDate = this.matchesDateFilter(article.pubDate);
            const matchesSearch = !searchTerm || 
                (article.title && article.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (article.description && article.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (article.feedName && article.feedName.toLowerCase().includes(searchTerm.toLowerCase()));
            
            return matchesCategory && matchesDate && matchesSearch;
        });
        
        // Sort articles by date (newest first)
        this.filteredArticles.sort((a, b) => {
            const dateA = new Date(a.pubDate || new Date());
            const dateB = new Date(b.pubDate || new Date());
            return dateB - dateA;
        });
        
        console.log(`filterArticles completed: ${this.filteredArticles.length} articles (${this.staticArticles.length} static, ${newArticles.length} new)`);
    }

    matchesDateFilter(pubDate) {
        if (this.currentDateFilter === 'all') return true;
        
        const articleDate = new Date(pubDate);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (this.currentDateFilter) {
            case 'today':
                const articleDay = new Date(articleDate.getFullYear(), articleDate.getMonth(), articleDate.getDate());
                return articleDay.getTime() === today.getTime();
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const articleYesterday = new Date(articleDate.getFullYear(), articleDate.getMonth(), articleDate.getDate());
                return articleYesterday.getTime() === yesterday.getTime();
            case 'this-week':
                const weekStart = new Date(today);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                return articleDate >= weekStart;
            case 'this-month':
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                return articleDate >= monthStart;
            case 'last-week':
                const lastWeekStart = new Date(today);
                lastWeekStart.setDate(lastWeekStart.getDate() - lastWeekStart.getDay() - 7);
                const lastWeekEnd = new Date(today);
                lastWeekEnd.setDate(lastWeekEnd.getDate() - lastWeekEnd.getDay());
                return articleDate >= lastWeekStart && articleDate < lastWeekEnd;
            case 'last-month':
                const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
                return articleDate >= lastMonthStart && articleDate < lastMonthEnd;
            default:
                return true;
        }
    }

    getDateFilterLabel(filter) {
        const labels = {
            'all': 'All Time',
            'today': 'Today',
            'yesterday': 'Yesterday',
            'this-week': 'This Week',
            'this-month': 'This Month',
            'last-week': 'Last Week',
            'last-month': 'Last Month'
        };
        return labels[filter] || filter;
    }

    getArticlesByDateGroup() {
        const groups = {};
        
        this.filteredArticles.forEach(article => {
            const date = new Date(article.pubDate);
            const dateKey = date.toDateString();
            
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(article);
        });
        
        // Sort groups by date (newest first)
        return Object.entries(groups)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});
    }

    getDateStatistics() {
        // Filter articles by current category if not "all"
        const articlesToAnalyze = this.currentCategory === 'all' 
            ? this.allArticles 
            : this.allArticles.filter(article => article.category === this.currentCategory);

        // Debug logging
        console.log(`getDateStatistics: Analyzing ${articlesToAnalyze.length} articles for category "${this.currentCategory}" (total articles: ${this.allArticles.length})`);

        const stats = {
            total: articlesToAnalyze.length,
            today: 0,
            yesterday: 0,
            thisWeek: 0,
            thisMonth: 0,
            lastWeek: 0,
            lastMonth: 0
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        articlesToAnalyze.forEach(article => {
            const articleDate = new Date(article.pubDate);
            const articleDay = new Date(articleDate.getFullYear(), articleDate.getMonth(), articleDate.getDate());
            
            // Today
            if (articleDay.getTime() === today.getTime()) {
                stats.today++;
            }
            
            // Yesterday
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            if (articleDay.getTime() === yesterday.getTime()) {
                stats.yesterday++;
            }
            
            // This week
            const weekStart = new Date(today);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            if (articleDate >= weekStart) {
                stats.thisWeek++;
            }
            
            // This month
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            if (articleDate >= monthStart) {
                stats.thisMonth++;
            }
            
            // Last week
            const lastWeekStart = new Date(today);
            lastWeekStart.setDate(lastWeekStart.getDate() - lastWeekStart.getDay() - 7);
            const lastWeekEnd = new Date(today);
            lastWeekEnd.setDate(lastWeekEnd.getDate() - lastWeekEnd.getDay());
            if (articleDate >= lastWeekStart && articleDate < lastWeekEnd) {
                stats.lastWeek++;
            }
            
            // Last month
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
            if (articleDate >= lastMonthStart && articleDate < lastMonthEnd) {
                stats.lastMonth++;
            }
        });

        return stats;
    }

    renderNews() {
        console.log('renderNews called');
        const container = document.getElementById('news-container');
        if (!container) {
            console.error('News container not found in renderNews');
            return;
        }
        console.log('Container found, filtered articles:', this.filteredArticles.length);
        console.log('Container current content:', container.innerHTML);
        console.log('Container classes:', container.className);

        if (this.currentPage === 1) {
            container.innerHTML = '';
            
            // Show loading state for categories that don't have articles yet
            if (this.currentCategory !== 'all' && this.filteredArticles.length === 0) {
                const categoryArticles = this.allArticles.filter(article => article.category === this.currentCategory);
                if (categoryArticles.length === 0 && this.isLoading) {
                    container.innerHTML = `
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Loading ${this.currentCategory} articles...</p>
                        </div>
                    `;
                    return;
                }
            }
        }

        // Get articles grouped by date
        const dateGroups = this.getArticlesByDateGroup();
        const dateKeys = Object.keys(dateGroups);
        
        // Calculate pagination for date groups
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        
        let articleCount = 0;
        let renderedGroups = 0;
        
        for (const dateKey of dateKeys) {
            const articles = dateGroups[dateKey];
            
            // Check if we should render this group
            if (articleCount >= endIndex) break;
            
            if (articleCount + articles.length > startIndex) {
                // Create date header
                const dateHeader = this.createDateHeader(dateKey);
                container.appendChild(dateHeader);
                
                // Render articles in this group
                articles.forEach(article => {
                    if (articleCount >= startIndex && articleCount < endIndex) {
                        const articleElement = this.createArticleElement(article);
                        container.appendChild(articleElement);
                    }
                    articleCount++;
                });
                
                renderedGroups++;
            } else {
                articleCount += articles.length;
            }
        }

        this.updateLoadMoreButton();
        this.updateArticleCount();
        
        console.log('renderNews completed');
        console.log('Final container content length:', container.innerHTML.length);
        console.log('Final container has content:', container.innerHTML.trim() !== '');
    }

    createDateHeader(dateKey) {
        const dateHeader = document.createElement('div');
        dateHeader.className = 'date-group-header';
        
        const date = new Date(dateKey);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let dateLabel;
        if (date.toDateString() === today.toDateString()) {
            dateLabel = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            dateLabel = 'Yesterday';
        } else {
            dateLabel = date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
        
        dateHeader.innerHTML = `
            <div class="date-divider">
                <span class="date-label">${dateLabel}</span>
                <span class="date-count">${this.getArticlesByDateGroup()[dateKey].length} articles</span>
            </div>
        `;
        
        return dateHeader;
    }

    createArticleElement(article) {
        const articleDiv = document.createElement('div');
        articleDiv.className = 'news-card';
        articleDiv.setAttribute('data-category', article.category);
        
        // Validate and clean the article link
        let cleanLink = article.link || '';
        if (cleanLink && !cleanLink.startsWith('http://') && !cleanLink.startsWith('https://')) {
            console.warn(`Invalid URL format for article "${article.title}":`, cleanLink);
            cleanLink = ''; // Set to empty if invalid
        }
        
        // Debug logging for article creation
        console.log(`Creating article element for: "${article.title}"`, {
            originalLink: article.link,
            cleanLink: cleanLink,
            category: article.category,
            type: article.type
        });

        const pubDate = new Date(article.pubDate);
        const date = pubDate.toLocaleDateString();
        const time = pubDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timeAgo = this.getTimeAgo(pubDate);
        const hasImage = article.image && article.image !== null && article.image !== '';

        if (article.type === 'video') {
            articleDiv.innerHTML = `
                <div class="news-image">
                    <img src="${article.image}" alt="${article.title}" loading="lazy">
                    <div class="news-category">${article.category}</div>
                    <div class="video-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="news-content">
                    <h3>${article.title}</h3>
                    <p>${article.description.substring(0, 150)}...</p>
                    <div class="news-meta">
                        <span class="news-date">${date}</span>
                        <span class="news-time">${time}</span>
                        <span class="news-source">${article.feedName}</span>
                        <span class="news-time-ago">${timeAgo}</span>
                    </div>
                    <div class="news-actions">
                        <button class="btn btn-primary watch-video" data-video-id="${article.videoId}">
                            <i class="fas fa-play"></i> Watch Video
                        </button>
                        <a href="${encodeURI(cleanLink)}" target="_blank" class="btn btn-secondary" onclick="console.log('Opening video source:', '${cleanLink}')" ${!cleanLink ? 'style="display: none;"' : ''}>
                            <i class="fas fa-external-link-alt"></i> View Source
                        </a>
                        <button class="btn btn-secondary btn-share" onclick="shareArticle('${encodeURIComponent(article.title)}', '${encodeURIComponent(article.link)}')">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        } else {
            articleDiv.innerHTML = `
                ${hasImage ? `
                    <div class="news-image">
                        <img src="${article.image}" alt="${article.title}" loading="lazy">
                        <div class="news-category">${article.category}</div>
                    </div>
                ` : ''}
                <div class="news-content ${!hasImage ? 'no-image' : ''}">
                    <h3>${article.title}</h3>
                    <p>${article.description.substring(0, 200)}...</p>
                    <div class="news-meta">
                        <span class="news-date">${date}</span>
                        <span class="news-time">${time}</span>
                        <span class="news-source">${article.feedName}</span>
                        <span class="news-time-ago">${timeAgo}</span>
                    </div>
                    <div class="news-actions">
                        <a href="${encodeURI(cleanLink)}" target="_blank" class="btn btn-primary" onclick="console.log('Opening article link:', '${cleanLink}')" ${!cleanLink ? 'style="display: none;"' : ''}>
                            <i class="fas fa-external-link-alt"></i> Read More
                        </a>
                        <button class="btn btn-secondary btn-share" onclick="shareArticle('${encodeURIComponent(article.title)}', '${encodeURIComponent(article.link)}')">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        // Add video player functionality
        const watchBtn = articleDiv.querySelector('.watch-video');
        if (watchBtn) {
            watchBtn.addEventListener('click', () => {
                this.openVideoModal(article.videoId, article.title);
            });
        }

        return articleDiv;
    }

    openVideoModal(videoId, title) {
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-content">
                <div class="video-modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="video-container">
                    <iframe src="https://www.youtube.com/embed/${videoId}" 
                            frameborder="0" 
                            allowfullscreen>
                    </iframe>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    }

    loadMoreArticles() {
        console.log('Load more articles clicked, current page:', this.currentPage);
        this.currentPage++;
        this.renderNews();
        
        // Show feedback to user
        const totalPages = Math.ceil(this.filteredArticles.length / this.itemsPerPage);
        showNotification(`Loading page ${this.currentPage} of ${totalPages}`, 'info');
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('load-more-news');
        if (loadMoreBtn) {
            const hasMore = this.filteredArticles.length > this.currentPage * this.itemsPerPage;
            const showing = Math.min(this.currentPage * this.itemsPerPage, this.filteredArticles.length);
            const total = this.filteredArticles.length;
            
            if (hasMore) {
                loadMoreBtn.style.display = 'block';
                loadMoreBtn.innerHTML = `Load More Articles (${showing}/${total})`;
            } else {
                if (total > this.itemsPerPage) {
                    loadMoreBtn.style.display = 'block';
                    loadMoreBtn.innerHTML = `All ${total} Articles Loaded`;
                    loadMoreBtn.disabled = true;
                    loadMoreBtn.style.opacity = '0.6';
                    loadMoreBtn.style.cursor = 'not-allowed';
                } else {
                    loadMoreBtn.style.display = 'none';
                }
            }
        }
    }

    resetLoadMoreButton() {
        const loadMoreBtn = document.getElementById('load-more-news');
        if (loadMoreBtn) {
            loadMoreBtn.disabled = false;
            loadMoreBtn.style.opacity = '1';
            loadMoreBtn.style.cursor = 'pointer';
            loadMoreBtn.innerHTML = 'Load More Articles';
        }
    }

    updateArticleCount() {
        const countElement = document.getElementById('article-count');
        if (countElement) {
            countElement.textContent = this.filteredArticles.length;
        }
        
        // Update total feeds count
        const totalFeedsElement = document.getElementById('total-feeds');
        if (totalFeedsElement) {
            let totalFeeds = 0;
            for (const [category, feeds] of Object.entries(this.feeds)) {
                totalFeeds += feeds.length;
            }
            totalFeedsElement.textContent = totalFeeds;
        }

        // Update date filter counts
        this.updateDateFilterCounts();
    }

    updateDateFilterCounts() {
        const stats = this.getDateStatistics();
        
        // Debug logging
        console.log(`Updating date filter counts for category: ${this.currentCategory}`);
        console.log('Date statistics:', stats);
        
        const countElements = {
            'today-count': stats.today,
            'yesterday-count': stats.yesterday,
            'this-week-count': stats.thisWeek,
            'this-month-count': stats.thisMonth,
            'last-week-count': stats.lastWeek,
            'last-month-count': stats.lastMonth
        };

        Object.entries(countElements).forEach(([id, count]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = count;
                console.log(`Updated ${id}: ${count}`);
            }
        });
    }

    updateActiveFilter() {
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-category="${this.currentCategory}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    updateActiveDateFilter() {
        document.querySelectorAll('.date-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-date-filter="${this.currentDateFilter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }


    
    updateCategoryLoadingState(category, isLoading) {
        const categoryButton = document.querySelector(`[data-category="${category}"]`);
        if (categoryButton) {
            if (isLoading) {
                categoryButton.classList.add('loading');
                this.loadingCategories.add(category);
                // Add visual loading indicator but don't disable the button
                categoryButton.style.opacity = '0.7';
                categoryButton.style.pointerEvents = 'auto'; // Keep it clickable
            } else {
                categoryButton.classList.remove('loading');
                this.loadingCategories.delete(category);
                categoryButton.style.opacity = '1';
            }
        }
    }
    
    updateAllCategoryLoadingStates(isLoading) {
        const categoryButtons = document.querySelectorAll('.category-filter');
        categoryButtons.forEach(button => {
            const category = button.dataset.category;
            if (isLoading) {
                button.classList.add('loading');
                this.loadingCategories.add(category);
                // Add visual loading indicator but don't disable the button
                button.style.opacity = '0.7';
                button.style.pointerEvents = 'auto'; // Keep it clickable
            } else {
                button.classList.remove('loading');
                this.loadingCategories.delete(category);
                button.style.opacity = '1';
            }
        });
    }
    
    showLoadingBanner() {
        const loadingBanner = document.getElementById('loading-banner');
        if (loadingBanner) {
            loadingBanner.classList.remove('hidden');
        }
    }
    
    hideLoadingBanner() {
        const loadingBanner = document.getElementById('loading-banner');
        if (loadingBanner) {
            loadingBanner.classList.add('hidden');
        }
    }

    handleURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        
        if (categoryParam && this.feeds[categoryParam]) {
            // Set the current category
            this.currentCategory = categoryParam;
            
            // Update the active filter button
            this.updateActiveFilter();
            
            // Filter and render articles
            this.filterArticles();
            this.renderNews();
            
            // Scroll to the news section if it exists
            const newsSection = document.querySelector('.news-listing');
            if (newsSection) {
                newsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
}

// Share functionality
function shareArticle(title, link) {
    const decodedTitle = decodeURIComponent(title);
    const decodedLink = decodeURIComponent(link);
    
    if (navigator.share) {
        // Use native sharing if available
        navigator.share({
            title: decodedTitle,
            url: decodedLink
        }).catch(err => {
            console.log('Error sharing:', err);
            fallbackShare(decodedTitle, decodedLink);
        });
    } else {
        // Fallback for browsers without native sharing
        fallbackShare(decodedTitle, decodedLink);
    }
}

function fallbackShare(title, link) {
    // Create a temporary input to copy the link
    const tempInput = document.createElement('input');
    tempInput.value = link;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        // Show a simple notification
        showNotification('Link copied to clipboard!', 'success');
    } catch (err) {
        console.log('Failed to copy:', err);
        // Fallback: open in new window
        window.open(link, '_blank');
    }
    
    document.body.removeChild(tempInput);
}

function showNotification(message, type = 'info') {
    // Create a notification with better styling and types
    const notification = document.createElement('div');
    let bgColor = 'var(--accent-primary)';
    let icon = 'fas fa-info-circle';
    
    switch (type) {
        case 'success':
            bgColor = '#00aa00';
            icon = 'fas fa-check-circle';
            break;
        case 'error':
            bgColor = '#ff4444';
            icon = 'fas fa-exclamation-triangle';
            break;
        case 'warning':
            bgColor = '#ffaa00';
            icon = 'fas fa-exclamation-circle';
            break;
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        font-family: var(--font-primary);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 350px;
        word-wrap: break-word;
    `;
    
    notification.innerHTML = `<i class="${icon}"></i> ${message}`;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after duration based on message length
    const duration = Math.max(3000, message.length * 50);
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Initialize the news feed aggregator when DOM is loaded
let newsAggregator;

// Global click handler for debugging link issues
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.href) {
        console.log('Link clicked:', {
            href: e.target.href,
            text: e.target.textContent,
            target: e.target.target,
            category: e.target.closest('.news-card')?.dataset.category
        });
        
        // Check if the link is valid
        try {
            new URL(e.target.href);
        } catch (error) {
            console.error('Invalid URL clicked:', e.target.href, error);
            e.preventDefault();
            alert('Invalid URL: ' + e.target.href);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Checking for news container...');
    const newsContainer = document.getElementById('news-container');
    console.log('News container found:', newsContainer);
    
    if (newsContainer) {
        console.log('News container content:', newsContainer.innerHTML);
        console.log('News container classes:', newsContainer.className);
        console.log('News container style:', newsContainer.style.cssText);
        
        try {
            console.log('Initializing EnhancedNewsFeedAggregator...');
            newsAggregator = new EnhancedNewsFeedAggregator();
            console.log('News aggregator initialized successfully');
        } catch (error) {
            console.error('Error initializing news aggregator:', error);
            console.error('Error stack:', error.stack);
        }
    } else {
        console.error('News container not found!');
        console.log('Available elements with "news" in ID:', 
            Array.from(document.querySelectorAll('[id*="news"]')).map(el => el.id));
    }
}); 
}); 