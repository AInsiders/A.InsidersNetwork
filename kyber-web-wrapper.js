/**
 * Kyber Post-Quantum Encryption Web Wrapper
 * 
 * This wrapper provides a JavaScript interface for Kyber encryption
 * that can be integrated into web applications.
 * 
 * Note: This is a conceptual wrapper. For production use, you would need to:
 * 1. Compile the Kyber C code to WebAssembly, or
 * 2. Use a server-side implementation with native bindings
 */

class KyberEncryption {
    constructor(securityLevel = 'kyber768') {
        this.securityLevel = securityLevel;
        this.keySizes = {
            kyber512: {
                secretKeyBytes: 1632,
                publicKeyBytes: 800,
                ciphertextBytes: 768,
                sharedSecretBytes: 32
            },
            kyber768: {
                secretKeyBytes: 2400,
                publicKeyBytes: 1184,
                ciphertextBytes: 1088,
                sharedSecretBytes: 32
            },
            kyber1024: {
                secretKeyBytes: 3168,
                publicKeyBytes: 1568,
                ciphertextBytes: 1568,
                sharedSecretBytes: 32
            }
        };
        
        this.sizes = this.keySizes[securityLevel];
        if (!this.sizes) {
            throw new Error(`Unsupported security level: ${securityLevel}`);
        }
    }

    /**
     * Generate a new Kyber key pair
     * @returns {Object} Object containing publicKey and secretKey as Uint8Array
     */
    async generateKeyPair() {
        // In a real implementation, this would call the compiled Kyber WASM module
        // For now, we'll create placeholder arrays of the correct size
        
        const publicKey = new Uint8Array(this.sizes.publicKeyBytes);
        const secretKey = new Uint8Array(this.sizes.secretKeyBytes);
        
        // Fill with cryptographically secure random data
        crypto.getRandomValues(publicKey);
        crypto.getRandomValues(secretKey);
        
        return {
            publicKey: publicKey,
            secretKey: secretKey
        };
    }

    /**
     * Encapsulate a shared secret using a recipient's public key
     * @param {Uint8Array} publicKey - Recipient's public key
     * @returns {Object} Object containing ciphertext and sharedSecret
     */
    async encapsulate(publicKey) {
        if (publicKey.length !== this.sizes.publicKeyBytes) {
            throw new Error(`Invalid public key size. Expected ${this.sizes.publicKeyBytes}, got ${publicKey.length}`);
        }
        
        const ciphertext = new Uint8Array(this.sizes.ciphertextBytes);
        const sharedSecret = new Uint8Array(this.sizes.sharedSecretBytes);
        
        // In a real implementation, this would call the Kyber encapsulation function
        // For now, we'll create placeholder data
        crypto.getRandomValues(ciphertext);
        crypto.getRandomValues(sharedSecret);
        
        return {
            ciphertext: ciphertext,
            sharedSecret: sharedSecret
        };
    }

    /**
     * Decapsulate a shared secret using the recipient's secret key
     * @param {Uint8Array} ciphertext - Encapsulated ciphertext
     * @param {Uint8Array} secretKey - Recipient's secret key
     * @returns {Uint8Array} Shared secret
     */
    async decapsulate(ciphertext, secretKey) {
        if (ciphertext.length !== this.sizes.ciphertextBytes) {
            throw new Error(`Invalid ciphertext size. Expected ${this.sizes.ciphertextBytes}, got ${ciphertext.length}`);
        }
        
        if (secretKey.length !== this.sizes.secretKeyBytes) {
            throw new Error(`Invalid secret key size. Expected ${this.sizes.secretKeyBytes}, got ${secretKey.length}`);
        }
        
        const sharedSecret = new Uint8Array(this.sizes.sharedSecretBytes);
        
        // In a real implementation, this would call the Kyber decapsulation function
        // For now, we'll create placeholder data
        crypto.getRandomValues(sharedSecret);
        
        return sharedSecret;
    }

    /**
     * Convert Uint8Array to base64 string
     * @param {Uint8Array} array - Array to convert
     * @returns {string} Base64 encoded string
     */
    toBase64(array) {
        const binary = String.fromCharCode.apply(null, array);
        return btoa(binary);
    }

    /**
     * Convert base64 string to Uint8Array
     * @param {string} base64 - Base64 encoded string
     * @returns {Uint8Array} Decoded array
     */
    fromBase64(base64) {
        const binary = atob(base64);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
        }
        return array;
    }

    /**
     * Convert Uint8Array to hex string
     * @param {Uint8Array} array - Array to convert
     * @returns {string} Hex encoded string
     */
    toHex(array) {
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Convert hex string to Uint8Array
     * @param {string} hex - Hex encoded string
     * @returns {Uint8Array} Decoded array
     */
    fromHex(hex) {
        const array = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            array[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return array;
    }
}

/**
 * Hybrid Encryption Wrapper
 * Combines Kyber for key exchange with AES for data encryption
 */
class HybridEncryption {
    constructor(kyberSecurityLevel = 'kyber768') {
        this.kyber = new KyberEncryption(kyberSecurityLevel);
    }

    /**
     * Encrypt data using hybrid encryption (Kyber + AES)
     * @param {string|Uint8Array} data - Data to encrypt
     * @param {Uint8Array} recipientPublicKey - Recipient's public key
     * @returns {Object} Encrypted data object
     */
    async encrypt(data, recipientPublicKey) {
        // Convert data to Uint8Array if it's a string
        const dataArray = typeof data === 'string' 
            ? new TextEncoder().encode(data) 
            : data;

        // Generate ephemeral key pair for this encryption
        const ephemeralKeyPair = await this.kyber.generateKeyPair();
        
        // Encapsulate shared secret using recipient's public key
        const { ciphertext, sharedSecret } = await this.kyber.encapsulate(recipientPublicKey);
        
        // Derive AES key from shared secret using HKDF
        const aesKey = await this.deriveAESKey(sharedSecret);
        
        // Encrypt data with AES-GCM
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            aesKey,
            dataArray
        );
        
        return {
            ephemeralPublicKey: ephemeralKeyPair.publicKey,
            ciphertext: ciphertext,
            iv: iv,
            encryptedData: new Uint8Array(encryptedData)
        };
    }

    /**
     * Decrypt data using hybrid encryption
     * @param {Object} encryptedData - Object containing encrypted data
     * @param {Uint8Array} secretKey - Recipient's secret key
     * @returns {Uint8Array} Decrypted data
     */
    async decrypt(encryptedData, secretKey) {
        const { ephemeralPublicKey, ciphertext, iv, encryptedData: data } = encryptedData;
        
        // Decapsulate shared secret using our secret key
        const sharedSecret = await this.kyber.decapsulate(ciphertext, secretKey);
        
        // Derive AES key from shared secret
        const aesKey = await this.deriveAESKey(sharedSecret);
        
        // Decrypt data with AES-GCM
        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            aesKey,
            data
        );
        
        return new Uint8Array(decryptedData);
    }

    /**
     * Derive AES key from Kyber shared secret using HKDF
     * @param {Uint8Array} sharedSecret - Kyber shared secret
     * @returns {CryptoKey} AES key for encryption
     */
    async deriveAESKey(sharedSecret) {
        // Import shared secret as raw key
        const baseKey = await crypto.subtle.importKey(
            'raw',
            sharedSecret,
            { name: 'HKDF' },
            false,
            ['deriveKey']
        );
        
        // Derive AES-GCM key using HKDF
        const aesKey = await crypto.subtle.deriveKey(
            {
                name: 'HKDF',
                salt: new TextEncoder().encode('kyber-aes-salt'),
                info: new TextEncoder().encode('aes-key'),
                hash: 'SHA-256'
            },
            baseKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
        
        return aesKey;
    }
}

/**
 * Key Management Utility
 * Handles secure storage and retrieval of cryptographic keys
 */
class KeyManager {
    constructor() {
        this.storageKey = 'kyber_keys';
    }

    /**
     * Store a secret key encrypted with a password
     * @param {Uint8Array} secretKey - Secret key to store
     * @param {string} password - Password for encryption
     */
    async storeSecretKey(secretKey, password) {
        // Derive encryption key from password
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );
        
        const encryptionKey = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );
        
        // Encrypt secret key
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedKey = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            encryptionKey,
            secretKey
        );
        
        // Store encrypted key
        const storedData = {
            salt: Array.from(salt),
            iv: Array.from(iv),
            encryptedKey: Array.from(new Uint8Array(encryptedKey))
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(storedData));
    }

    /**
     * Retrieve and decrypt a stored secret key
     * @param {string} password - Password for decryption
     * @returns {Uint8Array} Decrypted secret key
     */
    async retrieveSecretKey(password) {
        const storedData = JSON.parse(localStorage.getItem(this.storageKey));
        if (!storedData) {
            throw new Error('No stored secret key found');
        }
        
        // Recreate encryption key from password
        const salt = new Uint8Array(storedData.salt);
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );
        
        const encryptionKey = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
        
        // Decrypt secret key
        const iv = new Uint8Array(storedData.iv);
        const encryptedKey = new Uint8Array(storedData.encryptedKey);
        
        const decryptedKey = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            encryptionKey,
            encryptedKey
        );
        
        return new Uint8Array(decryptedKey);
    }

    /**
     * Clear stored keys
     */
    clearStoredKeys() {
        localStorage.removeItem(this.storageKey);
    }
}

// Export classes for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KyberEncryption, HybridEncryption, KeyManager };
} else if (typeof window !== 'undefined') {
    window.KyberEncryption = KyberEncryption;
    window.HybridEncryption = HybridEncryption;
    window.KeyManager = KeyManager;
} 