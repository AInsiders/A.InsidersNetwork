/**
 * Secure API Endpoint for Chatbot Token Management
 * SECURITY FIX: Proper server-side API key management
 * 
 * This demonstrates how to securely handle API keys:
 * 1. Store API keys in environment variables or secure vaults
 * 2. Require authentication before providing access
 * 3. Implement rate limiting and monitoring
 * 4. Never expose API keys in client-side code
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

class SecureApiEndpoint {
    constructor() {
        this.app = express();
        this.setupSecurityMiddleware();
        this.setupRateLimiting();
        this.setupRoutes();
    }

    setupSecurityMiddleware() {
        // Use helmet for security headers
        this.app.use(helmet());
        
        // Parse JSON bodies
        this.app.use(express.json({ limit: '10mb' }));
        
        // Session-based authentication middleware
        this.app.use(this.authenticateSession.bind(this));
    }

    setupRateLimiting() {
        // Rate limiting for API key requests
        const apiKeyLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 10, // Limit each user to 10 requests per window
            message: {
                error: 'Too many API key requests from this user, please try again later.'
            },
            standardHeaders: true,
            legacyHeaders: false,
        });

        this.app.use('/api/secure/', apiKeyLimiter);
    }

    // Authentication middleware - verify user session
    authenticateSession(req, res, next) {
        // In a real application, this would check:
        // 1. Valid session cookies
        // 2. User authentication status
        // 3. User permissions for chatbot access
        
        const sessionToken = req.headers['x-session-token'] || req.cookies?.sessionToken;
        
        if (!sessionToken) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please log in to access this service'
            });
        }

        // Validate session token (placeholder - implement real validation)
        if (!this.isValidSession(sessionToken)) {
            return res.status(401).json({
                error: 'Invalid session',
                message: 'Your session has expired. Please log in again.'
            });
        }

        // Attach user info to request
        req.user = this.getUserFromSession(sessionToken);
        next();
    }

    isValidSession(sessionToken) {
        // Placeholder - implement real session validation
        // This should check against your session store
        return sessionToken && sessionToken.length > 10;
    }

    getUserFromSession(sessionToken) {
        // Placeholder - implement real user lookup
        return {
            id: 'user123',
            permissions: ['chatbot_access']
        };
    }

    setupRoutes() {
        // Secure endpoint to get chatbot API token
        this.app.get('/api/secure/chatbot-token', async (req, res) => {
            try {
                // Verify user has permission to use chatbot
                if (!req.user.permissions.includes('chatbot_access')) {
                    return res.status(403).json({
                        error: 'Insufficient permissions',
                        message: 'You do not have permission to access the chatbot service'
                    });
                }

                // Get API key from environment variables (NEVER hardcode)
                const apiKey = process.env.NURMO_API_KEY;
                
                if (!apiKey) {
                    console.error('NURMO_API_KEY environment variable not set');
                    return res.status(500).json({
                        error: 'Service configuration error',
                        message: 'Chatbot service is currently unavailable'
                    });
                }

                // Log the access for security monitoring
                console.log(`API key requested by user ${req.user.id} at ${new Date().toISOString()}`);

                // Return a short-lived token instead of the actual API key
                const shortLivedToken = this.generateShortLivedToken(apiKey, req.user.id);

                res.json({
                    token: shortLivedToken,
                    expiresIn: 3600, // 1 hour
                    message: 'Token generated successfully'
                });

            } catch (error) {
                console.error('Error generating chatbot token:', error);
                res.status(500).json({
                    error: 'Internal server error',
                    message: 'Failed to generate chatbot token'
                });
            }
        });

        // Health check endpoint
        this.app.get('/api/secure/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                user: req.user.id
            });
        });
    }

    generateShortLivedToken(apiKey, userId) {
        // In a real implementation, this would:
        // 1. Create a JWT token or similar
        // 2. Set appropriate expiration time
        // 3. Include user context and permissions
        // 4. Sign with a secret key
        
        // For demonstration purposes, return a placeholder
        // In production, this should be a proper token
        return `temp_token_${userId}_${Date.now()}`;
    }

    start(port = 3002) {
        this.app.listen(port, () => {
            console.log(`🔒 Secure API endpoint running on port ${port}`);
            console.log('Environment checks:');
            console.log(`  - NURMO_API_KEY: ${process.env.NURMO_API_KEY ? '✅ Set' : '❌ Missing'}`);
        });
    }
}

// Export for use in other applications
module.exports = SecureApiEndpoint;

// Start server if run directly
if (require.main === module) {
    const server = new SecureApiEndpoint();
    server.start();
}

/* 
SECURITY NOTES:

1. ENVIRONMENT VARIABLES:
   Set the API key as an environment variable:
   export NURMO_API_KEY="your-actual-api-key"

2. SESSION MANAGEMENT:
   Implement proper session management with:
   - Secure session storage
   - Session expiration
   - Session invalidation on logout

3. TOKEN MANAGEMENT:
   - Use short-lived tokens (1 hour or less)
   - Implement token refresh mechanisms
   - Log all token usage for monitoring

4. MONITORING:
   - Monitor API key usage
   - Alert on unusual patterns
   - Rate limit per user/session

5. DEPLOYMENT:
   - Use HTTPS in production
   - Implement proper CORS policies
   - Use secure session cookies
   - Regular security audits
*/