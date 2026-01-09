/**
 * Research Controller
 * Handles HTTP request/response logic for research endpoints
 */

import { incrementUsage } from '../../services/usage.service.js';
import * as geminiProvider from '../providers/gemini/index.js';

/**
 * Execute a research query
 */
export const executeResearchQuery = async (req, res) => {
  try {
    const { query } = req.body;
    
    // At this point, quota has been checked
    // req.quota = { feature: 'research', currentUsage, limit, remaining, plan }
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Research query is required and must be a non-empty string');
    }
    
    // Execute research query - userId is now first parameter, tracking/logging handled in service
    const researchResult = await geminiProvider.performResearch(req.user.id, query);
    
    // After successful query, increment usage
    await incrementUsage(req.user.id, 'researchQueries', 1);
    
    res.json({
      success: true,
      data: {
        summary: researchResult.summary,
        sources: researchResult.sources || [],
        message: 'Research query executed successfully',
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
