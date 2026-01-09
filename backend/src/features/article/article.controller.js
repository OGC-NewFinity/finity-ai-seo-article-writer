/**
 * Article Controller
 * Handles HTTP request/response logic for article endpoints
 */

import { incrementUsage } from '../../services/usage.service.js';
import * as geminiProvider from '../providers/gemini/index.js';

/**
 * Create a new article
 */
export const createArticle = async (req, res) => {
  try {
    // At this point, quota has been checked and req.quota contains quota info
    // req.quota = { feature, currentUsage, limit, remaining, plan }
    
    const { topic, keywords, articleType, language, articleSize, pov, sourceContext, category } = req.body;
    
    // TODO: Implement actual article generation
    // const article = await geminiProvider.writeBlogPost(req.user.id, { topic, keywords, ... });
    
    // After successful generation, increment usage
    await incrementUsage(req.user.id, 'articlesGenerated', 1);
    
    res.json({
      success: true,
      data: {
        // article data
        message: 'Article created successfully',
        quota: {
          remaining: req.quota.remaining - 1,
          limit: req.quota.limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * Publish article to WordPress
 */
export const publishArticle = async (req, res) => {
  try {
    // TODO: Implement WordPress publishing logic
    // WordPress publishing doesn't consume tokens, just increments usage count
    
    // After successful publishing, increment usage
    await incrementUsage(req.user.id, 'articlesPublished', 1);
    
    res.json({
      success: true,
      data: {
        message: 'Article published successfully',
        quota: {
          remaining: req.quota.remaining - 1,
          limit: req.quota.limit
        }
      }
    });
  } catch (error) {
    // Error handled by controller (publishing is not an AI service call)
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * Generate article metadata (SEO title, slug, meta description, featured image)
 */
export const generateMetadata = async (req, res) => {
  try {
    const { topic, keywords, articleType, language, articleSize, pov, manualFocusKeyphrase, imageStyle, aspectRatio, sourceContext, category } = req.body;
    
    // Generate metadata - userId is now first parameter, tracking/logging handled in service
    const metadata = await geminiProvider.generateMetadata(
      req.user.id,
      topic, keywords, articleType, language, articleSize, pov, 
      manualFocusKeyphrase, imageStyle, aspectRatio, sourceContext, category
    );
    
    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
};

/**
 * Generate article outline
 */
export const generateOutline = async (req, res) => {
  try {
    const { topic, keywords, articleType, language, articleSize, pov, sourceContext, category } = req.body;
    
    const outline = await geminiProvider.generateOutline(
      req.user.id,
      topic, keywords, articleType, language, articleSize, pov, sourceContext, category
    );
    
    res.json({ success: true, data: { outline } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
};

/**
 * Generate article section content
 */
export const generateSection = async (req, res) => {
  try {
    const { sectionTitle, topic, keywords, tone, articleType, language, articleSize, pov, imageQuantity, aspectRatio, imageStyle, sourceContext, category } = req.body;
    
    const section = await geminiProvider.generateSection(
      req.user.id,
      sectionTitle, topic, keywords, tone, articleType, language, articleSize, 
      pov, imageQuantity, aspectRatio, imageStyle, sourceContext, category
    );
    
    res.json({ success: true, data: { section } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
};

/**
 * Generate CTA content
 */
export const generateCTA = async (req, res) => {
  try {
    const { topic, keywords, focusKeyphrase } = req.body;
    
    const cta = await geminiProvider.generateCTA(req.user.id, topic, keywords, focusKeyphrase);
    
    res.json({ success: true, data: { cta } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
};

/**
 * Draft headline variations
 */
export const draftHeadlines = async (req, res) => {
  try {
    const { topic, focusKeyphrase, count } = req.body;
    
    const headlines = await geminiProvider.draftHeadlines(req.user.id, topic, focusKeyphrase, count || 5);
    
    res.json({ success: true, data: { headlines } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
};

/**
 * Plan keyword strategy
 */
export const planKeywords = async (req, res) => {
  try {
    const { topic, seedKeywords } = req.body;
    
    const keywordPlan = await geminiProvider.planKeywords(req.user.id, topic, seedKeywords || []);
    
    res.json({ success: true, data: { keywordPlan } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
};

/**
 * Analyze SEO for content
 */
export const analyzeSEO = async (req, res) => {
  try {
    const { content, keywords } = req.body;
    
    if (!content || !keywords || !Array.isArray(keywords)) {
      throw new Error('Content and keywords array are required');
    }
    
    const analysis = await geminiProvider.analyzeSEO(req.user.id, content, keywords);
    
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
};

/**
 * Generate meta tag suggestions
 */
export const suggestMetaTags = async (req, res) => {
  try {
    const { content, focusKeyphrase, title } = req.body;
    
    if (!content || !focusKeyphrase) {
      throw new Error('Content and focusKeyphrase are required');
    }
    
    const metaTags = await geminiProvider.suggestMetaTags(req.user.id, content, focusKeyphrase, title);
    
    res.json({ success: true, data: metaTags });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
};

/**
 * Generate content audit summary
 */
export const generateContentAudit = async (req, res) => {
  try {
    const { content, keywords, focusKeyphrase } = req.body;
    
    if (!content || !focusKeyphrase) {
      throw new Error('Content and focusKeyphrase are required');
    }
    
    const audit = await geminiProvider.generateContentAudit(req.user.id, content, keywords || [], focusKeyphrase);
    
    res.json({ success: true, data: audit });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
};

/**
 * Classify search intent
 */
export const classifySearchIntent = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      throw new Error('Query is required and must be a string');
    }
    
    const intent = await geminiProvider.classifySearchIntent(req.user.id, query);
    
    res.json({ success: true, data: intent });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
};

/**
 * Score content quality for SEO
 */
export const scoreContentQuality = async (req, res) => {
  try {
    const { content, focusKeyphrase, metadata } = req.body;
    
    if (!content || !focusKeyphrase) {
      throw new Error('Content and focusKeyphrase are required');
    }
    
    const score = await geminiProvider.scoreContentQuality(req.user.id, content, focusKeyphrase, metadata || {});
    
    res.json({ success: true, data: score });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
};
