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

import { callAI, cleanAIOutput, SYSTEM_INSTRUCTIONS } from '../../../../services/ai/gemini.shared.js';
import { trackTokenUsage, estimateTokens } from '../../../../services/tokenTracking.service.js';
import { logGenerationFailure } from '../../../../services/generationFailure.service.js';

const PROVIDER = 'gemini';
const MODEL = 'gemini-3-pro-preview';

/**
 * Analyze SEO for content
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} content - Content to analyze
 * @param {string[]} keywords - Target keywords for the content
 * @returns {Promise<Object>} SEO analysis results with recommendations and scores
 */
export const analyzeSEO = async (userId, content, keywords) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: keywordDensity (object), readabilityScore (number 0-100), recommendations (array of strings), metaSuggestions (object), and overallScore (number 0-100).`;
    const prompt = `SEO audit for keywords: ${keywords.join(', ')}. Content: ${content.substring(0, 5000)}`;
    
    const inputText = `${content.substring(0, 5000)} ${keywords.join(' ')}`;
    tokensUsed = estimateTokens(inputText) * 2;
    
    const text = await callAI(prompt, systemPrompt, true);
    const result = JSON.parse(cleanAIOutput(text) || '{}');
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'seo_analysis', {
      provider: PROVIDER,
      model: MODEL,
      service: 'seo_analysis',
      requestDetails: {
        keywords: keywords.join(', '),
        contentLength: content.length,
        duration: Date.now() - startTime
      }
    });
    
    return result;
  } catch (error) {
    await logGenerationFailure(userId, 'seo_analysis', error, {
      provider: PROVIDER,
      model: MODEL,
      tokensUsed,
      inputSnippet: JSON.stringify({ content: content.substring(0, 500), keywords }).substring(0, 500),
      requestDetails: {
        duration: Date.now() - startTime,
        tokensUsed
      }
    }).catch(() => {
      // Silently fail - failure logging should not break error propagation
    });
    
    throw error;
  }
};

/**
 * Generate meta tag suggestions
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} content - Content to generate meta tags for
 * @param {string} focusKeyphrase - Primary focus keyphrase
 * @param {string} title - Current or suggested page title
 * @returns {Promise<Object>} Meta tag suggestions including title, description, keywords, and Open Graph tags
 */
export const suggestMetaTags = async (userId, content, focusKeyphrase, title) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: title (optimized title, 50-60 chars), metaDescription (150-160 chars), keywords (array of 5-10 relevant keywords), ogTitle (Open Graph title), ogDescription (Open Graph description), ogImage (suggested image description), and twitterCard (Twitter card type suggestion).`;
    const prompt = `Generate SEO-optimized meta tags for:\nTitle: "${title}"\nFocus Keyphrase: "${focusKeyphrase}"\nContent: ${content.substring(0, 3000)}`;
    
    const inputText = `${content.substring(0, 3000)} ${focusKeyphrase} ${title || ''}`;
    tokensUsed = estimateTokens(inputText) * 2;
    
    const text = await callAI(prompt, systemPrompt, true);
    const result = JSON.parse(cleanAIOutput(text) || '{}');
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'meta_tag_generation', {
      provider: PROVIDER,
      model: MODEL,
      service: 'meta_tag_generation',
      requestDetails: {
        focusKeyphrase,
        duration: Date.now() - startTime
      }
    });
    
    return result;
  } catch (error) {
    await logGenerationFailure(userId, 'meta_tag_generation', error, {
      provider: PROVIDER,
      model: MODEL,
      tokensUsed,
      inputSnippet: JSON.stringify({ content: content.substring(0, 500), focusKeyphrase, title }).substring(0, 500),
      requestDetails: {
        duration: Date.now() - startTime,
        tokensUsed
      }
    }).catch(() => {
      // Silently fail - failure logging should not break error propagation
    });
    
    throw error;
  }
};

/**
 * Generate content audit summary
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} content - Content to audit
 * @param {string[]} keywords - Target keywords
 * @param {string} focusKeyphrase - Primary focus keyphrase
 * @returns {Promise<Object>} Content audit summary with scores, issues, and recommendations
 */
export const generateContentAudit = async (userId, content, keywords, focusKeyphrase) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: summary (executive summary string), overallScore (number 0-100), strengths (array of strings), weaknesses (array of strings), issues (array of objects with: type, severity, description, recommendation), keywordAnalysis (object with keyword usage details), readabilityScore (number 0-100), and recommendations (prioritized array of action items).`;
    const prompt = `Perform a comprehensive SEO content audit for:\nFocus Keyphrase: "${focusKeyphrase}"\nKeywords: ${keywords.join(', ')}\nContent: ${content.substring(0, 8000)}`;
    
    const inputText = `${content.substring(0, 8000)} ${focusKeyphrase} ${keywords?.join(' ') || ''}`;
    tokensUsed = estimateTokens(inputText) * 3;
    
    const text = await callAI(prompt, systemPrompt, true);
    const result = JSON.parse(cleanAIOutput(text) || '{}');
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'content_audit', {
      provider: PROVIDER,
      model: MODEL,
      service: 'content_audit',
      requestDetails: {
        focusKeyphrase,
        contentLength: content.length,
        duration: Date.now() - startTime
      }
    });
    
    return result;
  } catch (error) {
    await logGenerationFailure(userId, 'content_audit', error, {
      provider: PROVIDER,
      model: MODEL,
      tokensUsed,
      inputSnippet: JSON.stringify({ content: content.substring(0, 500), keywords, focusKeyphrase }).substring(0, 500),
      requestDetails: {
        duration: Date.now() - startTime,
        tokensUsed
      }
    }).catch(() => {
      // Silently fail - failure logging should not break error propagation
    });
    
    throw error;
  }
};

/**
 * Classify search intent
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} query - Search query or content topic
 * @returns {Promise<Object>} Search intent classification with intent type, confidence, and recommendations
 */
export const classifySearchIntent = async (userId, query) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: intent (one of: "informational", "navigational", "transactional", "commercial"), confidence (number 0-1), explanation (string explaining the classification), and contentRecommendations (array of strings suggesting content types that match this intent).`;
    const prompt = `Classify the search intent for this query: "${query}"`;
    
    tokensUsed = estimateTokens(query) * 2;
    
    const text = await callAI(prompt, systemPrompt, true);
    const result = JSON.parse(cleanAIOutput(text) || '{}');
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'search_intent_classification', {
      provider: PROVIDER,
      model: MODEL,
      service: 'search_intent_classification',
      requestDetails: {
        query: query.substring(0, 100),
        duration: Date.now() - startTime
      }
    });
    
    return result;
  } catch (error) {
    await logGenerationFailure(userId, 'search_intent_classification', error, {
      provider: PROVIDER,
      model: MODEL,
      tokensUsed,
      inputSnippet: query.substring(0, 500),
      requestDetails: {
        duration: Date.now() - startTime,
        tokensUsed
      }
    }).catch(() => {
      // Silently fail - failure logging should not break error propagation
    });
    
    throw error;
  }
};

/**
 * Analyze keyword density and distribution
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} content - Content to analyze
 * @param {string[]} keywords - Keywords to check density for
 * @returns {Promise<Object>} Keyword density analysis with counts, percentages, and recommendations
 */
export const analyzeKeywordDensity = async (userId, content, keywords) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: keywordDensity (object where each key is a keyword and value is an object with: count, percentage, distribution (array of positions), and status ("optimal", "underused", "overused")), overallRecommendation (string), and suggestedDensity (object with ideal percentages for each keyword).`;
    const prompt = `Analyze keyword density for:\nKeywords: ${keywords.join(', ')}\nContent: ${content.substring(0, 5000)}`;
    
    const inputText = `${content.substring(0, 5000)} ${keywords.join(' ')}`;
    tokensUsed = estimateTokens(inputText) * 2;
    
    const text = await callAI(prompt, systemPrompt, true);
    const result = JSON.parse(cleanAIOutput(text) || '{}');
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'keyword_density_analysis', {
      provider: PROVIDER,
      model: MODEL,
      service: 'keyword_density_analysis',
      requestDetails: {
        keywords: keywords.join(', '),
        contentLength: content.length,
        duration: Date.now() - startTime
      }
    });
    
    return result;
  } catch (error) {
    await logGenerationFailure(userId, 'keyword_density_analysis', error, {
      provider: PROVIDER,
      model: MODEL,
      tokensUsed,
      inputSnippet: JSON.stringify({ content: content.substring(0, 500), keywords }).substring(0, 500),
      requestDetails: {
        duration: Date.now() - startTime,
        tokensUsed
      }
    }).catch(() => {
      // Silently fail - failure logging should not break error propagation
    });
    
    throw error;
  }
};

/**
 * Generate SEO recommendations for content improvement
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} content - Content to get recommendations for
 * @param {string[]} keywords - Target keywords
 * @param {string} focusKeyphrase - Primary focus keyphrase
 * @returns {Promise<Object>} SEO recommendations with prioritized action items
 */
export const getSEORecommendations = async (userId, content, keywords, focusKeyphrase) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: recommendations (array of objects with: priority ("high", "medium", "low"), category (string), issue (string), recommendation (string), and impact ("high", "medium", "low")), overallScore (number 0-100), and quickWins (array of easy-to-implement recommendations).`;
    const prompt = `Provide SEO improvement recommendations for:\nFocus Keyphrase: "${focusKeyphrase}"\nKeywords: ${keywords.join(', ')}\nContent: ${content.substring(0, 5000)}`;
    
    const inputText = `${content.substring(0, 5000)} ${focusKeyphrase} ${keywords.join(' ')}`;
    tokensUsed = estimateTokens(inputText) * 2;
    
    const text = await callAI(prompt, systemPrompt, true);
    const result = JSON.parse(cleanAIOutput(text) || '{}');
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'seo_recommendations', {
      provider: PROVIDER,
      model: MODEL,
      service: 'seo_recommendations',
      requestDetails: {
        focusKeyphrase,
        contentLength: content.length,
        duration: Date.now() - startTime
      }
    });
    
    return result;
  } catch (error) {
    await logGenerationFailure(userId, 'seo_recommendations', error, {
      provider: PROVIDER,
      model: MODEL,
      tokensUsed,
      inputSnippet: JSON.stringify({ content: content.substring(0, 500), keywords, focusKeyphrase }).substring(0, 500),
      requestDetails: {
        duration: Date.now() - startTime,
        tokensUsed
      }
    }).catch(() => {
      // Silently fail - failure logging should not break error propagation
    });
    
    throw error;
  }
};

/**
 * Score content quality for SEO
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} content - Content to score
 * @param {string} focusKeyphrase - Primary focus keyphrase
 * @param {Object} metadata - Optional metadata (title, description, url structure, etc.)
 * @returns {Promise<Object>} Content quality score with breakdown by factors
 */
export const scoreContentQuality = async (userId, content, focusKeyphrase, metadata = {}) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: overallScore (number 0-100), scores (object with: keywordOptimization (0-100), readability (0-100), structure (0-100), metaTags (0-100), contentDepth (0-100), and uniqueness (0-100)), strengths (array of strings), weaknesses (array of strings), and improvementPriorities (array of strings).`;
    const prompt = `Score the SEO quality of this content:\nFocus Keyphrase: "${focusKeyphrase}"\nMetadata: ${JSON.stringify(metadata)}\nContent: ${content.substring(0, 5000)}`;
    
    const inputText = `${content.substring(0, 5000)} ${focusKeyphrase} ${JSON.stringify(metadata || {})}`;
    tokensUsed = estimateTokens(inputText) * 2;
    
    const text = await callAI(prompt, systemPrompt, true);
    const result = JSON.parse(cleanAIOutput(text) || '{}');
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'content_quality_scoring', {
      provider: PROVIDER,
      model: MODEL,
      service: 'content_quality_scoring',
      requestDetails: {
        focusKeyphrase,
        contentLength: content.length,
        duration: Date.now() - startTime
      }
    });
    
    return result;
  } catch (error) {
    await logGenerationFailure(userId, 'content_quality_scoring', error, {
      provider: PROVIDER,
      model: MODEL,
      tokensUsed,
      inputSnippet: JSON.stringify({ content: content.substring(0, 500), focusKeyphrase, metadata }).substring(0, 500),
      requestDetails: {
        duration: Date.now() - startTime,
        tokensUsed
      }
    }).catch(() => {
      // Silently fail - failure logging should not break error propagation
    });
    
    throw error;
  }
};
