/**
 * Provider Utilities
 * Functions for AI provider logic, configuration, and model mappings
 * 
 * This module provides utilities for:
 * - Provider configuration management
 * - Model selection and mapping
 * - Provider settings retrieval
 * - API key resolution
 * 
 * @module utils/providerUtils
 */

/**
 * Get saved settings from localStorage
 * 
 * @returns {Object} Settings object with provider and API keys
 * 
 * @example
 * const settings = getSavedSettings();
 * // Returns: { provider: 'gemini', openaiKey: '...', claudeKey: '...', ... }
 */
export const getSavedSettings = () => {
  try {
    const saved = localStorage.getItem('nova_xfinity_settings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse saved settings:', e);
  }
  
  // Return default settings
  return {
    provider: 'gemini',
    openaiKey: '',
    claudeKey: '',
    llamaKey: '',
    focusKeyphrase: ''
  };
};

/**
 * Get provider configuration based on current settings
 * 
 * @returns {Object} Provider configuration with id, key, baseUrl, and model
 * 
 * @example
 * const config = getProviderConfig();
 * // Returns: { id: 'gemini', key: '...', baseUrl: '...', model: '...' }
 */
export const getProviderConfig = () => {
  const settings = getSavedSettings();
  const provider = settings.provider || 'gemini';
  
  const configs = {
    gemini: { 
      key: import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || process.env.API_KEY, 
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
 * Get API key for current provider
 * 
 * @returns {string|null} API key or null if not available
 * 
 * @example
 * const apiKey = getApiKey();
 * // Returns: 'AIza...' or null
 */
export const getApiKey = () => {
  try {
    const config = getProviderConfig();
    return config.key || null;
  } catch (e) {
    console.error('Failed to get API key:', e);
    return null;
  }
};

/**
 * Get model name for a specific provider
 * 
 * @param {string} providerId - Provider ID ('gemini', 'openai', 'anthropic', 'llama')
 * @returns {string|null} Model name or null if provider not found
 * 
 * @example
 * const model = getModelForProvider('gemini');
 * // Returns: 'gemini-3-pro-preview'
 */
export const getModelForProvider = (providerId) => {
  const modelMap = {
    gemini: 'gemini-3-pro-preview',
    openai: 'gpt-4o',
    anthropic: 'claude-3-5-sonnet-latest',
    llama: 'llama-3.3-70b-versatile'
  };
  
  return modelMap[providerId] || null;
};

/**
 * Get base URL for a specific provider
 * 
 * @param {string} providerId - Provider ID
 * @returns {string|null} Base URL or null if provider not found
 * 
 * @example
 * const baseUrl = getBaseUrlForProvider('openai');
 * // Returns: 'https://api.openai.com/v1/chat/completions'
 */
export const getBaseUrlForProvider = (providerId) => {
  const urlMap = {
    gemini: 'https://generativelanguage.googleapis.com',
    openai: 'https://api.openai.com/v1/chat/completions',
    anthropic: 'https://api.anthropic.com/v1/messages',
    llama: 'https://api.groq.com/openai/v1/chat/completions'
  };
  
  return urlMap[providerId] || null;
};

/**
 * Check if provider requires API key
 * 
 * @param {string} providerId - Provider ID
 * @returns {boolean} True if provider requires API key
 * 
 * @example
 * const requiresKey = requiresApiKey('openai');
 * // Returns: true
 */
export const requiresApiKey = (providerId) => {
  // Gemini can use native context system, others require API keys
  return providerId !== 'gemini';
};

/**
 * Validate provider API key format
 * 
 * @param {string} providerId - Provider ID
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if format is valid
 * 
 * @example
 * const isValid = validateApiKeyFormat('openai', 'sk-...');
 * // Returns: true
 */
export const validateApiKeyFormat = (providerId, apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') return false;
  
  const validators = {
    openai: (k) => /^sk-[a-zA-Z0-9]{32,}$/.test(k),
    anthropic: (k) => /^sk-ant-[a-zA-Z0-9-]{95,}$/.test(k),
    gemini: (k) => /^[A-Za-z0-9_-]{39}$/.test(k),
    llama: (k) => /^gsk_[a-zA-Z0-9]{32,}$/.test(k)
  };
  
  const validator = validators[providerId];
  return validator ? validator(apiKey) : false;
};

/**
 * Get fallback provider chain for a given provider
 * 
 * @param {string} providerId - Primary provider ID
 * @returns {string[]} Array of fallback provider IDs in order
 * 
 * @example
 * const fallbacks = getFallbackChain('openai');
 * // Returns: ['gemini', 'anthropic', 'llama']
 */
export const getFallbackChain = (providerId) => {
  const chains = {
    openai: ['gemini', 'anthropic', 'llama'],
    gemini: ['openai', 'anthropic'],
    anthropic: ['gemini', 'openai'],
    llama: ['openai', 'gemini']
  };
  
  return chains[providerId] || ['gemini'];
};
