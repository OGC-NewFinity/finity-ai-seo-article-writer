/**
 * Article Routes
 * API endpoints for article generation and management
 * 
 * Example usage of quota middleware
 */

import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { checkQuota } from '../../middleware/quota.middleware.js';
import * as articleController from './article.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/articles
 * Create a new article
 * Protected by quota middleware - checks article quota before allowing creation
 */
router.post('/', checkQuota('articles'), articleController.createArticle);

/**
 * POST /api/articles/:id/publish
 * Publish article to WordPress
 * Protected by quota middleware - checks WordPress publishing quota
 */
router.post('/:id/publish', checkQuota('wordpress'), articleController.publishArticle);

/**
 * POST /api/articles/metadata
 * Generate article metadata (SEO title, slug, meta description, featured image)
 * Protected by quota middleware - checks article quota
 */
router.post('/metadata', checkQuota('articles'), articleController.generateMetadata);

/**
 * POST /api/articles/outline
 * Generate article outline
 * Protected by quota middleware - checks article quota
 */
router.post('/outline', checkQuota('articles'), articleController.generateOutline);

/**
 * POST /api/articles/section
 * Generate article section content
 * Protected by quota middleware - checks article quota
 */
router.post('/section', checkQuota('articles'), articleController.generateSection);

/**
 * POST /api/articles/cta
 * Generate CTA content
 * Protected by quota middleware - checks article quota
 */
router.post('/cta', checkQuota('articles'), articleController.generateCTA);

/**
 * POST /api/articles/headlines
 * Draft headline variations
 * Protected by quota middleware - checks article quota
 */
router.post('/headlines', checkQuota('articles'), articleController.draftHeadlines);

/**
 * POST /api/articles/keywords
 * Plan keyword strategy
 * Protected by quota middleware - checks article quota
 */
router.post('/keywords', checkQuota('articles'), articleController.planKeywords);

/**
 * POST /api/articles/seo/analyze
 * Analyze SEO for content
 * Protected by quota middleware - checks article quota
 */
router.post('/seo/analyze', checkQuota('articles'), articleController.analyzeSEO);

/**
 * POST /api/articles/seo/meta-tags
 * Generate meta tag suggestions
 * Protected by quota middleware - checks article quota
 */
router.post('/seo/meta-tags', checkQuota('articles'), articleController.suggestMetaTags);

/**
 * POST /api/articles/seo/audit
 * Generate content audit summary
 * Protected by quota middleware - checks article quota
 */
router.post('/seo/audit', checkQuota('articles'), articleController.generateContentAudit);

/**
 * POST /api/articles/seo/search-intent
 * Classify search intent
 * Protected by quota middleware - checks article quota
 */
router.post('/seo/search-intent', checkQuota('articles'), articleController.classifySearchIntent);

/**
 * POST /api/articles/seo/score
 * Score content quality for SEO
 * Protected by quota middleware - checks article quota
 */
router.post('/seo/score', checkQuota('articles'), articleController.scoreContentQuality);

export default router;
