/**
 * Research Routes
 * API endpoints for research queries
 * 
 * Example usage of quota middleware
 */

import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { checkQuota } from '../middleware/quota.middleware.js';
import { incrementUsage } from '../services/usage.service.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/research/query
 * Execute a research query
 * Protected by quota middleware - checks research quota before allowing query
 */
router.post('/query', checkQuota('research'), async (req, res) => {
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
});

export default router;
