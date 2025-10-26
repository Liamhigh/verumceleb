# Environment Configuration

## Setup

1. **Copy the template:**
   ```bash
   cp config.template.js config.js
   ```

2. **Add your API keys to `config.js`:**
   ```javascript
   window.VERUM_ENV = {
     OPENAI_API_KEY: 'sk-proj-your-actual-key-here',
     OPENAI_MODEL: 'gpt-4o-mini',  // or 'gpt-4o' for higher quality
     ANCHOR: 'local',  // or 'ethereum' / 'polygon' for blockchain
     RPC_URL: '',  // Required if using blockchain
     PRIVATE_KEY: ''  // Required if using blockchain
   };
   ```

3. **Never commit `config.js`** - it's already in `.gitignore`

## Features Enabled

### With OpenAI API Key:
- ✅ **Real LLM Chat** - Natural conversations powered by GPT-4o-mini
- ✅ **Smart Document Analysis** - AI-powered verification in LLMChecker
- ✅ **Context-Aware Responses** - Understands conversation history

### Without API Key (Dev Mode):
- ✅ **Pattern-Based Chat** - Local rule-based responses
- ✅ **Basic Verification** - Heuristic + statistical checks only
- ✅ **All Core Features** - Hash, seal, anchor still work perfectly

## Security Notes

⚠️ **IMPORTANT:**
- `config.js` contains sensitive API keys
- Never commit it to version control
- Never share it publicly
- For production, consider environment variables or secure key management

## Cost Optimization

Using `gpt-4o-mini` (default):
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens
- Typical verification: ~$0.001 per document
- Typical chat exchange: ~$0.0002

To use higher quality model:
```javascript
OPENAI_MODEL: 'gpt-4o'  // ~10x more expensive but better reasoning
```

## Blockchain Configuration (Optional)

For on-chain anchoring:
```javascript
window.VERUM_ENV = {
  // ... OpenAI config ...
  ANCHOR: 'polygon',  // Cheaper than Ethereum
  RPC_URL: 'https://polygon-rpc.com',
  PRIVATE_KEY: '0x...'  // ⚠️ Use dedicated wallet with minimal funds
};
```

⚠️ **Blockchain Warning:**
- Only use a dedicated wallet
- Keep minimal funds (< $5)
- Never reuse this key elsewhere
- Transactions cost real money

## Troubleshooting

### "No config.js - using dev mode"
- Normal if you haven't created config.js yet
- All features work in dev mode (no API calls)

### "LLM API error"
- Check your API key is valid
- Verify you have credits in OpenAI account
- Check network connectivity

### CORS errors
- OpenAI API supports CORS from browsers
- If issues persist, consider using a serverless function proxy
