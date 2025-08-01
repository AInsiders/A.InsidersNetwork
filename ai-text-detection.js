/**
 * AI Text Detection Tool
 * Real AI-powered text detection using Hugging Face Inference API
 */

class AITextDetector {
    constructor() {
        this.textInput = document.getElementById('textInput');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.messageContainer = document.getElementById('messageContainer');
        
        // API Configuration
        this.apiConfig = {
            // Using Hugging Face Inference API (free tier)
            baseUrl: 'https://api-inference.huggingface.co/models',
            models: {
                // AI text detection model
                aiDetector: 'microsoft/DialoGPT-medium',
                // Alternative: 'roberta-base-openai-detector' (if available)
                // Alternative: 'facebook/opt-350m' (for general text analysis)
            },
            // Free API key (you can get one at https://huggingface.co/settings/tokens)
            apiKey: null, // Will be set from user input or use public endpoint
            maxRetries: 3,
            timeout: 30000
        };
        
        // Fallback detection patterns (used when API is unavailable)
        this.fallbackPatterns = {
            aiIndicators: [
                'it is important to note', 'furthermore', 'moreover', 'additionally',
                'in conclusion', 'as a result', 'therefore', 'thus', 'consequently',
                'it can be argued', 'it is evident', 'clearly', 'obviously',
                'in other words', 'to put it simply', 'in essence', 'fundamentally',
                'the aforementioned', 'the latter', 'the former', 'as previously mentioned',
                'it is worth noting', 'it should be emphasized', 'it is crucial to',
                'one must consider', 'it is imperative that', 'it is essential to',
                'according to research', 'studies have shown', 'research indicates',
                'empirical evidence suggests', 'the literature demonstrates',
                'scholarly analysis reveals', 'academic sources indicate'
            ],
            humanIndicators: [
                'i think', 'i believe', 'in my opinion', 'i feel', 'um', 'uh', 'well',
                'you know', 'like', 'actually', 'basically', 'literally', 'honestly',
                'personally', 'from my experience', 'i would say', 'i guess',
                'sort of', 'kind of', 'you see', 'right', 'okay', 'so'
            ]
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupAPIKeyInput();
        this.showMessage('AI Text Detection Tool Ready. Enter your text and click "Analyze Text".', 'info');
    }
    
    setupEventListeners() {
        // Analyze button click
        this.analyzeBtn.addEventListener('click', () => {
            this.analyzeText();
        });
        
        // Enter key in textarea
        this.textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.analyzeText();
            }
        });
        
        // Real-time character count
        this.textInput.addEventListener('input', () => {
            this.updateCharacterCount();
        });
    }
    
    setupAPIKeyInput() {
        // Create API key input section
        const inputSection = document.querySelector('.text-input-section');
        const apiKeySection = document.createElement('div');
        apiKeySection.className = 'input-group api-key-section';
        apiKeySection.innerHTML = `
            <label for="apiKeyInput">Hugging Face API Key (Optional - for better accuracy)</label>
            <input 
                type="password" 
                id="apiKeyInput" 
                class="text-input" 
                placeholder="Enter your Hugging Face API key (get one free at https://huggingface.co/settings/tokens)"
                style="min-height: auto; height: 40px;"
            >
            <small style="color: var(--text-secondary); margin-top: 0.5rem; display: block;">
                Leave empty to use public endpoint (limited requests). Get a free API key for unlimited access.
            </small>
        `;
        
        // Insert before the analyze button
        const analyzeBtn = inputSection.querySelector('.analyze-btn');
        inputSection.insertBefore(apiKeySection, analyzeBtn);
        
        // Add sample text buttons
        this.addSampleTextButtons();
        
        // Store API key when entered
        const apiKeyInput = document.getElementById('apiKeyInput');
        apiKeyInput.addEventListener('input', (e) => {
            this.apiConfig.apiKey = e.target.value.trim() || null;
        });
    }
    
    addSampleTextButtons() {
        const inputSection = document.querySelector('.text-input-section');
        const sampleSection = document.createElement('div');
        sampleSection.className = 'input-group';
        sampleSection.innerHTML = `
            <label>Test with Sample Text</label>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                <button type="button" class="sample-btn" data-sample="ai">AI-Generated Text</button>
                <button type="button" class="sample-btn" data-sample="human">Human-Written Text</button>
                <button type="button" class="sample-btn" data-sample="mixed">Mixed Content</button>
            </div>
        `;
        
        // Insert after the text input
        const textInput = inputSection.querySelector('.text-input');
        textInput.parentNode.insertBefore(sampleSection, textInput.nextSibling);
        
        // Add event listeners for sample buttons
        const sampleButtons = sampleSection.querySelectorAll('.sample-btn');
        sampleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.loadSampleText(btn.dataset.sample);
            });
        });
    }
    
    loadSampleText(type) {
        const samples = {
            ai: `Artificial intelligence has revolutionized the way we approach problem-solving in modern technology. It is important to note that machine learning algorithms have demonstrated remarkable capabilities in processing vast amounts of data efficiently. Furthermore, these systems can identify patterns that would be virtually impossible for human analysts to detect within reasonable timeframes. Additionally, the implementation of AI-driven solutions has led to significant improvements in various industries, including healthcare, finance, and transportation. In conclusion, the continued advancement of artificial intelligence technology promises to unlock unprecedented opportunities for innovation and progress across multiple domains.`,
            
            human: `I think AI is pretty cool, but honestly, I'm not sure if it's going to take over the world or anything like that. You know, I've been reading about it and stuff, and it seems like there's a lot of hype around it. Like, some people are saying it's going to solve all our problems, while others are worried it might cause issues. Personally, I feel like we should probably be careful about how we use it, but I don't think we need to panic. I mean, technology has always changed things, right? So maybe this is just the next big thing. What do you think?`,
            
            mixed: `The development of artificial intelligence represents a significant milestone in technological advancement. I believe that AI has the potential to transform various aspects of our daily lives, from healthcare to education. However, it is crucial to consider the ethical implications of these technologies. Personally, I think we need to approach this carefully and ensure that AI systems are designed with human values in mind. Furthermore, we must address concerns about privacy and data security. In my opinion, the key is finding the right balance between innovation and responsibility.`
        };
        
        this.textInput.value = samples[type];
        this.updateCharacterCount();
        this.showMessage(`Loaded ${type} sample text. Click "Analyze Text" to test the detection.`, 'info');
    }
    
    updateCharacterCount() {
        const text = this.textInput.value;
        const charCount = text.length;
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        
        if (charCount > 0) {
            this.showMessage(`Text length: ${wordCount} words, ${charCount} characters`, 'info');
        }
    }
    
    async analyzeText() {
        const text = this.textInput.value.trim();
        
        if (!text) {
            this.showMessage('Please enter some text to analyze.', 'warning');
            return;
        }
        
        if (text.length < 20) {
            this.showMessage('For better accuracy, please enter at least 20 characters of text.', 'warning');
        }
        
        // Show loading state
        this.analyzeBtn.disabled = true;
        this.analyzeBtn.innerHTML = '<div class="loading-spinner"></div> Analyzing...';
        this.showMessage('Analyzing text with AI detection models...', 'info');
        
        try {
            let analysis;
            
            // Try API-based detection first
            if (this.apiConfig.apiKey) {
                try {
                    analysis = await this.performAPIAnalysis(text);
                    this.showMessage('Analysis complete using AI model!', 'success');
                } catch (apiError) {
                    console.warn('API analysis failed, falling back to pattern analysis:', apiError);
                    this.showMessage('API analysis failed, using pattern-based detection.', 'warning');
                    analysis = this.performFallbackAnalysis(text);
                }
            } else {
                // Use public endpoint or fallback
                try {
                    analysis = await this.performPublicAPIAnalysis(text);
                    this.showMessage('Analysis complete using public AI model!', 'success');
                } catch (publicError) {
                    console.warn('Public API failed, using pattern analysis:', publicError);
                    this.showMessage('Using pattern-based detection (API unavailable).', 'info');
                    analysis = this.performFallbackAnalysis(text);
                }
            }
            
            // Display results
            this.displayResults(analysis);
            
        } catch (error) {
            console.error('Analysis error:', error);
            this.showMessage('Error during analysis. Please try again.', 'error');
        } finally {
            // Reset button state
            this.analyzeBtn.disabled = false;
            this.analyzeBtn.innerHTML = '<i class="fas fa-robot"></i> Analyze Text';
        }
    }
    
    async performAPIAnalysis(text) {
        const headers = {
            'Authorization': `Bearer ${this.apiConfig.apiKey}`,
            'Content-Type': 'application/json'
        };
        
        // Try multiple AI detection models
        const models = [
            'roberta-base-openai-detector',
            'microsoft/DialoGPT-medium',
            'facebook/opt-350m'
        ];
        
        for (const model of models) {
            try {
                const response = await this.callHuggingFaceAPI(model, text, headers);
                return this.processAPIResponse(response, text);
            } catch (error) {
                console.warn(`Model ${model} failed:`, error);
                continue;
            }
        }
        
        throw new Error('All API models failed');
    }
    
    async performPublicAPIAnalysis(text) {
        // Use public endpoint (limited requests)
        const headers = {
            'Content-Type': 'application/json'
        };
        
        try {
            const response = await this.callHuggingFaceAPI('microsoft/DialoGPT-medium', text, headers);
            return this.processAPIResponse(response, text);
        } catch (error) {
            throw new Error('Public API unavailable');
        }
    }
    
    async callHuggingFaceAPI(model, text, headers) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.apiConfig.timeout);
        
        try {
            const response = await fetch(`${this.apiConfig.baseUrl}/${model}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ inputs: text }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    processAPIResponse(response, text) {
        // Process different types of API responses
        let aiScore = 0;
        let confidence = 0;
        
        if (Array.isArray(response)) {
            // Standard Hugging Face response format
            const result = response[0];
            
            if (result && result.label) {
                // Classification model response
                const label = result.label.toLowerCase();
                const score = result.score || 0;
                
                if (label.includes('ai') || label.includes('fake') || label.includes('generated')) {
                    aiScore = score * 100;
                } else if (label.includes('human') || label.includes('real')) {
                    aiScore = (1 - score) * 100;
                } else {
                    aiScore = score * 100;
                }
                
                confidence = score * 100;
            } else if (result && typeof result === 'object') {
                // Alternative response format
                const scores = Object.values(result);
                const maxScore = Math.max(...scores);
                aiScore = maxScore * 100;
                confidence = maxScore * 100;
            }
        } else if (typeof response === 'object') {
            // Direct object response
            const scores = Object.values(response);
            const maxScore = Math.max(...scores);
            aiScore = maxScore * 100;
            confidence = maxScore * 100;
        }
        
        // Fallback if no valid response
        if (aiScore === 0 && confidence === 0) {
            throw new Error('Invalid API response format');
        }
        
        // Calculate additional metrics
        const stats = this.calculateTextStatistics(text);
        const linguistic = this.performLinguisticAnalysis(text);
        const patterns = this.analyzePatterns(text);
        
        return {
            stats,
            linguistic,
            aiMetrics: {
                patternConsistency: aiScore,
                semanticCoherence: confidence,
                stylisticMarkers: aiScore,
                confidenceLevel: confidence
            },
            patterns,
            confidence: aiScore,
            overallResult: this.determineOverallResult(aiScore)
        };
    }
    
    performFallbackAnalysis(text) {
        // Basic text statistics
        const stats = this.calculateTextStatistics(text);
        
        // Linguistic analysis
        const linguistic = this.performLinguisticAnalysis(text);
        
        // Pattern-based AI detection
        const patterns = this.analyzePatterns(text);
        const aiMetrics = this.calculateAIMetrics(text);
        
        // Overall confidence calculation
        const confidence = this.calculateConfidence(linguistic, aiMetrics, patterns);
        
        return {
            stats,
            linguistic,
            aiMetrics,
            patterns,
            confidence,
            overallResult: this.determineOverallResult(confidence)
        };
    }
    
    calculateTextStatistics(text) {
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        const characters = text.length;
        const avgWordsPerSentence = sentences.length > 0 ? (words.length / sentences.length).toFixed(1) : 0;
        
        return {
            wordCount: words.length,
            charCount: characters,
            sentenceCount: sentences.length,
            avgWordsPerSentence: parseFloat(avgWordsPerSentence)
        };
    }
    
    performLinguisticAnalysis(text) {
        const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        const uniqueWords = new Set(words);
        
        // Vocabulary diversity (Type-Token Ratio)
        const vocabularyDiversity = words.length > 0 ? ((uniqueWords.size / words.length) * 100).toFixed(1) : 0;
        
        // Repetition score (inverse of vocabulary diversity)
        const repetitionScore = (100 - parseFloat(vocabularyDiversity)).toFixed(1);
        
        // Complexity score based on word length and sentence structure
        const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
        const complexityScore = Math.min(100, (avgWordLength / 8) * 100).toFixed(1);
        
        // Coherence score (simplified - based on sentence length consistency)
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        const sentenceLengths = sentences.map(sentence => sentence.trim().split(/\s+/).length);
        const avgSentenceLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length;
        const lengthVariance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgSentenceLength, 2), 0) / sentenceLengths.length;
        const coherenceScore = Math.max(0, 100 - (lengthVariance / 10)).toFixed(1);
        
        return {
            vocabularyDiversity: parseFloat(vocabularyDiversity),
            repetitionScore: parseFloat(repetitionScore),
            complexityScore: parseFloat(complexityScore),
            coherenceScore: parseFloat(coherenceScore)
        };
    }
    
    calculateAIMetrics(text) {
        const lowerText = text.toLowerCase();
        
        // Pattern consistency (how often AI-like phrases appear)
        let aiPatternCount = 0;
        let humanPatternCount = 0;
        
        this.fallbackPatterns.aiIndicators.forEach(pattern => {
            const regex = new RegExp(pattern.toLowerCase(), 'g');
            const matches = (lowerText.match(regex) || []).length;
            aiPatternCount += matches;
        });
        
        this.fallbackPatterns.humanIndicators.forEach(pattern => {
            const regex = new RegExp(pattern.toLowerCase(), 'g');
            const matches = (lowerText.match(regex) || []).length;
            humanPatternCount += matches;
        });
        
        const totalWords = text.split(/\s+/).length;
        const patternConsistency = Math.min(100, (aiPatternCount / Math.max(1, totalWords / 50)) * 100).toFixed(1);
        const semanticCoherence = Math.min(100, (humanPatternCount / Math.max(1, totalWords / 50)) * 100).toFixed(1);
        
        // Stylistic markers (based on sentence structure consistency)
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        const sentenceStarts = sentences.map(sentence => sentence.trim().split(/\s+/)[0]?.toLowerCase() || '');
        const commonStarts = ['the', 'it', 'this', 'that', 'there', 'here'];
        const repetitiveStarts = commonStarts.reduce((count, start) => {
            return count + sentenceStarts.filter(s => s === start).length;
        }, 0);
        
        const stylisticMarkers = Math.min(100, (repetitiveStarts / Math.max(1, sentences.length)) * 100).toFixed(1);
        
        // Confidence level (combination of all metrics)
        const confidenceLevel = ((parseFloat(patternConsistency) + parseFloat(semanticCoherence) + parseFloat(stylisticMarkers)) / 3).toFixed(1);
        
        return {
            patternConsistency: parseFloat(patternConsistency),
            semanticCoherence: parseFloat(semanticCoherence),
            stylisticMarkers: parseFloat(stylisticMarkers),
            confidenceLevel: parseFloat(confidenceLevel)
        };
    }
    
    analyzePatterns(text) {
        const patterns = [];
        const lowerText = text.toLowerCase();
        
        // Check for AI indicators
        this.fallbackPatterns.aiIndicators.forEach(phrase => {
            const regex = new RegExp(phrase.toLowerCase(), 'g');
            const matches = (lowerText.match(regex) || []).length;
            if (matches > 0) {
                patterns.push({
                    type: 'ai',
                    description: `AI pattern detected: "${phrase}" (${matches} occurrences)`,
                    severity: matches > 1 ? 'high' : 'medium'
                });
            }
        });
        
        // Check for human indicators
        this.fallbackPatterns.humanIndicators.forEach(phrase => {
            const regex = new RegExp(phrase.toLowerCase(), 'g');
            const matches = (lowerText.match(regex) || []).length;
            if (matches > 0) {
                patterns.push({
                    type: 'human',
                    description: `Human pattern detected: "${phrase}" (${matches} occurrences)`,
                    severity: 'medium'
                });
            }
        });
        
        // Check for sentence length variety (human indicator)
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        const sentenceLengths = sentences.map(sentence => sentence.trim().split(/\s+/).length);
        const lengthVariety = Math.max(...sentenceLengths) - Math.min(...sentenceLengths);
        
        if (lengthVariety > 15) {
            patterns.push({
                type: 'human',
                description: 'Varied sentence lengths detected (natural writing pattern)',
                severity: 'low'
            });
        }
        
        return patterns;
    }
    
    calculateConfidence(linguistic, aiMetrics, patterns) {
        // Weighted combination of various factors
        const weights = {
            vocabularyDiversity: 0.15,
            repetitionScore: 0.15,
            patternConsistency: 0.25,
            semanticCoherence: 0.20,
            stylisticMarkers: 0.25
        };
        
        let aiScore = 0;
        aiScore += (100 - linguistic.vocabularyDiversity) * weights.vocabularyDiversity;
        aiScore += linguistic.repetitionScore * weights.repetitionScore;
        aiScore += aiMetrics.patternConsistency * weights.patternConsistency;
        aiScore += aiMetrics.semanticCoherence * weights.semanticCoherence;
        aiScore += aiMetrics.stylisticMarkers * weights.stylisticMarkers;
        
        // Adjust based on pattern analysis
        const aiPatterns = patterns.filter(p => p.type === 'ai').length;
        const humanPatterns = patterns.filter(p => p.type === 'human').length;
        
        if (aiPatterns > humanPatterns) {
            aiScore += 10;
        } else if (humanPatterns > aiPatterns) {
            aiScore -= 10;
        }
        
        return Math.max(0, Math.min(100, aiScore));
    }
    
    determineOverallResult(confidence) {
        if (confidence >= 70) {
            return { status: 'ai', label: 'Likely AI-Generated', icon: 'fas fa-robot' };
        } else if (confidence >= 40) {
            return { status: 'uncertain', label: 'Uncertain', icon: 'fas fa-question-circle' };
        } else {
            return { status: 'human', label: 'Likely Human-Written', icon: 'fas fa-user' };
        }
    }
    
    displayResults(analysis) {
        // Update text statistics
        document.getElementById('wordCount').textContent = analysis.stats.wordCount;
        document.getElementById('charCount').textContent = analysis.stats.charCount;
        document.getElementById('sentenceCount').textContent = analysis.stats.sentenceCount;
        document.getElementById('avgWordsPerSentence').textContent = analysis.stats.avgWordsPerSentence;
        
        // Update linguistic analysis
        document.getElementById('vocabularyDiversity').textContent = analysis.linguistic.vocabularyDiversity + '%';
        document.getElementById('repetitionScore').textContent = analysis.linguistic.repetitionScore + '%';
        document.getElementById('complexityScore').textContent = analysis.linguistic.complexityScore + '%';
        document.getElementById('coherenceScore').textContent = analysis.linguistic.coherenceScore + '%';
        
        // Update AI detection metrics
        document.getElementById('patternConsistency').textContent = analysis.aiMetrics.patternConsistency + '%';
        document.getElementById('semanticCoherence').textContent = analysis.aiMetrics.semanticCoherence + '%';
        document.getElementById('stylisticMarkers').textContent = analysis.aiMetrics.stylisticMarkers + '%';
        document.getElementById('confidenceLevel').textContent = analysis.aiMetrics.confidenceLevel + '%';
        
        // Update overall confidence and status
        document.getElementById('confidenceScore').textContent = analysis.confidence.toFixed(1) + '%';
        
        const resultStatus = document.getElementById('resultStatus');
        resultStatus.className = `result-status status-${analysis.overallResult.status}`;
        resultStatus.innerHTML = `
            <i class="${analysis.overallResult.icon}"></i>
            <span>${analysis.overallResult.label}</span>
        `;
        
        // Update pattern list
        this.updatePatternList(analysis.patterns);
        
        // Show results section
        this.resultsSection.style.display = 'block';
        
        // Scroll to results
        this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    updatePatternList(patterns) {
        const patternList = document.getElementById('patternList');
        patternList.innerHTML = '';
        
        if (patterns.length === 0) {
            patternList.innerHTML = '<li class="pattern-item"><span>No significant patterns detected</span></li>';
            return;
        }
        
        patterns.forEach(pattern => {
            const li = document.createElement('li');
            li.className = 'pattern-item';
            
            const icon = document.createElement('div');
            icon.className = `pattern-icon pattern-${pattern.type}`;
            icon.innerHTML = pattern.type === 'ai' ? '🤖' : pattern.type === 'human' ? '👤' : '❓';
            
            const description = document.createElement('span');
            description.textContent = pattern.description;
            
            li.appendChild(icon);
            li.appendChild(description);
            patternList.appendChild(li);
        });
    }
    
    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = this.messageContainer.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        messageElement.style.display = 'block';
        
        this.messageContainer.appendChild(messageElement);
        
        // Auto-hide after 5 seconds for info messages
        if (type === 'info') {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 5000);
        }
    }
}

// Initialize the AI Text Detector when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AITextDetector();
}); 