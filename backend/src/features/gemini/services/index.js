/**
 * Gemini Services Index
 * Central export point for all Gemini service modules
 * 
 * This module re-exports all functions from the domain-specific Gemini services:
 * - geminiWriterService.js - Article generation, headlines, keyword planning, blog writing
 * - geminiMediaService.js - Image generation, video generation, editing prompts
 * - geminiSeoService.js - SEO analysis, meta tags, content audits, search intent
 */

// Writer service exports
export {
  generateMetadata,
  generateOutline,
  generateSection,
  generateCTA,
  draftHeadlines,
  planKeywords,
  writeBlogPost,
  checkPlagiarism
} from './geminiWriterService.js';

// Media service exports
export {
  generateImage,
  editImage,
  composeVideoPrompt,
  generateVideo,
  composeEditingPrompt,
  generateAudio,
  decodeBase64,
  decodeAudioData
} from './geminiMediaService.js';

// SEO service exports
export {
  analyzeSEO,
  suggestMetaTags,
  generateContentAudit,
  classifySearchIntent,
  analyzeKeywordDensity,
  getSEORecommendations,
  scoreContentQuality
} from './geminiSeoService.js';
