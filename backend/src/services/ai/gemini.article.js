/**
 * Gemini Article Generation Service
 * Functions for generating article content, metadata, outlines, sections, and CTAs
 */

import { callAI, cleanAIOutput, SYSTEM_INSTRUCTIONS } from './gemini.shared.js';

/**
 * Generate article metadata (SEO title, slug, meta description, featured image)
 */
export const generateMetadata = async (topic, keywords, articleType, language, articleSize, pov, manualFocusKeyphrase, imageStyle, aspectRatio, sourceContext, category) => {
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: focusKeyphrase, seoTitle, slug, metaDescription, and featuredImage object.`;
  const prompt = `Topic: "${topic}"\nKeywords: "${keywords.join(', ')}"\nPOV: ${pov}\nType: ${articleType}\nSourceContext: ${sourceContext}\nManualFocus: ${manualFocusKeyphrase}`;
  
  const text = await callAI(prompt, systemPrompt, true);
  return JSON.parse(cleanAIOutput(text) || '{}');
};

/**
 * Generate article outline
 */
export const generateOutline = async (topic, keywords, articleType, language, articleSize, pov, sourceContext, category) => {
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON array of section headings ONLY.`;
  const prompt = `Create an SEO outline for: "${topic}". Context: ${category}. Keywords: ${keywords.join(',')}`;
  
  const text = await callAI(prompt, systemPrompt, true);
  return JSON.parse(cleanAIOutput(text) || '[]');
};

/**
 * Generate article section content
 */
export const generateSection = async (sectionTitle, topic, keywords, tone, articleType, language, articleSize, pov, imageQuantity, aspectRatio, imageStyle, sourceContext, category) => {
  const systemPrompt = SYSTEM_INSTRUCTIONS;
  const prompt = `Write the content for the section: "${sectionTitle}". Topic: "${topic}". Type: "${articleType}". RSS_Data: "${sourceContext}"`;
  
  const text = await callAI(prompt, systemPrompt, false);
  return cleanAIOutput(text);
};

/**
 * Generate CTA (Call to Action) content
 */
export const generateCTA = async (topic, keywords, focusKeyphrase) => {
  const text = await callAI(`Create a branded Finity AI CTA for topic: ${topic}. Keyphrase: ${focusKeyphrase}`, SYSTEM_INSTRUCTIONS, false);
  return cleanAIOutput(text);
};

/**
 * Check content for plagiarism
 */
export const checkPlagiarism = async (content) => {
  const text = await callAI(`Scan for originality: ${content.substring(0, 5000)}`, SYSTEM_INSTRUCTIONS, true);
  return JSON.parse(cleanAIOutput(text) || '{}');
};

/**
 * Analyze SEO for content
 */
export const analyzeSEO = async (content, keywords) => {
  const text = await callAI(`SEO audit: ${keywords[0]}. Content: ${content.substring(0, 5000)}`, SYSTEM_INSTRUCTIONS, true);
  return JSON.parse(cleanAIOutput(text) || '{}');
};
