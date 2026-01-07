/**
 * Compatibility Re-export
 * This file maintains backward compatibility for frontend imports
 * All functionality has been moved to backend/src/services/ai/
 * 
 * @deprecated Use backend/src/services/ai/index.js for new imports
 */

// Re-export everything from the new modular structure
export {
  // Article functions
  generateMetadata,
  generateOutline,
  generateSection,
  generateCTA,
  checkPlagiarism,
  analyzeSEO,
  
  // Media functions
  generateImage,
  editImage,
  generateVideo,
  generateAudio,
  decodeBase64,
  decodeAudioData,
  
  // Research functions
  performResearch,
  
  // Shared utilities
  callAI,
  cleanAIOutput,
  getApiKey,
  getSavedSettings,
  getProviderConfig,
  SYSTEM_INSTRUCTIONS
} from './backend/src/services/ai/index.js';
