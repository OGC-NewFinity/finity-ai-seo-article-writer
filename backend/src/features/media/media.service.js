/**
 * Media Service
 * Business logic for media operations
 * 
 * Note: Currently uses shared usage.service.js for usage tracking.
 * Future media-specific business logic should be added here.
 */

// Re-export usage service functions for convenience
export { incrementUsage } from '../../services/usage.service.js';
