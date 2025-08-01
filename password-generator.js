// Advanced Password Generator
// Comprehensive password generation with entropy controls and multiple algorithms

class PasswordGenerator {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.characterSets = this.defineCharacterSets();
        this.generationHistory = [];
        this.maxHistoryItems = 20;
    }

    initializeElements() {
        // Basic controls
        this.passwordLength = document.getElementById('passwordLength');
        this.passwordLengthNumber = document.getElementById('passwordLengthNumber');
        this.generationCount = document.getElementById('generationCount');
        
        // Character set checkboxes
        this.includeLowercase = document.getElementById('includeLowercase');
        this.includeUppercase = document.getElementById('includeUppercase');
        this.includeNumbers = document.getElementById('includeNumbers');
        this.includeSymbols = document.getElementById('includeSymbols');
        this.includeExtendedSymbols = document.getElementById('includeExtendedSymbols');
        this.includeNonKeyboard = document.getElementById('includeNonKeyboard');
        this.includeInvisible = document.getElementById('includeInvisible');
        this.excludeSimilar = document.getElementById('excludeSimilar');
        this.excludeAmbiguous = document.getElementById('excludeAmbiguous');
        
        // Entropy controls
        this.minEntropy = document.getElementById('minEntropy');
        this.targetEntropy = document.getElementById('targetEntropy');
        
        // Advanced options
        this.generationAlgorithm = document.getElementById('generationAlgorithm');
        this.enablePatternAnalysis = document.getElementById('enablePatternAnalysis');
        this.enableEntropyValidation = document.getElementById('enableEntropyValidation');
        this.customCharacters = document.getElementById('customCharacters');
        this.excludedCharacters = document.getElementById('excludedCharacters');
        this.minLowercase = document.getElementById('minLowercase');
        this.minUppercase = document.getElementById('minUppercase');
        this.minNumbers = document.getElementById('minNumbers');
        this.minSymbols = document.getElementById('minSymbols');
        
        // Buttons
        this.generateBtn = document.getElementById('generateBtn');
        this.copyAllBtn = document.getElementById('copyAllBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.exportBtn = document.getElementById('exportBtn');
        
        // Display elements
        this.entropyDisplay = document.getElementById('entropyDisplay');
        this.entropyFill = document.getElementById('entropyFill');
        this.entropyText = document.getElementById('entropyText');
        this.strengthIndicator = document.getElementById('strengthIndicator');
        this.generatedPasswords = document.getElementById('generatedPasswords');
        this.historyContainer = document.getElementById('historyContainer');
    }

    setupEventListeners() {
        // Sync range and number inputs
        this.passwordLength.addEventListener('input', () => {
            this.passwordLengthNumber.value = this.passwordLength.value;
        });
        
        this.passwordLengthNumber.addEventListener('input', () => {
            this.passwordLength.value = this.passwordLengthNumber.value;
        });
        
        // Generate button
        this.generateBtn.addEventListener('click', () => this.generatePasswords());
        
        // Action buttons
        this.copyAllBtn.addEventListener('click', () => this.copyAllPasswords());
        this.clearBtn.addEventListener('click', () => this.clearPasswords());
        this.exportBtn.addEventListener('click', () => this.exportPasswords());
        
        // Character set validation
        this.includeLowercase.addEventListener('change', () => this.validateCharacterSets());
        this.includeUppercase.addEventListener('change', () => this.validateCharacterSets());
        this.includeNumbers.addEventListener('change', () => this.validateCharacterSets());
        this.includeSymbols.addEventListener('change', () => this.validateCharacterSets());
        this.includeExtendedSymbols.addEventListener('change', () => this.validateCharacterSets());
        this.includeNonKeyboard.addEventListener('change', () => this.validateCharacterSets());
        this.includeInvisible.addEventListener('change', () => this.validateCharacterSets());
    }

    defineCharacterSets() {
        return {
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            numbers: '0123456789',
            basicSymbols: '!@#$%^&*',
            extendedSymbols: '~`!@#$%^&*()_+-={}[]|\\:;"\'<>?,./',
            nonKeyboard: '§±!@#$%^&*()_+-=[]{}|;:,.<>?/~`¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ',
            invisible: '\u200B\u200C\u200D\u2060\uFEFF', // Zero-width characters
            similar: 'l1IO0', // Characters that look similar
            ambiguous: '{}[]()/\\|`\'"' // Ambiguous characters
        };
    }

    validateCharacterSets() {
        const selectedSets = this.getSelectedCharacterSets();
        if (selectedSets.length === 0) {
            this.showNotification('Please select at least one character set!', 'error');
            return false;
        }
        return true;
    }

    getSelectedCharacterSets() {
        const sets = [];
        if (this.includeLowercase.checked) sets.push('lowercase');
        if (this.includeUppercase.checked) sets.push('uppercase');
        if (this.includeNumbers.checked) sets.push('numbers');
        if (this.includeSymbols.checked) sets.push('basicSymbols');
        if (this.includeExtendedSymbols.checked) sets.push('extendedSymbols');
        if (this.includeNonKeyboard.checked) sets.push('nonKeyboard');
        if (this.includeInvisible.checked) sets.push('invisible');
        return sets;
    }

    buildCharacterPool() {
        let pool = '';
        const selectedSets = this.getSelectedCharacterSets();
        
        selectedSets.forEach(set => {
            pool += this.characterSets[set];
        });
        
        // Apply exclusions
        if (this.excludeSimilar.checked) {
            pool = pool.split('').filter(char => !this.characterSets.similar.includes(char)).join('');
        }
        
        if (this.excludeAmbiguous.checked) {
            pool = pool.split('').filter(char => !this.characterSets.ambiguous.includes(char)).join('');
        }
        
        // Add custom characters
        if (this.customCharacters.value.trim()) {
            pool += this.customCharacters.value.trim();
        }
        
        // Remove excluded characters
        if (this.excludedCharacters.value.trim()) {
            const excluded = this.excludedCharacters.value.trim().split('');
            pool = pool.split('').filter(char => !excluded.includes(char)).join('');
        }
        
        return pool;
    }

    generatePasswords() {
        if (!this.validateCharacterSets()) return;
        
        const characterPool = this.buildCharacterPool();
        if (characterPool.length === 0) {
            this.showNotification('No characters available for password generation!', 'error');
            return;
        }
        
        const length = parseInt(this.passwordLength.value);
        const count = parseInt(this.generationCount.value);
        const algorithm = this.generationAlgorithm.value;
        
        const passwords = [];
        for (let i = 0; i < count; i++) {
            const password = this.generatePassword(characterPool, length, algorithm);
            passwords.push(password);
        }
        
        this.displayPasswords(passwords, characterPool.length);
        this.addToHistory(passwords, {
            length: length,
            algorithm: algorithm,
            characterSets: this.getSelectedCharacterSets()
        });
    }

    generatePassword(characterPool, length, algorithm) {
        let password = '';
        
        switch (algorithm) {
            case 'crypto':
                password = this.generateCryptographicallySecure(characterPool, length);
                break;
            case 'pseudorandom':
                password = this.generatePseudorandom(characterPool, length);
                break;
            case 'pattern':
                password = this.generatePatternBased(characterPool, length);
                break;
            case 'pronounceable':
                password = this.generatePronounceable(characterPool, length);
                break;
            default:
                password = this.generateCryptographicallySecure(characterPool, length);
        }
        
        return this.enforceCharacterDistribution(password, characterPool);
    }

    generateCryptographicallySecure(characterPool, length) {
        // For very long passwords, generate in chunks to avoid memory issues
        const chunkSize = 1000;
        let password = '';
        
        for (let i = 0; i < length; i += chunkSize) {
            const currentChunkSize = Math.min(chunkSize, length - i);
            const array = new Uint8Array(currentChunkSize);
            crypto.getRandomValues(array);
            
            for (let j = 0; j < currentChunkSize; j++) {
                password += characterPool[array[j] % characterPool.length];
            }
        }
        
        return password;
    }

    generatePseudorandom(characterPool, length) {
        let password = '';
        for (let i = 0; i < length; i++) {
            password += characterPool[Math.floor(Math.random() * characterPool.length)];
        }
        return password;
    }

    generatePatternBased(characterPool, length) {
        const vowels = 'aeiouAEIOU';
        const consonants = 'bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            if (i % 2 === 0) {
                password += consonants[Math.floor(Math.random() * consonants.length)];
            } else {
                password += vowels[Math.floor(Math.random() * vowels.length)];
            }
        }
        
        return password;
    }

    generatePronounceable(characterPool, length) {
        const syllables = ['ba', 'be', 'bi', 'bo', 'bu', 'ca', 'ce', 'ci', 'co', 'cu', 'da', 'de', 'di', 'do', 'du'];
        let password = '';
        
        while (password.length < length) {
            password += syllables[Math.floor(Math.random() * syllables.length)];
        }
        
        return password.substring(0, length);
    }

    getCharacterSetByType(type, characterPool) {
        switch (type) {
            case 'lowercase': return characterPool.match(/[a-z]/g) || [];
            case 'uppercase': return characterPool.match(/[A-Z]/g) || [];
            case 'numbers': return characterPool.match(/[0-9]/g) || [];
            case 'symbols': return characterPool.match(/[^a-zA-Z0-9]/g) || [];
            default: return [];
        }
    }

    enforceCharacterDistribution(password, characterPool) {
        const passwordArray = password.split('');
        
        // Ensure minimum characters of each type
        this.ensureMinimumCharacters(passwordArray, 'lowercase', parseInt(this.minLowercase.value), characterPool);
        this.ensureMinimumCharacters(passwordArray, 'uppercase', parseInt(this.minUppercase.value), characterPool);
        this.ensureMinimumCharacters(passwordArray, 'numbers', parseInt(this.minNumbers.value), characterPool);
        this.ensureMinimumCharacters(passwordArray, 'symbols', parseInt(this.minSymbols.value), characterPool);
        
        return passwordArray.join('');
    }

    ensureMinimumCharacters(passwordArray, type, minCount, characterPool) {
        const currentCount = this.countCharacterType(passwordArray, type);
        if (currentCount < minCount) {
            const needed = minCount - currentCount;
            const typeChars = this.getCharacterSetByType(type, characterPool);
            
            for (let i = 0; i < needed && i < typeChars.length; i++) {
                const randomIndex = Math.floor(Math.random() * passwordArray.length);
                passwordArray[randomIndex] = typeChars[i];
            }
        }
    }

    countCharacterType(passwordArray, type) {
        const password = passwordArray.join('');
        switch (type) {
            case 'lowercase': return (password.match(/[a-z]/g) || []).length;
            case 'uppercase': return (password.match(/[A-Z]/g) || []).length;
            case 'numbers': return (password.match(/[0-9]/g) || []).length;
            case 'symbols': return (password.match(/[^a-zA-Z0-9]/g) || []).length;
            default: return 0;
        }
    }

    calculateEntropy(password, characterPoolSize) {
        // Use logarithms to handle very large numbers
        return password.length * Math.log2(characterPoolSize);
    }

    detectSequentialPatterns(password) {
        const sequences = ['123', '234', '345', '456', '789', 'abc', 'bcd', 'cde', 'def', 'xyz'];
        return sequences.some(seq => password.toLowerCase().includes(seq));
    }

    detectRepeatedCharacters(password) {
        return /(.)\1{2,}/.test(password);
    }

    detectKeyboardPatterns(password) {
        const patterns = ['qwerty', 'asdfgh', 'zxcvbn', '123456', '654321'];
        return patterns.some(pattern => password.toLowerCase().includes(pattern));
    }

    displayPasswords(passwords, characterPoolSize) {
        this.generatedPasswords.innerHTML = '';
        
        passwords.forEach((password, index) => {
            const entropy = this.calculateEntropy(password, characterPoolSize);
            const strength = this.getStrengthLevel(entropy);
            const strengthText = this.getStrengthText(strength);
            
            const passwordDiv = document.createElement('div');
            passwordDiv.className = `generated-password ${strength}`;
            passwordDiv.innerHTML = `
                <span>${this.escapeHtml(password)}</span>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                    <span class="strength-indicator strength-${strength}">${strengthText}</span>
                    <button class="btn btn-secondary" onclick="passwordGenerator.copyPassword('${this.escapeHtml(password)}')" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
            `;
            
            this.generatedPasswords.appendChild(passwordDiv);
        });
        
        // Update entropy display for the first password
        if (passwords.length > 0) {
            const entropy = this.calculateEntropy(passwords[0], characterPoolSize);
            this.updateEntropyDisplay(entropy);
        }
        
        // Show action buttons
        this.copyAllBtn.style.display = 'inline-flex';
        this.clearBtn.style.display = 'inline-flex';
        this.exportBtn.style.display = 'inline-flex';
    }

    updateEntropyDisplay(entropy) {
        this.entropyDisplay.style.display = 'flex';
        
        // Format entropy display for very large numbers
        let entropyText = '';
        if (entropy >= 1000000) {
            entropyText = `${(entropy / 1000000).toFixed(1)}M bits`;
        } else if (entropy >= 1000) {
            entropyText = `${(entropy / 1000).toFixed(1)}K bits`;
        } else {
            entropyText = `${Math.round(entropy)} bits`;
        }
        this.entropyText.textContent = entropyText;
        
        const strength = this.getStrengthLevel(entropy);
        this.strengthIndicator.textContent = this.getStrengthText(strength);
        this.strengthIndicator.className = `strength-indicator strength-${strength}`;
        
        // Update entropy bar (cap at 2048 for display purposes)
        const maxEntropy = 2048;
        const percentage = Math.min((entropy / maxEntropy) * 100, 100);
        this.entropyFill.style.width = `${percentage}%`;
    }

    getStrengthLevel(entropy) {
        if (entropy < 33) return 'very-weak';
        if (entropy < 65) return 'weak';
        if (entropy < 129) return 'medium';
        if (entropy < 257) return 'strong';
        if (entropy < 513) return 'very-strong';
        if (entropy < 1024) return 'extremely-strong';
        return 'unbreakable';
    }

    getStrengthText(strength) {
        switch (strength) {
            case 'very-weak': return 'Very Weak';
            case 'weak': return 'Weak';
            case 'medium': return 'Medium';
            case 'strong': return 'Strong';
            case 'very-strong': return 'Very Strong';
            case 'extremely-strong': return 'Extremely Strong';
            case 'unbreakable': return 'Unbreakable';
            default: return 'Unknown';
        }
    }

    copyPassword(password) {
        navigator.clipboard.writeText(password).then(() => {
            this.showNotification('Password copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy password', 'error');
        });
    }

    copyAllPasswords() {
        const passwords = Array.from(this.generatedPasswords.children).map(div => {
            return div.querySelector('span').textContent;
        });
        
        navigator.clipboard.writeText(passwords.join('\n')).then(() => {
            this.showNotification('All passwords copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy passwords', 'error');
        });
    }

    clearPasswords() {
        this.generatedPasswords.innerHTML = '';
        this.entropyDisplay.style.display = 'none';
        this.copyAllBtn.style.display = 'none';
        this.clearBtn.style.display = 'none';
        this.exportBtn.style.display = 'none';
    }

    exportPasswords() {
        const passwords = Array.from(this.generatedPasswords.children).map(div => {
            const password = div.querySelector('span').textContent;
            return password;
        });
        
        const now = new Date();
        const timestamp = now.toLocaleString();
        const dateStr = now.toISOString().split('T')[0];
        
        let exportContent = `Password Export - ${timestamp}\n`;
        exportContent += `Generated: ${timestamp}\n`;
        exportContent += `Total Passwords: ${passwords.length}\n`;
        exportContent += `\n`.repeat(2);
        exportContent += `PASSWORDS:\n`;
        exportContent += `\n`.repeat(2);
        
        passwords.forEach((password, index) => {
            exportContent += `${index + 1}. ${password} (${password.length} chars)\n`;
        });
        
        const blob = new Blob([exportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `passwords-${dateStr}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Passwords exported as text file!', 'success');
    }

    addToHistory(passwords, settings) {
        const historyItem = {
            timestamp: new Date(),
            passwords: passwords,
            settings: settings
        };
        
        this.generationHistory.unshift(historyItem);
        
        // Keep only the last N items
        if (this.generationHistory.length > this.maxHistoryItems) {
            this.generationHistory = this.generationHistory.slice(0, this.maxHistoryItems);
        }
        
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        this.historyContainer.innerHTML = '';
        
        this.generationHistory.forEach((item, index) => {
            const historyDiv = document.createElement('div');
            historyDiv.className = 'history-item';
            historyDiv.innerHTML = `
                <div>${item.passwords[0]}${item.passwords.length > 1 ? ` (+${item.passwords.length - 1} more)` : ''}</div>
                <div class="history-meta">
                    ${item.timestamp.toLocaleString()} | ${item.settings.length} chars | ${item.settings.algorithm}
                </div>
            `;
            historyDiv.addEventListener('click', () => this.loadFromHistory(item));
            this.historyContainer.appendChild(historyDiv);
        });
    }

    loadFromHistory(historyItem) {
        // Restore settings from history
        this.passwordLength.value = historyItem.settings.length;
        this.passwordLengthNumber.value = historyItem.settings.length;
        this.generationAlgorithm.value = historyItem.settings.algorithm;
        
        // Display the passwords
        const characterPool = this.buildCharacterPool();
        this.displayPasswords(historyItem.passwords, characterPool.length);
        
        this.showNotification('Settings restored from history!', 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        switch (type) {
            case 'success':
                notification.style.background = '#28a745';
                break;
            case 'error':
                notification.style.background = '#dc3545';
                break;
            case 'warning':
                notification.style.background = '#ffc107';
                notification.style.color = '#212529';
                break;
            default:
                notification.style.background = '#0066ff';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the password generator when the page loads
let passwordGenerator;
document.addEventListener('DOMContentLoaded', () => {
    passwordGenerator = new PasswordGenerator();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .strength-very-weak {
        background: rgba(220, 53, 69, 0.2);
        color: #dc3545;
    }
    
    .strength-extremely-strong {
        background: rgba(0, 102, 255, 0.2);
        color: var(--accent-primary);
    }
    
    .strength-unbreakable {
        background: rgba(138, 43, 226, 0.2);
        color: #8a2be2;
    }
`;
document.head.appendChild(style); 