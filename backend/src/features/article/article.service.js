/**
 * Article Service
 * Business logic for article operations
 * 
 * Note: Currently uses shared usage.service.js for usage tracking.
 * Future article-specific business logic should be added here.
 */

// Re-export usage service functions for convenience
export { incrementUsage } from '../../services/usage.service.js';
