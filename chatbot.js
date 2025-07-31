// A.Insiders Chatbot with NurmoAI
class Chatbot {
    constructor() {
        this.apiKey = 'nu-bVI8A2TPpxfwfxPP4oKrkvq5mlgwj8efUcQHstcoE8Knvs4M';
        this.apiUrl = 'https://api.nurmo.app/v1/chat/completions';
        this.characterId = '43413d25-073c-4f3d-8cf1-f1c98cfa00b3';
        this.isOpen = false;
        this.isMobile = window.innerWidth <= 768;
        this.messages = [];
        this.apiStatus = 'unknown'; // 'working', 'failed', 'unknown'
        
        this.init();
    }

    init() {
        console.log('Initializing chatbot components...');
        this.createChatbotButton();
        this.createChatbotInterface();
        this.setupEventListeners();
        this.addWelcomeMessage();
        console.log('Chatbot initialization complete');
    }

    createChatbotButton() {
        console.log('Creating chatbot button...');
        const button = document.createElement('div');
        button.className = 'chatbot-button';
        button.innerHTML = `
            <i class="fas fa-comments"></i>
            <span class="chatbot-button-text">Chat with AI</span>
        `;
        document.body.appendChild(button);
        console.log('Chatbot button created and added to DOM');
    }

    createChatbotInterface() {
        const interface = document.createElement('div');
        interface.className = 'chatbot-interface';
        interface.innerHTML = `
            <div class="chatbot-header">
                <div class="chatbot-title">
                    <i class="fas fa-robot"></i>
                    <span>A.Insiders AI Assistant</span>
                </div>
                <button class="chatbot-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="chatbot-messages" id="chatbot-messages">
                <!-- Messages will be added here -->
            </div>
            <div class="chatbot-input-container">
                <div class="chatbot-input-wrapper">
                    <textarea 
                        id="chatbot-input" 
                        placeholder="Ask me about AI, cybersecurity, or any tech topic..."
                        rows="1"
                    ></textarea>
                    <button class="chatbot-send" id="chatbot-send">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(interface);
    }

    setupEventListeners() {
        // Toggle chatbot
        const button = document.querySelector('.chatbot-button');
        const closeBtn = document.querySelector('.chatbot-close');
        
        button.addEventListener('click', () => this.toggleChatbot());
        closeBtn.addEventListener('click', () => this.closeChatbot());

        // Send message
        const sendBtn = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');
        
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeChatbot();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
            if (this.isOpen) {
                this.updateChatbotPosition();
            }
        });
    }

    addWelcomeMessage() {
        const welcomeMessage = {
            type: 'bot',
            content: `Hello! I'm your AI assistant from A.Insiders. I can help you with questions about:

🤖 **AI & Machine Learning**
🔒 **Cybersecurity**
🚀 **Emerging Technologies**
📱 **Tech Reviews**
🌌 **Space & Robotics**

What would you like to know about today?`,
            timestamp: new Date()
        };
        this.addMessage(welcomeMessage);
    }

    toggleChatbot() {
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }

    openChatbot() {
        this.isOpen = true;
        document.querySelector('.chatbot-interface').classList.add('open');
        document.querySelector('.chatbot-button').classList.add('hidden');
        this.updateChatbotPosition();
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('chatbot-input').focus();
        }, 300);
    }

    closeChatbot() {
        this.isOpen = false;
        document.querySelector('.chatbot-interface').classList.remove('open');
        document.querySelector('.chatbot-button').classList.remove('hidden');
    }

    updateChatbotPosition() {
        const interface = document.querySelector('.chatbot-interface');
        if (this.isMobile) {
            interface.style.width = '100vw';
            interface.style.height = '100vh';
            interface.style.bottom = '0';
            interface.style.right = '0';
            interface.style.borderRadius = '0';
        } else {
            interface.style.width = '400px';
            interface.style.height = '600px';
            interface.style.bottom = '20px';
            interface.style.right = '20px';
            interface.style.borderRadius = '12px';
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        const userMessage = {
            type: 'user',
            content: message,
            timestamp: new Date()
        };
        this.addMessage(userMessage);

        // Clear input
        input.value = '';
        input.style.height = 'auto';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.callNurmonicAPI(message);
            this.hideTypingIndicator();
            
            // Add bot response
            const botMessage = {
                type: 'bot',
                content: response,
                timestamp: new Date()
            };
            this.addMessage(botMessage);

        } catch (error) {
            this.hideTypingIndicator();
            console.error('Chatbot API error:', error);
            
            const errorMessage = {
                type: 'bot',
                content: 'Sorry, I encountered an error while processing your request. Please try again in a moment.',
                timestamp: new Date()
            };
            this.addMessage(errorMessage);
        }
    }

    async callNurmonicAPI(message) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'user', content: message }
                    ],
                    model: 'nurmo-3',
                    character: this.characterId
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                
                if (response.status === 403) {
                    this.apiStatus = 'failed';
                    throw new Error('API key authentication failed. Please check your NurmoAI account.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                } else if (response.status === 401) {
                    throw new Error('Unauthorized. Please check your API key.');
                } else if (response.status === 404) {
                    throw new Error('API endpoint not found. Please check the service status.');
                } else {
                    throw new Error(`API request failed: ${response.status} - ${errorText}`);
                }
            }

            this.apiStatus = 'working';
            const data = await response.json();
            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('Chatbot API error:', error);
            
            // Provide user-friendly error messages
            if (error.message.includes('authentication failed')) {
                return 'Sorry, there\'s an issue with the AI service authentication. The API key may be invalid or expired. Please contact support to resolve this issue.';
            } else if (error.message.includes('Rate limit')) {
                return 'The AI service is currently busy. Please try again in a moment.';
            } else if (error.message.includes('Unauthorized')) {
                return 'The AI service authentication failed. Please check your account settings.';
            } else if (error.message.includes('not found')) {
                return 'The AI service is currently unavailable. Please try again later.';
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                return 'Unable to connect to the AI service. Please check your internet connection and try again.';
            } else {
                return 'Sorry, I\'m having trouble connecting to the AI service right now. Please try again later or contact support if the issue persists.';
            }
        }
    }

    addMessage(message) {
        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${message.type}-message`;
        
        const time = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${this.formatMessage(message.content)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
    }

    formatMessage(content) {
        // Convert markdown-style formatting to HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing chatbot...');
    try {
        window.chatbot = new Chatbot();
        console.log('Chatbot initialized successfully');
    } catch (error) {
        console.error('Error initializing chatbot:', error);
    }
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already loaded, initialize immediately
    console.log('DOM already loaded, initializing chatbot immediately...');
    try {
        window.chatbot = new Chatbot();
        console.log('Chatbot initialized successfully (immediate)');
    } catch (error) {
        console.error('Error initializing chatbot (immediate):', error);
    }
} 