// Simple Chatbot Implementation with NurmoAI
console.log('Simple chatbot script loaded');

// Create chatbot button immediately
function createSimpleChatbot() {
    console.log('Creating simple chatbot...');
    
    // API Configuration - SECURITY FIX: Removed hardcoded API key
    // API key should be stored securely on the server and accessed via authenticated endpoints
    const API_URL = 'https://api.nurmo.app/v1/chat/completions';
    const CHARACTER_ID = '43413d25-073c-4f3d-8cf1-f1c98cfa00b3';
    let apiStatus = 'unknown'; // 'working', 'failed', 'unknown'
    let API_KEY = null; // Will be fetched securely
    
    // Secure API key retrieval function
    async function getSecureApiKey() {
        try {
            // SECURITY: This should fetch the API key from a secure server endpoint
            // that requires authentication and doesn't expose the key to client-side code
            const response = await fetch('/api/secure/chatbot-token', {
                method: 'GET',
                credentials: 'include', // Include session cookies for authentication
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to get secure API key');
            }
            
            const data = await response.json();
            return data.token;
        } catch (error) {
            console.error('Failed to get secure API key:', error);
            return null;
        }
    }
    
    // Create button
    const button = document.createElement('div');
    button.innerHTML = '💬 Chat';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2563eb;
        color: white;
        padding: 15px 20px;
        border-radius: 50px;
        cursor: pointer;
        z-index: 9999;
        font-weight: bold;
        box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3);
        transition: all 0.3s ease;
    `;
    
    // Create chat interface
    const chatInterface = document.createElement('div');
    chatInterface.innerHTML = `
        <div style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 400px;
            height: 500px;
            background: #000;
            border: 1px solid #333;
            border-radius: 12px;
            z-index: 10000;
            display: none;
            flex-direction: column;
        ">
            <div style="
                background: #2563eb;
                color: white;
                padding: 15px 20px;
                border-radius: 12px 12px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <span style="font-weight: bold;">🤖 A.Insiders AI Assistant</span>
                <button id="close-chat" style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                ">×</button>
            </div>
            <div id="chat-messages" style="
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                color: white;
            ">
                <div style="margin-bottom: 15px;">
                    <strong>AI Assistant:</strong> Hello! I'm your AI assistant from A.Insiders. How can I help you with AI and cybersecurity questions today?
                </div>
            </div>
            <div style="
                padding: 20px;
                border-top: 1px solid #333;
                display: flex;
                gap: 10px;
            ">
                <input type="text" id="chat-input" placeholder="Type your message..." style="
                    flex: 1;
                    padding: 10px;
                    background: #111;
                    border: 1px solid #333;
                    border-radius: 8px;
                    color: white;
                ">
                <button id="send-message" style="
                    padding: 10px 15px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                ">Send</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(button);
    document.body.appendChild(chatInterface);
    
    const chatDiv = chatInterface.querySelector('div');
    const messagesDiv = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-message');
    const closeBtn = document.getElementById('close-chat');
    
    // Event listeners
    button.addEventListener('click', () => {
        chatDiv.style.display = 'flex';
        button.style.display = 'none';
        input.focus();
    });
    
    closeBtn.addEventListener('click', () => {
        chatDiv.style.display = 'none';
        button.style.display = 'block';
    });
    
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.style.marginBottom = '15px';
        messageDiv.innerHTML = `<strong>${isUser ? 'You' : 'AI Assistant'}:</strong> ${text}`;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    async function sendMessage() {
        const message = input.value.trim();
        if (!message) return;
        
        addMessage(message, true);
        input.value = '';
        
        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.innerHTML = '<em>AI is typing...</em>';
        typingDiv.style.marginBottom = '15px';
        messagesDiv.appendChild(typingDiv);
        
        try {
            console.log('Sending message to NurmoAI:', message);
            
            // Get API key securely if we don't have one
            if (!API_KEY) {
                API_KEY = await getSecureApiKey();
                if (!API_KEY) {
                    messagesDiv.removeChild(typingDiv);
                    addMessage('Sorry, I cannot connect to the AI service. Authentication failed. Please try again later.', false);
                    return;
                }
            }

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'user', content: message }
                    ],
                    model: 'nurmo-3',
                    character: CHARACTER_ID
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                
                let errorMessage = 'Sorry, I encountered an error. Please try again.';
                
                if (response.status === 403) {
                    apiStatus = 'failed';
                    errorMessage = 'Sorry, there\'s an issue with the AI service authentication. The API key may be invalid or expired. Please contact support to resolve this issue.';
                } else if (response.status === 429) {
                    errorMessage = 'The AI service is currently busy. Please try again in a moment.';
                } else if (response.status === 401) {
                    errorMessage = 'The AI service authentication failed. Please check your account settings.';
                } else if (response.status === 404) {
                    errorMessage = 'The AI service is currently unavailable. Please try again later.';
                } else {
                    errorMessage = `API request failed: ${response.status} - ${errorText}`;
                }
                
                messagesDiv.removeChild(typingDiv);
                addMessage(errorMessage, false);
                return;
            }
            
            apiStatus = 'working';
            const data = await response.json();
            console.log('API Response:', data);
            
            let aiResponse;
            if (data.choices && data.choices[0] && data.choices[0].message) {
                aiResponse = data.choices[0].message.content;
            } else if (data.content) {
                aiResponse = data.content;
            } else if (data.message) {
                aiResponse = data.message;
            } else {
                aiResponse = 'I received a response but couldn\'t parse it properly.';
            }
            
            messagesDiv.removeChild(typingDiv);
            addMessage(aiResponse, false);
        } catch (error) {
            console.error('Chatbot API error:', error);
            messagesDiv.removeChild(typingDiv);
            
            let errorMessage = 'Sorry, I encountered an error. Please try again.';
            
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = 'Unable to connect to the AI service. Please check your internet connection and try again.';
            } else if (error.message.includes('authentication failed')) {
                errorMessage = 'Sorry, there\'s an issue with the AI service authentication. Please contact support to resolve this issue.';
            } else {
                errorMessage = 'Sorry, I\'m having trouble connecting to the AI service right now. Please try again later or contact support if the issue persists.';
            }
            
            addMessage(errorMessage, false);
        }
    }
    
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    console.log('Simple chatbot created successfully');
}

// Initialize immediately
createSimpleChatbot();

// Also try on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, chatbot should be visible');
}); 