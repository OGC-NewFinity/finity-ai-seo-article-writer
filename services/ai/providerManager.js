/**
 * AI Provider Manager
 * Manages multi-provider AI service configuration and fallback
 */

const getSavedSettings = () => {
  const saved = localStorage.getItem('nova_xfinity_settings');
  return saved ? JSON.parse(saved) : { provider: 'gemini' };
};

export const getProviderConfig = () => {
  const settings = getSavedSettings();
  const provider = settings.provider || 'gemini';
  
  const configs = {
    gemini: { 
      key: process.env.API_KEY, 
      baseUrl: 'https://generativelanguage.googleapis.com', 
      model: 'gemini-3-pro-preview' 
    },
    openai: { 
      key: settings.openaiKey, 
      baseUrl: 'https://api.openai.com/v1/chat/completions', 
      model: 'gpt-4o' 
    },
    anthropic: { 
      key: settings.claudeKey, 
      baseUrl: 'https://api.anthropic.com/v1/messages', 
      model: 'claude-3-5-sonnet-latest' 
    },
    llama: { 
      key: settings.llamaKey, 
      baseUrl: 'https://api.groq.com/openai/v1/chat/completions', 
      model: 'llama-3.3-70b-versatile' 
    }
  };
  
  return { id: provider, ...configs[provider] };
};

export const getApiKey = () => {
  try {
    return process.env.API_KEY;
  } catch (e) {
    console.warn("API_KEY not found in process.env");
    return null;
  }
};
