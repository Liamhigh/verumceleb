/**
 * Environment Configuration Template
 * 
 * Copy this file to config.js and fill in your API keys.
 * config.js is gitignored for security.
 */

window.VERUM_ENV = {
  // OpenAI API Key (for real LLM integration)
  // Get from: https://platform.openai.com/api-keys
  OPENAI_API_KEY: 'your-openai-api-key-here',
  
  // OpenAI Model (default: gpt-4o-mini for cost efficiency)
  OPENAI_MODEL: 'gpt-4o-mini',
  
  // Blockchain Anchoring (optional)
  // Options: 'ethereum', 'polygon', 'local' (default)
  ANCHOR: 'local',
  
  // RPC URL (required if ANCHOR is 'ethereum' or 'polygon')
  RPC_URL: '',
  
  // Private Key (required if ANCHOR is 'ethereum' or 'polygon')
  // WARNING: Only use a dedicated wallet with minimal funds
  PRIVATE_KEY: ''
};
