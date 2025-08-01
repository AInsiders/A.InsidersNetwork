/**
 * Encryption Demo - Base64 vs Real Encryption
 * This script demonstrates the difference between simple encoding and real cryptography
 */

// Include the enhanced crypto library
// Note: This assumes enhanced-crypto.js is available
// const EnhancedCrypto = require('./enhanced-crypto.js');

class EncryptionDemo {
  constructor() {
    this.crypto = new EnhancedCrypto();
  }

  // Demo 1: Base64 vs AES-256-GCM
  async demoBase64VsAES() {
    console.log("🔍 DEMO 1: Base64 vs AES-256-GCM");
    console.log("=" .repeat(50));
    
    const secretMessage = "This is a secret message that needs protection!";
    const password = "mySuperSecretPassword123!";
    
    // Base64 (NOT encryption)
    console.log("\n📝 Base64 Encoding (NOT Encryption):");
    const base64Encoded = btoa(secretMessage);
    console.log(`Original: "${secretMessage}"`);
    console.log(`Base64:   "${base64Encoded}"`);
    console.log(`Decoded:  "${atob(base64Encoded)}"`);
    console.log("❌ Anyone can decode this without any key!");
    
    // Real AES-256-GCM Encryption
    console.log("\n🔐 Real AES-256-GCM Encryption:");
    try {
      const salt = this.crypto.getRandomBytes(16);
      const key = await this.crypto.deriveKey(password, salt, 'PBKDF2');
      const result = await this.crypto.encryptSymmetric(secretMessage, key, 'AES-256-GCM');
      
      const combined = this.crypto.concat(salt, result.iv, result.ciphertext);
      const encrypted = this.crypto.toBase64(combined);
      
      console.log(`Original:  "${secretMessage}"`);
      console.log(`Encrypted: "${encrypted.substring(0, 50)}..."`);
      console.log(`✅ This cannot be decrypted without the password!`);
      
      // Decrypt to show it works
      const decrypted = await this.decryptAES(encrypted, password);
      console.log(`Decrypted: "${decrypted}"`);
      
    } catch (error) {
      console.error("Encryption error:", error);
    }
  }

  // Demo 2: Different Encryption Algorithms
  async demoDifferentAlgorithms() {
    console.log("\n\n🔍 DEMO 2: Different Encryption Algorithms");
    console.log("=" .repeat(50));
    
    const testData = "Hello, World!";
    const password = "testPassword";
    
    const algorithms = [
      { name: 'AES-256-GCM', desc: 'Authenticated Encryption' },
      { name: 'AES-256-CBC', desc: 'Block Cipher Mode' },
      { name: 'ChaCha20-Poly1305', desc: 'Stream Cipher' }
    ];
    
    for (const algo of algorithms) {
      try {
        console.log(`\n🔐 ${algo.name} (${algo.desc}):`);
        
        const salt = this.crypto.getRandomBytes(16);
        const key = await this.crypto.deriveKey(password, salt, 'PBKDF2');
        const result = await this.crypto.encryptSymmetric(testData, key, algo.name);
        
        const combined = this.crypto.concat(salt, result.iv || result.nonce, result.ciphertext);
        const encrypted = this.crypto.toBase64(combined);
        
        console.log(`  Input:  "${testData}"`);
        console.log(`  Output: "${encrypted.substring(0, 30)}..."`);
        console.log(`  Length: ${encrypted.length} characters`);
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
  }

  // Demo 3: Key Derivation Functions
  async demoKeyDerivation() {
    console.log("\n\n🔍 DEMO 3: Key Derivation Functions");
    console.log("=" .repeat(50));
    
    const password = "myPassword";
    const salt = this.crypto.getRandomBytes(16);
    
    const kdfs = [
      { name: 'PBKDF2', desc: 'Standard KDF' },
      { name: 'scrypt', desc: 'Memory-hard KDF' },
      { name: 'Argon2id', desc: 'Modern KDF' }
    ];
    
    for (const kdf of kdfs) {
      try {
        console.log(`\n🔑 ${kdf.name} (${kdf.desc}):`);
        
        const startTime = performance.now();
        const key = await this.crypto.deriveKey(password, salt, kdf.name);
        const endTime = performance.now();
        
        const keyBase64 = this.crypto.toBase64(key);
        console.log(`  Key: "${keyBase64.substring(0, 30)}..."`);
        console.log(`  Time: ${(endTime - startTime).toFixed(2)}ms`);
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
  }

  // Demo 4: Asymmetric Encryption
  async demoAsymmetricEncryption() {
    console.log("\n\n🔍 DEMO 4: Asymmetric Encryption (RSA)");
    console.log("=" .repeat(50));
    
    const message = "Secret message for asymmetric encryption";
    
    try {
      // Generate RSA key pair
      console.log("🔑 Generating RSA-4096 key pair...");
      const keyPair = await this.crypto.generateKeyPair('RSA-OAEP', { modulusLength: 4096 });
      
      const publicKeyB64 = this.crypto.toBase64(await crypto.subtle.exportKey('spki', keyPair.publicKey));
      const privateKeyB64 = this.crypto.toBase64(await crypto.subtle.exportKey('pkcs8', keyPair.privateKey));
      
      console.log(`Public Key:  "${publicKeyB64.substring(0, 50)}..."`);
      console.log(`Private Key: "${privateKeyB64.substring(0, 50)}..."`);
      
      // Encrypt with public key
      console.log("\n🔒 Encrypting with public key...");
      const result = await this.crypto.encryptAsymmetric(message, keyPair.publicKey, 'RSA-OAEP');
      const encrypted = this.crypto.toBase64(result.ciphertext);
      
      console.log(`Message:   "${message}"`);
      console.log(`Encrypted: "${encrypted.substring(0, 50)}..."`);
      console.log("✅ Only the private key can decrypt this!");
      
      // Decrypt with private key
      console.log("\n🔓 Decrypting with private key...");
      const decrypted = await this.decryptRSA(encrypted, privateKeyB64);
      console.log(`Decrypted: "${decrypted}"`);
      
    } catch (error) {
      console.error("Asymmetric encryption error:", error);
    }
  }

  // Demo 5: Digital Signatures
  async demoDigitalSignatures() {
    console.log("\n\n🔍 DEMO 5: Digital Signatures");
    console.log("=" .repeat(50));
    
    const document = "Important document that needs to be signed";
    
    try {
      // Generate Ed25519 key pair for signatures
      console.log("🔑 Generating Ed25519 signature key pair...");
      const keyPair = await this.crypto.generateKeyPair('Ed25519');
      
      // Sign the document
      console.log("\n✍️ Signing document...");
      const signature = await this.crypto.sign(document, keyPair.privateKey, 'Ed25519');
      const signatureB64 = this.crypto.toBase64(signature.signature);
      
      console.log(`Document: "${document}"`);
      console.log(`Signature: "${signatureB64}"`);
      console.log("✅ Anyone can verify this signature with the public key!");
      
      // Verify the signature
      console.log("\n✅ Verifying signature...");
      const isValid = await crypto.subtle.verify(
        { name: 'Ed25519' },
        keyPair.publicKey,
        signature.signature,
        this.crypto.enc.encode(document)
      );
      
      console.log(`Signature valid: ${isValid ? '✅ YES' : '❌ NO'}`);
      
      // Try to verify with tampered document
      console.log("\n🔍 Testing with tampered document...");
      const tamperedDoc = "Important document that has been tampered with";
      const isValidTampered = await crypto.subtle.verify(
        { name: 'Ed25519' },
        keyPair.publicKey,
        signature.signature,
        this.crypto.enc.encode(tamperedDoc)
      );
      
      console.log(`Tampered document valid: ${isValidTampered ? '✅ YES' : '❌ NO'}`);
      
    } catch (error) {
      console.error("Digital signature error:", error);
    }
  }

  // Demo 6: Hash Functions
  async demoHashFunctions() {
    console.log("\n\n🔍 DEMO 6: Hash Functions");
    console.log("=" .repeat(50));
    
    const data = "Hello, World!";
    
    const hashAlgorithms = [
      { name: 'SHA-256', desc: 'Standard Hash' },
      { name: 'SHA-512', desc: 'High Security Hash' }
    ];
    
    for (const algo of hashAlgorithms) {
      try {
        console.log(`\n🔍 ${algo.name} (${algo.desc}):`);
        
        const hash = await this.crypto.hash(data, algo.name);
        const hashHex = Array.from(new Uint8Array(hash))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        console.log(`  Input: "${data}"`);
        console.log(`  Hash:  "${hashHex}"`);
        console.log(`  Length: ${hashHex.length} characters`);
        
        // Show that same input produces same hash
        const hash2 = await this.crypto.hash(data, algo.name);
        const hash2Hex = Array.from(new Uint8Array(hash2))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        console.log(`  Same input → Same hash: ${hashHex === hash2Hex ? '✅ YES' : '❌ NO'}`);
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
  }

  // Demo 7: Security Comparison
  async demoSecurityComparison() {
    console.log("\n\n🔍 DEMO 7: Security Comparison");
    console.log("=" .repeat(50));
    
    const testData = "Secret data";
    
    console.log("📊 Security Comparison Table:");
    console.log("Method".padEnd(20) + "Security".padEnd(15) + "Reversible".padEnd(12) + "Key Required");
    console.log("-".repeat(60));
    
    // Base64
    const base64 = btoa(testData);
    console.log("Base64".padEnd(20) + "None".padEnd(15) + "Yes".padEnd(12) + "No");
    
    // AES-256-GCM
    try {
      const salt = this.crypto.getRandomBytes(16);
      const key = await this.crypto.deriveKey("password", salt, 'PBKDF2');
      const result = await this.crypto.encryptSymmetric(testData, key, 'AES-256-GCM');
      console.log("AES-256-GCM".padEnd(20) + "Very High".padEnd(15) + "Yes".padEnd(12) + "Yes");
    } catch (error) {
      console.log("AES-256-GCM".padEnd(20) + "Very High".padEnd(15) + "Yes".padEnd(12) + "Yes (Error)");
    }
    
    // SHA-256
    try {
      const hash = await this.crypto.hash(testData, 'SHA-256');
      console.log("SHA-256".padEnd(20) + "High".padEnd(15) + "No".padEnd(12) + "No");
    } catch (error) {
      console.log("SHA-256".padEnd(20) + "High".padEnd(15) + "No".padEnd(12) + "No (Error)");
    }
  }

  // Helper methods for decryption
  async decryptAES(encryptedData, password) {
    try {
      const data = this.crypto.fromBase64(encryptedData);
      const salt = data.slice(0, 16);
      const iv = data.slice(16, 28);
      const ct = data.slice(28);
      
      const key = await this.crypto.deriveKey(password, salt, 'PBKDF2');
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        ct
      );
      
      return this.crypto.dec.decode(decrypted);
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  async decryptRSA(encryptedData, privateKeyB64) {
    try {
      const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        this.crypto.fromBase64(privateKeyB64),
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['decrypt']
      );
      
      const data = this.crypto.fromBase64(encryptedData);
      const decrypted = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        data
      );
      
      return this.crypto.dec.decode(decrypted);
    } catch (error) {
      throw new Error(`RSA decryption failed: ${error.message}`);
    }
  }

  // Run all demos
  async runAllDemos() {
    console.log("🚀 ENHANCED ENCRYPTION DEMO");
    console.log("Real cryptography beyond base64 encoding");
    console.log("=" .repeat(60));
    
    await this.demoBase64VsAES();
    await this.demoDifferentAlgorithms();
    await this.demoKeyDerivation();
    await this.demoAsymmetricEncryption();
    await this.demoDigitalSignatures();
    await this.demoHashFunctions();
    await this.demoSecurityComparison();
    
    console.log("\n\n🎉 Demo completed!");
    console.log("Key takeaways:");
    console.log("✅ Base64 is NOT encryption - it's just encoding");
    console.log("✅ Real encryption requires keys and is mathematically secure");
    console.log("✅ Different algorithms serve different purposes");
    console.log("✅ Always use appropriate security levels for your needs");
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EncryptionDemo;
} else if (typeof window !== 'undefined') {
  window.EncryptionDemo = EncryptionDemo;
}

// Run demo if this file is executed directly
if (typeof window !== 'undefined' && window.EnhancedCrypto) {
  const demo = new EncryptionDemo();
  demo.runAllDemos().catch(console.error);
} 