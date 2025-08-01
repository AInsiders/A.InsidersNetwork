/**
 * AI Text Detection Tool
 * Analyzes text for AI generation patterns using linguistic analysis
 */

class AITextDetector {
    constructor() {
        this.textInput = document.getElementById('textInput');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.messageContainer = document.getElementById('messageContainer');
        
        // Common English stop words
        this.stopWords = new Set([
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 
            'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with',
            'i', 'you', 'your', 'we', 'they', 'them', 'this', 'these', 'those', 'but', 'or',
            'if', 'then', 'else', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each',
            'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
            'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now'
        ]);
        
        // AI generation indicators
        this.aiIndicators = {
            repetitivePhrases: [
                'it is important to note', 'furthermore', 'moreover', 'additionally',
                'in conclusion', 'as a result', 'therefore', 'thus', 'consequently',
                'it can be argued', 'it is evident', 'clearly', 'obviously',
                'in other words', 'to put it simply', 'in essence', 'fundamentally'
            ],
            formalPatterns: [
                'the aforementioned', 'the latter', 'the former', 'as previously mentioned',
                'it is worth noting', 'it should be emphasized', 'it is crucial to',
                'one must consider', 'it is imperative that', 'it is essential to'
            ],
            academicPhrases: [
                'according to research', 'studies have shown', 'research indicates',
                'empirical evidence suggests', 'the literature demonstrates',
                'scholarly analysis reveals', 'academic sources indicate'
            ]
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showMessage('Ready to analyze text. Enter your content above and click "Analyze Text".', 'info');
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
    
    updateCharacterCount() {
        const text = this.textInput.value;
        const charCount = text.length;
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        
        // Update placeholder or show count
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
        
        if (text.length < 50) {
            this.showMessage('For better accuracy, please enter at least 50 characters of text.', 'warning');
        }
        
        // Show loading state
        this.analyzeBtn.disabled = true;
        this.analyzeBtn.innerHTML = '<div class="loading-spinner"></div> Analyzing...';
        this.showMessage('Analyzing text patterns and linguistic markers...', 'info');
        
        try {
            // Simulate analysis delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Perform text analysis
            const analysis = this.performTextAnalysis(text);
            
            // Display results
            this.displayResults(analysis);
            
            this.showMessage('Analysis complete!', 'success');
            
        } catch (error) {
            console.error('Analysis error:', error);
            this.showMessage('Error during analysis. Please try again.', 'error');
        } finally {
            // Reset button state
            this.analyzeBtn.disabled = false;
            this.analyzeBtn.innerHTML = '<i class="fas fa-robot"></i> Analyze Text';
        }
    }
    
    performTextAnalysis(text) {
        // Basic text statistics
        const stats = this.calculateTextStatistics(text);
        
        // Linguistic analysis
        const linguistic = this.performLinguisticAnalysis(text);
        
        // AI detection metrics
        const aiMetrics = this.calculateAIMetrics(text);
        
        // Pattern analysis
        const patterns = this.analyzePatterns(text);
        
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
        let patternCount = 0;
        let totalPatterns = 0;
        
        Object.values(this.aiIndicators).forEach(patternList => {
            patternList.forEach(pattern => {
                totalPatterns++;
                const regex = new RegExp(pattern.toLowerCase(), 'g');
                const matches = (lowerText.match(regex) || []).length;
                patternCount += matches;
            });
        });
        
        const patternConsistency = Math.min(100, (patternCount / Math.max(1, text.split(/\s+/).length / 100)) * 100).toFixed(1);
        
        // Semantic coherence (simplified - based on formal language usage)
        const formalWords = ['furthermore', 'moreover', 'additionally', 'consequently', 'therefore', 'thus', 'hence'];
        const formalWordCount = formalWords.reduce((count, word) => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            return count + (lowerText.match(regex) || []).length;
        }, 0);
        
        const semanticCoherence = Math.min(100, (formalWordCount / Math.max(1, text.split(/\s+/).length / 50)) * 100).toFixed(1);
        
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
        
        // Check for repetitive phrases
        this.aiIndicators.repetitivePhrases.forEach(phrase => {
            const regex = new RegExp(phrase.toLowerCase(), 'g');
            const matches = (lowerText.match(regex) || []).length;
            if (matches > 0) {
                patterns.push({
                    type: 'ai',
                    description: `Repetitive phrase detected: "${phrase}" (${matches} occurrences)`,
                    severity: matches > 1 ? 'high' : 'medium'
                });
            }
        });
        
        // Check for formal patterns
        this.aiIndicators.formalPatterns.forEach(phrase => {
            const regex = new RegExp(phrase.toLowerCase(), 'g');
            const matches = (lowerText.match(regex) || []).length;
            if (matches > 0) {
                patterns.push({
                    type: 'ai',
                    description: `Formal pattern detected: "${phrase}"`,
                    severity: 'medium'
                });
            }
        });
        
        // Check for academic phrases
        this.aiIndicators.academicPhrases.forEach(phrase => {
            const regex = new RegExp(phrase.toLowerCase(), 'g');
            const matches = (lowerText.match(regex) || []).length;
            if (matches > 0) {
                patterns.push({
                    type: 'ai',
                    description: `Academic phrase detected: "${phrase}"`,
                    severity: 'high'
                });
            }
        });
        
        // Check for natural language patterns (human indicators)
        const naturalPatterns = [
            { pattern: /\b(i think|i believe|in my opinion|i feel)\b/gi, description: 'Personal opinion markers' },
            { pattern: /\b(um|uh|well|you know|like)\b/gi, description: 'Natural speech patterns' },
            { pattern: /\b(actually|basically|literally|honestly)\b/gi, description: 'Conversational fillers' }
        ];
        
        naturalPatterns.forEach(({ pattern, description }) => {
            const matches = (lowerText.match(pattern) || []).length;
            if (matches > 0) {
                patterns.push({
                    type: 'human',
                    description: `${description} detected (${matches} occurrences)`,
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