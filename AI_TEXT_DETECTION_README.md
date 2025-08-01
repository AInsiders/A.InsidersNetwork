# AI Text Detection Tool

A real AI-powered text detection tool that uses Hugging Face's inference API to detect AI-generated text with high accuracy.

## Features

- **Real AI Detection**: Uses actual AI models from Hugging Face for accurate detection
- **Multiple Models**: Tries multiple AI detection models for better accuracy
- **Fallback System**: Pattern-based detection when API is unavailable
- **API Key Support**: Optional API key for unlimited requests
- **Sample Testing**: Built-in sample texts for testing the tool
- **Detailed Analysis**: Comprehensive linguistic and pattern analysis
- **Real-time Feedback**: Live character and word count

## How to Use

### Basic Usage

1. Navigate to the AI Text Detection page
2. Enter or paste the text you want to analyze
3. Click "Analyze Text" to start the detection process
4. View the detailed results and confidence scores

### Using Sample Text

For quick testing, use the sample text buttons:
- **AI-Generated Text**: Sample text that should be detected as AI-generated
- **Human-Written Text**: Sample text that should be detected as human-written
- **Mixed Content**: Sample text with mixed characteristics

### API Key Setup (Optional)

For better accuracy and unlimited requests:

1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a free account if you don't have one
3. Generate a new API token
4. Enter the token in the "Hugging Face API Key" field
5. The tool will automatically use your API key for analysis

**Note**: Without an API key, the tool uses public endpoints with limited requests.

## How It Works

### API-Based Detection

The tool uses multiple AI models from Hugging Face:

1. **roberta-base-openai-detector**: Specialized in detecting AI-generated text
2. **microsoft/DialoGPT-medium**: General language model for text analysis
3. **facebook/opt-350m**: Alternative language model

The tool tries each model in sequence until one succeeds.

### Fallback Detection

When API calls fail, the tool falls back to pattern-based detection:

- **AI Indicators**: Formal phrases, repetitive patterns, academic language
- **Human Indicators**: Conversational fillers, personal opinions, natural speech patterns
- **Linguistic Analysis**: Vocabulary diversity, sentence structure, complexity

### Analysis Metrics

The tool provides detailed analysis including:

- **Text Statistics**: Word count, character count, sentence count
- **Linguistic Analysis**: Vocabulary diversity, repetition score, complexity
- **AI Detection Metrics**: Pattern consistency, semantic coherence, stylistic markers
- **Pattern Analysis**: Specific patterns detected in the text

## Technical Details

### API Endpoints

- **Base URL**: `https://api-inference.huggingface.co/models`
- **Timeout**: 30 seconds per request
- **Retry Logic**: 3 attempts per model
- **Rate Limiting**: Respects Hugging Face's rate limits

### Response Processing

The tool processes different response formats:
- Classification responses with labels and scores
- Object responses with probability distributions
- Array responses with multiple results

### Error Handling

- Graceful fallback to pattern-based detection
- Clear error messages for users
- Console logging for debugging
- Timeout protection for API calls

## Browser Compatibility

- Modern browsers with ES6+ support
- Fetch API support required
- AbortController support for timeout handling

## Privacy

- Text is sent to Hugging Face's servers for analysis
- No text is stored locally or on our servers
- API keys are stored only in browser memory
- HTTPS encryption for all API communications

## Troubleshooting

### Common Issues

1. **"API analysis failed"**: 
   - Check your internet connection
   - Verify your API key is correct
   - Try again later (API might be temporarily unavailable)

2. **"Public API unavailable"**:
   - The public endpoint might be overloaded
   - Consider getting a free API key
   - The tool will use pattern-based detection

3. **Slow analysis**:
   - API calls can take 10-30 seconds
   - Longer texts take more time
   - Network conditions affect speed

### Getting Help

- Check the browser console for detailed error messages
- Ensure you have a stable internet connection
- Try with shorter text samples first
- Consider using the pattern-based fallback for testing

## Future Improvements

- Support for more AI detection models
- Batch processing for multiple texts
- Export results to various formats
- Integration with other AI services
- Mobile app version

## License

This tool is part of the A.Insiders website and follows the same licensing terms. 