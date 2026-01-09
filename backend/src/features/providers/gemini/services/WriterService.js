/**
 * Gemini Writer Service
 * Handles article generation, headline drafting, keyword planning, and blog writing
 * 
 * This service provides functions for:
 * - Article metadata generation (SEO title, slug, meta description)
 * - Article outline generation
 * - Section content generation
 * - Headline drafting
 * - Keyword planning
 * - Blog writing
 * - Plagiarism checking
 */

import { callAI, cleanAIOutput, SYSTEM_INSTRUCTIONS } from '../../../../services/ai/gemini.shared.js';
import { trackTokenUsage, estimateTokens } from '../../../../services/tokenTracking.service.js';
import { logGenerationFailure } from '../../../../services/generationFailure.service.js';

const PROVIDER = 'gemini';
const MODEL = 'gemini-3-pro-preview';

/**
 * Generate article metadata (SEO title, slug, meta description, featured image)
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} topic - Article topic
 * @param {string[]} keywords - Array of keywords
 * @param {string} articleType - Type of article (e.g., "Blog Post", "How-to Guide")
 * @param {string} language - Language code (e.g., "English (US)")
 * @param {string} articleSize - Target article size (e.g., "Medium (1,200-1,800 words)")
 * @param {string} pov - Point of view (e.g., "First Person", "Third Person")
 * @param {string} manualFocusKeyphrase - Manual focus keyphrase override
 * @param {string} imageStyle - Style for featured image (e.g., "Photorealistic")
 * @param {string} aspectRatio - Image aspect ratio (e.g., "16:9")
 * @param {string} sourceContext - Source context/RSS data
 * @param {string} category - Article category
 * @returns {Promise<Object>} Metadata object with focusKeyphrase, seoTitle, slug, metaDescription, and featuredImage
 */
export const generateMetadata = async (
  userId,
  topic,
  keywords,
  articleType,
  language,
  articleSize,
  pov,
  manualFocusKeyphrase,
  imageStyle,
  aspectRatio,
  sourceContext,
  category
) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: focusKeyphrase, seoTitle, slug, metaDescription, and featuredImage object.`;
    const prompt = `Topic: "${topic}"\nKeywords: "${keywords.join(', ')}"\nPOV: ${pov}\nType: ${articleType}\nSourceContext: ${sourceContext}\nManualFocus: ${manualFocusKeyphrase}`;
    
    const inputText = `${topic} ${keywords?.join(' ')} ${manualFocusKeyphrase || ''} ${sourceContext || ''}`;
    tokensUsed = estimateTokens(inputText) * 3;
    
    const text = await callAI(prompt, systemPrompt, true);
    const result = JSON.parse(cleanAIOutput(text) || '{}');
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'metadata_generation', {
      provider: PROVIDER,
      model: MODEL,
      service: 'article_metadata',
      requestDetails: {
        topic: topic?.substring(0, 100),
        articleType,
        duration: Date.now() - startTime
      }
    });
    
    return result;
  } catch (error) {
    await logGenerationFailure(userId, 'metadata_generation', error, {
      provider: PROVIDER,
      model: MODEL,
      tokensUsed,
      inputSnippet: JSON.stringify({ topic, keywords, articleType }).substring(0, 500),
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
 * Generate article outline (array of section headings)
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} topic - Article topic
 * @param {string[]} keywords - Array of keywords
 * @param {string} articleType - Type of article
 * @param {string} language - Language code
 * @param {string} articleSize - Target article size
 * @param {string} pov - Point of view
 * @param {string} sourceContext - Source context/RSS data
 * @param {string} category - Article category
 * @returns {Promise<string[]>} Array of section headings
 */
export const generateOutline = async (
  userId,
  topic,
  keywords,
  articleType,
  language,
  articleSize,
  pov,
  sourceContext,
  category
) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON array of section headings ONLY.`;
    const prompt = `Create an SEO outline for: "${topic}". Context: ${category}. Keywords: ${keywords.join(',')}`;
    
    const inputText = `${topic} ${keywords?.join(' ')} ${sourceContext || ''}`;
    tokensUsed = estimateTokens(inputText) * 2;
    
    const text = await callAI(prompt, systemPrompt, true);
    const result = JSON.parse(cleanAIOutput(text) || '[]');
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'outline_generation', {
      provider: PROVIDER,
      model: MODEL,
      service: 'article_outline',
      requestDetails: {
        topic: topic?.substring(0, 100),
        duration: Date.now() - startTime
      }
    });
    
    return result;
  } catch (error) {
    await logGenerationFailure(userId, 'outline_generation', error, {
      provider: PROVIDER,
      model: MODEL,
      tokensUsed,
      inputSnippet: JSON.stringify({ topic, keywords, articleType }).substring(0, 500),
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
 * Generate article section content
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} sectionTitle - Title of the section
 * @param {string} topic - Article topic
 * @param {string[]} keywords - Array of keywords
 * @param {string} tone - Writing tone
 * @param {string} articleType - Type of article
 * @param {string} language - Language code
 * @param {string} articleSize - Target article size
 * @param {string} pov - Point of view
 * @param {number} imageQuantity - Number of images for the section
 * @param {string} aspectRatio - Image aspect ratio
 * @param {string} imageStyle - Image style
 * @param {string} sourceContext - Source context/RSS data
 * @param {string} category - Article category
 * @returns {Promise<string>} Section content as markdown
 */
export const generateSection = async (
  userId,
  sectionTitle,
  topic,
  keywords,
  tone,
  articleType,
  language,
  articleSize,
  pov,
  imageQuantity,
  aspectRatio,
  imageStyle,
  sourceContext,
  category
) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    const systemPrompt = SYSTEM_INSTRUCTIONS;
    const prompt = `Write the content for the section: "${sectionTitle}". Topic: "${topic}". Type: "${articleType}". RSS_Data: "${sourceContext}"`;
    
    const inputText = `${sectionTitle} ${topic} ${keywords?.join(' ')} ${sourceContext || ''}`;
    tokensUsed = estimateTokens(inputText) * 5;
    
    const text = await callAI(prompt, systemPrompt, false);
    const result = cleanAIOutput(text);
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'section_generation', {
      provider: PROVIDER,
      model: MODEL,
      service: 'article_section',
      requestDetails: {
        sectionTitle,
        topic: topic?.substring(0, 100),
        duration: Date.now() - startTime
      }
    });
    
    return result;
  } catch (error) {
    await logGenerationFailure(userId, 'section_generation', error, {
      provider: PROVIDER,
      model: MODEL,
      tokensUsed,
      inputSnippet: JSON.stringify({ sectionTitle, topic, keywords }).substring(0, 500),
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
 * Generate CTA (Call to Action) content
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} topic - Article topic
 * @param {string[]} keywords - Array of keywords
 * @param {string} focusKeyphrase - Focus keyphrase for the article
 * @returns {Promise<string>} CTA content
 */
export const generateCTA = async (userId, topic, keywords, focusKeyphrase) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    const inputText = `${topic} ${keywords?.join(' ')} ${focusKeyphrase || ''}`;
    tokensUsed = estimateTokens(inputText) * 2;
    
    const text = await callAI(
      `Create a branded Nova‑XFinity AI CTA for topic: ${topic}. Keyphrase: ${focusKeyphrase}`,
      SYSTEM_INSTRUCTIONS,
      false
    );
    const result = cleanAIOutput(text);
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'cta_generation', {
      provider: PROVIDER,
      model: MODEL,
      service: 'article_cta',
      requestDetails: {
        topic: topic?.substring(0, 100),
        duration: Date.now() - startTime
      }
    });
    
    return result;
  } catch (error) {
    await logGenerationFailure(userId, 'cta_generation', error, {
      provider: PROVIDER,
      model: MODEL,
      tokensUsed,
      inputSnippet: JSON.stringify({ topic, keywords, focusKeyphrase }).substring(0, 500),
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
 * Draft multiple headline variations
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} topic - Article topic
 * @param {string} focusKeyphrase - Focus keyphrase
 * @param {number} count - Number of headline variations to generate (default: 5)
 * @returns {Promise<string[]>} Array of headline variations
 */
export const draftHeadlines = async (userId, topic, focusKeyphrase, count = 5) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON array of ${count} headline variations. Each headline should be engaging, SEO-optimized, and include the focus keyphrase naturally.`;
    const prompt = `Topic: "${topic}"\nFocus Keyphrase: "${focusKeyphrase}"\nGenerate ${count} compelling headline variations.`;
    
    const inputText = `${topic} ${focusKeyphrase || ''}`;
    tokensUsed = estimateTokens(inputText) * 2;
    
    const text = await callAI(prompt, systemPrompt, true);
    const result = JSON.parse(cleanAIOutput(text) || '[]');
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'headline_drafting', {
      provider: PROVIDER,
      model: MODEL,
      service: 'headline_drafting',
      requestDetails: {
        topic: topic?.substring(0, 100),
        count,
        duration: Date.now() - startTime
      }
    });
    
    return result;
  } catch (error) {
    await logGenerationFailure(userId, 'headline_drafting', error, {
      provider: PROVIDER,
      model: MODEL,
      tokensUsed,
      inputSnippet: JSON.stringify({ topic, focusKeyphrase, count }).substring(0, 500),
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
 * Plan keyword strategy for an article
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} topic - Article topic
 * @param {string[]} seedKeywords - Initial seed keywords
 * @returns {Promise<Object>} Keyword plan with primary, secondary, and long-tail keywords
 */
export const planKeywords = async (userId, topic, seedKeywords = []) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: primaryKeywords (array), secondaryKeywords (array), longTailKeywords (array), and keywordDensity (object with suggested densities).`;
    const prompt = `Topic: "${topic}"\nSeed Keywords: ${seedKeywords.join(', ')}\nCreate a comprehensive keyword strategy.`;
    
    const inputText = `${topic} ${seedKeywords?.join(' ') || ''}`;
    tokensUsed = estimateTokens(inputText) * 3;
    
    const text = await callAI(prompt, systemPrompt, true);
    const result = JSON.parse(cleanAIOutput(text) || '{}');
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'keyword_planning', {
      provider: PROVIDER,
      model: MODEL,
      service: 'keyword_planning',
      requestDetails: {
        topic: topic?.substring(0, 100),
        duration: Date.now() - startTime
      }
    });
    
    return result;
  } catch (error) {
    await logGenerationFailure(userId, 'keyword_planning', error, {
      provider: PROVIDER,
      model: MODEL,
      tokensUsed,
      inputSnippet: JSON.stringify({ topic, seedKeywords }).substring(0, 500),
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
 * Generate complete blog post content
 * 
 * @param {string} userId - User ID for tracking
 * @param {Object} articleData - Article data including topic, outline, sections, etc.
 * @returns {Promise<string>} Complete blog post content in markdown format
 */
export const writeBlogPost = async (userId, articleData) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    const { topic, outline, sections, metadata } = articleData;
    
    const systemPrompt = SYSTEM_INSTRUCTIONS;
    const prompt = `Write a complete blog post for topic: "${topic}". 
    Use this outline: ${JSON.stringify(outline)}.
    Incorporate these sections: ${JSON.stringify(sections)}.
    Style: Professional, engaging, SEO-optimized.
    Include proper markdown formatting.`;
    
    const inputText = `${topic} ${JSON.stringify(outline)} ${JSON.stringify(sections)}`;
    tokensUsed = estimateTokens(inputText) * 10;
    
    const text = await callAI(prompt, systemPrompt, false);
    const result = cleanAIOutput(text);
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'article_generation', {
      provider: PROVIDER,
      model: MODEL,
      service: 'article_generation',
      requestDetails: {
        topic: topic?.substring(0, 100),
        duration: Date.now() - startTime
      }
    });
    
    return result;
  } catch (error) {
    await logGenerationFailure(userId, 'article_generation', error, {
      provider: PROVIDER,
      model: MODEL,
      tokensUsed,
      inputSnippet: JSON.stringify({ topic: articleData.topic }).substring(0, 500),
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
 * Check content for plagiarism
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} content - Content to check for plagiarism
 * @returns {Promise<Object>} Plagiarism check results with originality score and flagged sections
 */
export const checkPlagiarism = async (userId, content) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: originalityScore (0-100), isOriginal (boolean), flaggedSections (array of objects with text and similarity), and recommendations (array of strings).`;
    const prompt = `Scan for originality and potential plagiarism in this content: ${content.substring(0, 5000)}`;
    
    tokensUsed = estimateTokens(content) * 2;
    
    const text = await callAI(prompt, systemPrompt, true);
    const result = JSON.parse(cleanAIOutput(text) || '{}');
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'plagiarism_check', {
      provider: PROVIDER,
      model: MODEL,
      service: 'plagiarism_check',
      requestDetails: {
        contentLength: content.length,
        duration: Date.now() - startTime
      }
    });
    
    return result;
  } catch (error) {
    await logGenerationFailure(userId, 'plagiarism_check', error, {
      provider: PROVIDER,
      model: MODEL,
      tokensUsed,
      inputSnippet: content.substring(0, 500),
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
