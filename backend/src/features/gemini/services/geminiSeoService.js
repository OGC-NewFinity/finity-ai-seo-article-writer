/**
 * Gemini SEO Service
 * Handles meta tag suggestions, content audit summaries, and search intent classification
 * 
 * This service provides functions for:
 * - SEO content analysis
 * - Meta tag optimization suggestions
 * - Content audit summaries
 * - Search intent classification
 * - Keyword optimization recommendations
 * - Content quality scoring
 */

import { callAI, cleanAIOutput, SYSTEM_INSTRUCTIONS } from '../../../services/ai/gemini.shared.js';

/**
 * Analyze SEO for content
 * 
 * @param {string} content - Content to analyze
 * @param {string[]} keywords - Target keywords for the content
 * @returns {Promise<Object>} SEO analysis results with recommendations and scores
 */
export const analyzeSEO = async (content, keywords) => {
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: keywordDensity (object), readabilityScore (number 0-100), recommendations (array of strings), metaSuggestions (object), and overallScore (number 0-100).`;
  const prompt = `SEO audit for keywords: ${keywords.join(', ')}. Content: ${content.substring(0, 5000)}`;
  
  const text = await callAI(prompt, systemPrompt, true);
  return JSON.parse(cleanAIOutput(text) || '{}');
};

/**
 * Generate meta tag suggestions
 * 
 * @param {string} content - Content to generate meta tags for
 * @param {string} focusKeyphrase - Primary focus keyphrase
 * @param {string} title - Current or suggested page title
 * @returns {Promise<Object>} Meta tag suggestions including title, description, keywords, and Open Graph tags
 */
export const suggestMetaTags = async (content, focusKeyphrase, title) => {
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: title (optimized title, 50-60 chars), metaDescription (150-160 chars), keywords (array of 5-10 relevant keywords), ogTitle (Open Graph title), ogDescription (Open Graph description), ogImage (suggested image description), and twitterCard (Twitter card type suggestion).`;
  const prompt = `Generate SEO-optimized meta tags for:\nTitle: "${title}"\nFocus Keyphrase: "${focusKeyphrase}"\nContent: ${content.substring(0, 3000)}`;
  
  const text = await callAI(prompt, systemPrompt, true);
  return JSON.parse(cleanAIOutput(text) || '{}');
};

/**
 * Generate content audit summary
 * 
 * @param {string} content - Content to audit
 * @param {string[]} keywords - Target keywords
 * @param {string} focusKeyphrase - Primary focus keyphrase
 * @returns {Promise<Object>} Content audit summary with scores, issues, and recommendations
 */
export const generateContentAudit = async (content, keywords, focusKeyphrase) => {
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: summary (executive summary string), overallScore (number 0-100), strengths (array of strings), weaknesses (array of strings), issues (array of objects with: type, severity, description, recommendation), keywordAnalysis (object with keyword usage details), readabilityScore (number 0-100), and recommendations (prioritized array of action items).`;
  const prompt = `Perform a comprehensive SEO content audit for:\nFocus Keyphrase: "${focusKeyphrase}"\nKeywords: ${keywords.join(', ')}\nContent: ${content.substring(0, 8000)}`;
  
  const text = await callAI(prompt, systemPrompt, true);
  return JSON.parse(cleanAIOutput(text) || '{}');
};

/**
 * Classify search intent
 * 
 * @param {string} query - Search query or content topic
 * @returns {Promise<Object>} Search intent classification with intent type, confidence, and recommendations
 */
export const classifySearchIntent = async (query) => {
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: intent (one of: "informational", "navigational", "transactional", "commercial"), confidence (number 0-1), explanation (string explaining the classification), and contentRecommendations (array of strings suggesting content types that match this intent).`;
  const prompt = `Classify the search intent for this query: "${query}"`;
  
  const text = await callAI(prompt, systemPrompt, true);
  return JSON.parse(cleanAIOutput(text) || '{}');
};

/**
 * Analyze keyword density and distribution
 * 
 * @param {string} content - Content to analyze
 * @param {string[]} keywords - Keywords to check density for
 * @returns {Promise<Object>} Keyword density analysis with counts, percentages, and recommendations
 */
export const analyzeKeywordDensity = async (content, keywords) => {
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: keywordDensity (object where each key is a keyword and value is an object with: count, percentage, distribution (array of positions), and status ("optimal", "underused", "overused")), overallRecommendation (string), and suggestedDensity (object with ideal percentages for each keyword).`;
  const prompt = `Analyze keyword density for:\nKeywords: ${keywords.join(', ')}\nContent: ${content.substring(0, 5000)}`;
  
  const text = await callAI(prompt, systemPrompt, true);
  return JSON.parse(cleanAIOutput(text) || '{}');
};

/**
 * Generate SEO recommendations for content improvement
 * 
 * @param {string} content - Content to get recommendations for
 * @param {string[]} keywords - Target keywords
 * @param {string} focusKeyphrase - Primary focus keyphrase
 * @returns {Promise<Object>} SEO recommendations with prioritized action items
 */
export const getSEORecommendations = async (content, keywords, focusKeyphrase) => {
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: recommendations (array of objects with: priority ("high", "medium", "low"), category (string), issue (string), recommendation (string), and impact ("high", "medium", "low")), overallScore (number 0-100), and quickWins (array of easy-to-implement recommendations).`;
  const prompt = `Provide SEO improvement recommendations for:\nFocus Keyphrase: "${focusKeyphrase}"\nKeywords: ${keywords.join(', ')}\nContent: ${content.substring(0, 5000)}`;
  
  const text = await callAI(prompt, systemPrompt, true);
  return JSON.parse(cleanAIOutput(text) || '{}');
};

/**
 * Score content quality for SEO
 * 
 * @param {string} content - Content to score
 * @param {string} focusKeyphrase - Primary focus keyphrase
 * @param {Object} metadata - Optional metadata (title, description, url structure, etc.)
 * @returns {Promise<Object>} Content quality score with breakdown by factors
 */
export const scoreContentQuality = async (content, focusKeyphrase, metadata = {}) => {
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: overallScore (number 0-100), scores (object with: keywordOptimization (0-100), readability (0-100), structure (0-100), metaTags (0-100), contentDepth (0-100), and uniqueness (0-100)), strengths (array of strings), weaknesses (array of strings), and improvementPriorities (array of strings).`;
  const prompt = `Score the SEO quality of this content:\nFocus Keyphrase: "${focusKeyphrase}"\nMetadata: ${JSON.stringify(metadata)}\nContent: ${content.substring(0, 5000)}`;
  
  const text = await callAI(prompt, systemPrompt, true);
  return JSON.parse(cleanAIOutput(text) || '{}');
};
