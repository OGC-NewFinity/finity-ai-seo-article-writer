/**
 * Research Controller
 * Handles HTTP request/response logic for research endpoints
 */

import { incrementUsage } from '../../services/usage.service.js';

/**
 * Execute a research query
 */
export const executeResearchQuery = async (req, res) => {
  try {
    const { query } = req.body;
    
    // At this point, quota has been checked
    // req.quota = { feature: 'research', currentUsage, limit, remaining, plan }
    
    // TODO: Implement research query logic here
    // const researchResult = await executeResearchQuery(query, req.user.id);
    
    // After successful query, increment usage
    await incrementUsage(req.user.id, 'researchQueries', 1);
    
    res.json({
      success: true,
      data: {
        // research result data
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
