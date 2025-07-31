# NurmoAI Integration Fix

## Overview
This document outlines the fixes applied to integrate the NurmoAI API correctly into the A.Insiders website chatbot.

## Issues Fixed

### 1. Incorrect API Endpoint
- **Before:** `https://api.nurmonic.ai/v1/chat/completions`
- **After:** `https://api.nurmo.app/v1/chat/completions`

### 2. Updated API Key
- **Before:** `nu-bk9rWzqqpsgWmMS8TYo9uQEppGjG8lni9bcJKcu7GUUYColY`
- **After:** `nu-bVI8A2TPpxfwfxPP4oKrkvq5mlgwj8efUcQHstcoE8Knvs4M`

### 3. Added Character ID
- **Character ID:** `43413d25-073c-4f3d-8cf1-f1c98cfa00b3`

### 4. Corrected Request Format
According to the [NurmoAI documentation](https://docs.nurmo.app/introduction), the correct request format is:

```javascript
{
    messages: [
        { role: 'user', content: message }
    ],
    model: 'nurmo-3',
    character: '43413d25-073c-4f3d-8cf1-f1c98cfa00b3'
}
```

## Files Updated

### 1. `chatbot.js`
- Updated API endpoint to `https://api.nurmo.app/v1/chat/completions`
- Updated API key to the new one
- Added character ID parameter
- Simplified request format to match NurmoAI specifications
- Improved error handling with detailed error messages

### 2. `simple-chatbot.js`
- Updated API endpoint and key
- Added character ID parameter
- Simplified the complex multi-format testing approach
- Streamlined to use the correct NurmoAI format

### 3. `test-nurmoai.html` (New)
- Created a test page to verify the integration
- Includes API configuration display
- Provides real-time testing capability
- Shows detailed error messages for debugging

## How to Test

1. **Open the test page:**
   ```
   test-nurmoai.html
   ```

2. **The page will automatically test the API connection on load**

3. **Manual testing:**
   - Enter a message in the input field
   - Click "Send Test Message"
   - Check the response and console logs

## API Configuration

```javascript
const API_KEY = 'nu-bVI8A2TPpxfwfxPP4oKrkvq5mlgwj8efUcQHstcoE8Knvs4M';
const API_URL = 'https://api.nurmo.app/v1/chat/completions';
const CHARACTER_ID = '43413d25-073c-4f3d-8cf1-f1c98cfa00b3';
```

## Request Format

```javascript
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
```

## Response Handling

The API returns responses in the standard OpenAI format:

```javascript
{
    choices: [
        {
            message: {
                content: "AI response text here"
            }
        }
    ]
}
```

## Error Handling

The updated code includes comprehensive error handling:

- Network errors
- API authentication errors
- Invalid request format errors
- Response parsing errors

## Integration Notes

1. **Character-based responses:** The character ID ensures consistent personality and behavior
2. **Model specification:** Using `nurmo-3` model as specified in documentation
3. **Message format:** Simplified to single user message format
4. **Authentication:** Bearer token authentication with the new API key

## Troubleshooting

If you encounter issues:

1. **Check API key validity** - Ensure the key is active and has proper permissions
2. **Verify character ID** - Confirm the character ID exists and is accessible
3. **Check network connectivity** - Ensure the endpoint is reachable
4. **Review console logs** - Detailed error messages are logged for debugging

## Security Considerations

- API keys should be stored securely in production
- Consider using environment variables for sensitive data
- Implement rate limiting to prevent abuse
- Monitor API usage and costs

## Next Steps

1. Test the integration thoroughly
2. Deploy to production environment
3. Monitor performance and error rates
4. Consider implementing conversation history if needed
5. Add additional character customization options 