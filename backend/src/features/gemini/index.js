/**
 * Gemini Feature Index
 * Main entry point for the Gemini feature module
 * 
 * This module exports all Gemini-related services and utilities.
 * For domain-specific imports, use the services directly:
 * - import { generateMetadata } from './services/geminiWriterService.js';
 * - import { generateImage } from './services/geminiMediaService.js';
 * - import { analyzeSEO } from './services/geminiSeoService.js';
 */

// Re-export all services from the services index
export * from './services/index.js';
