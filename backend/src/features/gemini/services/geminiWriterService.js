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

import { callAI, cleanAIOutput, SYSTEM_INSTRUCTIONS } from '../../../services/ai/gemini.shared.js';

/**
 * Generate article metadata (SEO title, slug, meta description, featured image)
 * 
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
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: focusKeyphrase, seoTitle, slug, metaDescription, and featuredImage object.`;
  const prompt = `Topic: "${topic}"\nKeywords: "${keywords.join(', ')}"\nPOV: ${pov}\nType: ${articleType}\nSourceContext: ${sourceContext}\nManualFocus: ${manualFocusKeyphrase}`;
  
  const text = await callAI(prompt, systemPrompt, true);
  return JSON.parse(cleanAIOutput(text) || '{}');
};

/**
 * Generate article outline (array of section headings)
 * 
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
  topic,
  keywords,
  articleType,
  language,
  articleSize,
  pov,
  sourceContext,
  category
) => {
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON array of section headings ONLY.`;
  const prompt = `Create an SEO outline for: "${topic}". Context: ${category}. Keywords: ${keywords.join(',')}`;
  
  const text = await callAI(prompt, systemPrompt, true);
  return JSON.parse(cleanAIOutput(text) || '[]');
};

/**
 * Generate article section content
 * 
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
  const systemPrompt = SYSTEM_INSTRUCTIONS;
  const prompt = `Write the content for the section: "${sectionTitle}". Topic: "${topic}". Type: "${articleType}". RSS_Data: "${sourceContext}"`;
  
  const text = await callAI(prompt, systemPrompt, false);
  return cleanAIOutput(text);
};

/**
 * Generate CTA (Call to Action) content
 * 
 * @param {string} topic - Article topic
 * @param {string[]} keywords - Array of keywords
 * @param {string} focusKeyphrase - Focus keyphrase for the article
 * @returns {Promise<string>} CTA content
 */
export const generateCTA = async (topic, keywords, focusKeyphrase) => {
  const text = await callAI(
    `Create a branded Nova‑XFinity AI CTA for topic: ${topic}. Keyphrase: ${focusKeyphrase}`,
    SYSTEM_INSTRUCTIONS,
    false
  );
  return cleanAIOutput(text);
};

/**
 * Draft multiple headline variations
 * 
 * @param {string} topic - Article topic
 * @param {string} focusKeyphrase - Focus keyphrase
 * @param {number} count - Number of headline variations to generate (default: 5)
 * @returns {Promise<string[]>} Array of headline variations
 */
export const draftHeadlines = async (topic, focusKeyphrase, count = 5) => {
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON array of ${count} headline variations. Each headline should be engaging, SEO-optimized, and include the focus keyphrase naturally.`;
  const prompt = `Topic: "${topic}"\nFocus Keyphrase: "${focusKeyphrase}"\nGenerate ${count} compelling headline variations.`;
  
  const text = await callAI(prompt, systemPrompt, true);
  return JSON.parse(cleanAIOutput(text) || '[]');
};

/**
 * Plan keyword strategy for an article
 * 
 * @param {string} topic - Article topic
 * @param {string[]} seedKeywords - Initial seed keywords
 * @returns {Promise<Object>} Keyword plan with primary, secondary, and long-tail keywords
 */
export const planKeywords = async (topic, seedKeywords = []) => {
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: primaryKeywords (array), secondaryKeywords (array), longTailKeywords (array), and keywordDensity (object with suggested densities).`;
  const prompt = `Topic: "${topic}"\nSeed Keywords: ${seedKeywords.join(', ')}\nCreate a comprehensive keyword strategy.`;
  
  const text = await callAI(prompt, systemPrompt, true);
  return JSON.parse(cleanAIOutput(text) || '{}');
};

/**
 * Generate complete blog post content
 * 
 * @param {Object} articleData - Article data including topic, outline, sections, etc.
 * @returns {Promise<string>} Complete blog post content in markdown format
 */
export const writeBlogPost = async (articleData) => {
  const { topic, outline, sections, metadata } = articleData;
  
  const systemPrompt = SYSTEM_INSTRUCTIONS;
  const prompt = `Write a complete blog post for topic: "${topic}". 
    Use this outline: ${JSON.stringify(outline)}.
    Incorporate these sections: ${JSON.stringify(sections)}.
    Style: Professional, engaging, SEO-optimized.
    Include proper markdown formatting.`;
  
  const text = await callAI(prompt, systemPrompt, false);
  return cleanAIOutput(text);
};

/**
 * Check content for plagiarism
 * 
 * @param {string} content - Content to check for plagiarism
 * @returns {Promise<Object>} Plagiarism check results with originality score and flagged sections
 */
export const checkPlagiarism = async (content) => {
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: originalityScore (0-100), isOriginal (boolean), flaggedSections (array of objects with text and similarity), and recommendations (array of strings).`;
  const prompt = `Scan for originality and potential plagiarism in this content: ${content.substring(0, 5000)}`;
  
  const text = await callAI(prompt, systemPrompt, true);
  return JSON.parse(cleanAIOutput(text) || '{}');
};
