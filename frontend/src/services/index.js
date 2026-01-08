/**
 * Services Index
 * Central export point for all frontend services
 * 
 * This module provides a unified interface for accessing all domain-specific services
 * in the frontend application. Services are organized by domain (Articles, Media, SEO)
 * and exported through this centralized barrel file.
 * 
 * @module services
 * 
 * @description
 * The services index consolidates exports from:
 * - Article generation services (geminiArticleService.js)
 * - Media generation services (geminiMediaService.js)
 * - SEO analysis services (geminiSeoService.js)
 * - Research and analysis services (geminiResearchService.js)
 * 
 * All services use the shared API client (api.js) configured with authentication
 * interceptors and error handling.
 * 
 * @example
 * // Import specific functions from the services module
 * import { generateMetadata, generateImage, analyzeSEO } from '@/services';
 * 
 * // Or import from specific service files
 * import { generateMetadata } from '@/services/geminiArticleService.js';
 */

// Article generation services
export {
  generateMetadata,
  generateOutline,
  generateSection,
  generateCTA,
  checkPlagiarism
} from './geminiArticleService.js';

// Media generation services
export {
  generateImage,
  editImage,
  generateVideo,
  generateAudio,
  decodeBase64,
  decodeAudioData
} from './geminiMediaService.js';

// SEO analysis services
export {
  analyzeSEO,
  getSEOSuggestions,
  performSEOAudit
} from './geminiSeoService.js';

// Research and analysis services
export {
  transcribeAudio,
  summarizeVideo,
  performResearch
} from './geminiResearchService.js';

// Feedback services
export {
  submitFeedback,
  getFeedbackStats,
  getRecommendedProvider,
  getUserFeedback
} from './feedbackService.js';