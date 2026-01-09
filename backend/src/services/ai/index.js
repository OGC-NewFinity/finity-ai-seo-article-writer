/**
 * AI Services Index
 * 
 * @deprecated This file is deprecated. All AI provider services have been refactored to:
 * - backend/src/features/providers/[provider]/services/
 * 
 * New code should import from:
 * - backend/src/features/providers/gemini/ for Gemini services
 * - backend/src/features/providers/openai/ for OpenAI services (when implemented)
 * - backend/src/features/providers/index.js for all providers
 * 
 * IMPORTANT: The new service functions require userId as the first parameter.
 * All token tracking and error logging is now handled within the service functions.
 * 
 * Shared utilities are still available from:
 * - backend/src/services/ai/gemini.shared.js
 * 
 * This file is maintained for backward compatibility but will be removed in a future version.
 */

// Re-export shared utilities (still used by provider services)
export {
  callAI,
  cleanAIOutput,
  getApiKey,
  getSavedSettings,
  getProviderConfig,
  SYSTEM_INSTRUCTIONS
} from './gemini.shared.js';

// Note: Direct service exports removed - use backend/src/features/providers/gemini/ instead
// The new services require userId as first parameter and handle tracking/logging internally
