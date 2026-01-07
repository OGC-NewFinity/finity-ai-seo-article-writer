/**
 * Gemini Shared Utilities
 * Common functions used across all Gemini service modules
 */

import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTIONS } from "../../../constants.js";

/**
 * Get API key from environment
 */
export const getApiKey = () => {
  try {
    return process.env.API_KEY;
  } catch (e) {
    console.warn("API_KEY not found in process.env");
    return null;
  }
};

/**
 * Get saved settings (for frontend compatibility)
 * Note: This uses localStorage which is not available in Node.js
 * This is a placeholder - in backend context, settings should come from database
 */
export const getSavedSettings = () => {
  // In backend, this should fetch from database or env vars
  // For now, default to gemini
  return { provider: 'gemini' };
};

/**
 * Get provider configuration
 */
export const getProviderConfig = () => {
  const settings = getSavedSettings();
  const provider = settings.provider || 'gemini';
  
  const configs = {
    gemini: { 
      key: getApiKey(), 
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
      const ai = new GoogleGenAI({ apiKey: config.key });
      const response = await ai.models.generateContent({
        model: config.model,
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          ...(jsonMode ? { responseMimeType: "application/json" } : {})
        }
      });
      return response.text;
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
    console.warn("Primary provider failed, attempting fallback to Gemini...", error);
    // Silent Fallback to Gemini if it's not the primary
    if (config.id !== 'gemini') {
      const ai = new GoogleGenAI({ apiKey: getApiKey() });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `[FALLBACK MODE] ${prompt}`,
        config: { systemInstruction: systemPrompt }
      });
      return response.text;
    }
    throw error;
  }
};

// Re-export SYSTEM_INSTRUCTIONS for convenience
export { SYSTEM_INSTRUCTIONS };
