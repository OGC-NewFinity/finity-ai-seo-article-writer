/**
 * AI Services Index
 * Central export point for all Gemini/AI service modules
 */

// Article generation functions
export {
  generateMetadata,
  generateOutline,
  generateSection,
  generateCTA,
  checkPlagiarism,
  analyzeSEO
} from './gemini.article.js';

// Media generation functions
export {
  generateImage,
  editImage,
  generateVideo,
  generateAudio,
  decodeBase64,
  decodeAudioData
} from './gemini.media.js';

// Research functions
export {
  performResearch
} from './gemini.research.js';

// Shared utilities (re-export for convenience)
export {
  callAI,
  cleanAIOutput,
  getApiKey,
  getSavedSettings,
  getProviderConfig,
  SYSTEM_INSTRUCTIONS
} from './gemini.shared.js';
