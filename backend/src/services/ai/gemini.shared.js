/**
 * Gemini Shared Utilities
 * Common functions used across all Gemini service modules
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_INSTRUCTIONS } from "../../constants.js";

/**
 * Get API key from environment
 * Returns the Gemini API key from environment variables
 */
export const getApiKey = () => {
  return process.env.GEMINI_API_KEY || null;
};

/**
 * Get saved settings (backend only)
 * SECURITY: Backend should only use environment variables for API keys.
 * Provider preference can come from database or default to env config.
 */
export const getSavedSettings = () => {
  // In backend, provider selection should come from database or default to env config
  const provider = process.env.DEFAULT_AI_PROVIDER || 'gemini';
  // SECURITY: Only return provider preference, never API keys from settings
  return { 
    provider
  };
};

/**
 * Get provider configuration
 * SECURITY: Returns configuration with API keys from environment variables ONLY.
 * Never falls back to settings or any other source for API keys.
 */
export const getProviderConfig = () => {
  const settings = getSavedSettings();
  const provider = settings.provider || 'gemini';
  
  const configs = {
    gemini: { 
      key: process.env.GEMINI_API_KEY || null, 
      baseUrl: 'https://generativelanguage.googleapis.com', 
      model: 'gemini-3-pro-preview' 
    },
    openai: { 
      // SECURITY: Only use environment variable, never fallback to settings
      key: process.env.OPENAI_API_KEY || null, 
      baseUrl: 'https://api.openai.com/v1/chat/completions', 
      model: 'gpt-4o' 
    },
    anthropic: { 
      // SECURITY: Only use environment variable, never fallback to settings
      key: process.env.ANTHROPIC_API_KEY || null, 
      baseUrl: 'https://api.anthropic.com/v1/messages', 
      model: 'claude-3-5-sonnet-latest' 
    },
    llama: { 
      // SECURITY: Only use environment variable, never fallback to settings
      key: process.env.GROQ_API_KEY || null, 
      baseUrl: 'https://api.groq.com/openai/v1/chat/completions', 
      model: 'llama-3.3-70b-versatile' 
    }
  };
  
  return { id: provider, ...configs[provider] };
};

/**
 * Clean AI output text
 */
export const cleanAIOutput = (text) => {
  if (!text) return "";
  let cleaned = text.replace(/```(?:html|markdown|xml|json)?\n?([\s\S]*?)\n?```/gi, '$1');
  cleaned = cleaned.replace(/^Sure,? here is the.*:?\n?/gi, '');
  cleaned = cleaned.replace(/^#+ .*\n/gi, ''); 
  return cleaned.trim();
};

/**
 * Generic AI caller with fallback support
 */
export const callAI = async (prompt, systemPrompt, jsonMode = false) => {
  const config = getProviderConfig();
  
  if (!config.key && config.id !== 'gemini') {
    throw new Error(`API Key missing for ${config.id}. Please configure in Settings.`);
  }

  try {
    if (config.id === 'gemini') {
      const genAI = new GoogleGenerativeAI(config.key);
      const model = genAI.getGenerativeModel({
        model: config.model,
        systemInstruction: systemPrompt,
        generationConfig: {
          ...(jsonMode ? { responseMimeType: "application/json" } : {})
        }
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    }

    // Fallback standard Fetch for other providers
    const isOpenAICompatible = ['openai', 'llama'].includes(config.id);
    
    const payload = isOpenAICompatible ? {
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      ...(jsonMode ? { response_format: { type: "json_object" } } : {})
    } : {
      model: config.model,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096
    };

    const headers = {
      'Content-Type': 'application/json',
      ...(config.id === 'openai' && { 'Authorization': `Bearer ${config.key}` }),
      ...(config.id === 'llama' && { 'Authorization': `Bearer ${config.key}` }),
      ...(config.id === 'anthropic' && { 
        'x-api-key': config.key, 
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true'
      })
    };

    const res = await fetch(config.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`Provider ${config.id} failed: ${res.statusText}`);
    
    const data = await res.json();
    if (config.id === 'anthropic') return data.content[0].text;
    return data.choices[0].message.content;

  } catch (error) {
    // Silent Fallback to Gemini if it's not the primary
    if (config.id !== 'gemini' && process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
        systemInstruction: systemPrompt
      });
      const result = await model.generateContent(`[FALLBACK MODE] ${prompt}`);
      const response = await result.response;
      return response.text();
    }
    throw error;
  }
};

// Re-export SYSTEM_INSTRUCTIONS for convenience
export { SYSTEM_INSTRUCTIONS };
