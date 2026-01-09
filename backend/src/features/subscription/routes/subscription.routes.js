/**
 * Subscription Routes
 * API endpoints for subscription management
 */

import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import {
  getSubscriptionStatus,
  getSubscriptionLimits,
  updateSubscriptionPlan,
  cancelSubscription,
  reactivateSubscription
} from '../services/subscription.service.js';
import { getUsageStats } from '../../../services/usage.service.js';
import {
  createCheckoutSession,
  createPortalSession
} from '../../../services/payment.service.js';
import {
  createPayPalCheckout,
  executePayPalSubscription
} from '../../../services/payments/paypalService.js';
import { isValidTier, extractTierFromPayPalPlanId } from '../../../utils/unifiedPlans.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/subscription/status
 * Get current subscription status
 */
router.get('/status', async (req, res) => {
  try {
    const status = await getSubscriptionStatus(req.user.id);
    res.json({
      success: true,
      data: status
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

/**
 * GET /api/subscription/usage
 * Get current usage statistics
 */
router.get('/usage', async (req, res) => {
  try {
    const stats = await getUsageStats(req.user.id);
    res.json({
      success: true,
      data: stats
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

/**
 * GET /api/subscription/limits
 * Get subscription limits
 */
router.get('/limits', async (req, res) => {
  try {
    const limits = await getSubscriptionLimits(req.user.id);
    res.json({
      success: true,
      data: limits
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

/**
 * POST /api/subscription/checkout
 * Create Stripe checkout session
 */
router.post('/checkout', async (req, res) => {
  try {
    const { plan } = req.body;
    
    // Validate plan using unified plan structure
    if (!isValidTier(plan) || plan === 'FREE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid plan. Must be PRO or ENTERPRISE.'
        }
      });
    }

    const status = await getSubscriptionStatus(req.user.id);
    const customerId = status.stripeCustomerId;

    const session = await createCheckoutSession(
      req.user.id,
      plan,
      customerId
    );

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
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

/**
 * POST /api/subscription/portal
 * Create Stripe customer portal session
 */
router.post('/portal', async (req, res) => {
  try {
    const status = await getSubscriptionStatus(req.user.id);
    
    if (!status.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_CUSTOMER',
          message: 'No Stripe customer found. Please create a subscription first.'
        }
      });
    }

    const session = await createPortalSession(status.stripeCustomerId);

    res.json({
      success: true,
      data: {
        url: session.url
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

/**
 * POST /api/subscription/cancel
 * Cancel subscription
 */
router.post('/cancel', async (req, res) => {
  try {
    await cancelSubscription(req.user.id);
    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current period.'
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

/**
 * POST /api/subscription/reactivate
 * Reactivate cancelled subscription
 */
router.post('/reactivate', async (req, res) => {
  try {
    await reactivateSubscription(req.user.id);
    res.json({
      success: true,
      message: 'Subscription reactivated successfully.'
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

/**
 * POST /api/subscription/paypal/checkout
 * Create PayPal subscription checkout
 */
router.post('/paypal/checkout', async (req, res) => {
  try {
    const { plan } = req.body;
    
    // Validate plan using unified plan structure
    if (!isValidTier(plan) || plan === 'FREE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid plan. Must be PRO or ENTERPRISE.'
        }
      });
    }

    // Prevent duplicate requests
    // (In production, consider adding rate limiting or request deduplication)
    
    const checkout = await createPayPalCheckout(req.user.id, plan);

    res.json({
      success: true,
      data: {
        subscriptionId: checkout.subscriptionId,
        approvalUrl: checkout.approvalUrl,
        status: checkout.status
      }
    });
  } catch (error) {
    // Error will be logged by centralized error handler
    res.status(500).json({
      success: false,
      error: {
        code: 'PAYPAL_CHECKOUT_ERROR',
        message: error.message || 'Failed to create PayPal checkout'
      }
    });
  }
});

/**
 * POST /api/subscription/paypal/execute
 * Execute approved PayPal subscription
 */
router.post('/paypal/execute', async (req, res) => {
  try {
    const { subscriptionId, token } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'subscriptionId is required'
        }
      });
    }

    // Execute the subscription with PayPal
    const subscription = await executePayPalSubscription(subscriptionId, token);

    // Determine plan from PayPal subscription using unified plan structure
    // The executePayPalSubscription function already extracts the tier
    const plan = subscription.tier || subscription.plan || 'PRO';
    
    if (!isValidTier(plan) || plan === 'FREE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PLAN',
          message: `Invalid plan tier: ${plan}`
        }
      });
    }

    // Update user subscription in database
    await updateSubscriptionPlan(
      req.user.id,
      plan,
      null, // stripeSubscriptionId
      null, // stripeCustomerId
      subscription.subscriptionId, // paypalSubscriptionId
      subscription.payerId, // paypalPayerId
      subscription.planId // paypalPlanId
    );

    res.json({
      success: true,
      message: 'PayPal subscription activated successfully',
      data: {
        subscriptionId: subscription.subscriptionId,
        status: subscription.status,
        plan
      }
    });
  } catch (error) {
    // Error will be logged by centralized error handler
    res.status(500).json({
      success: false,
      error: {
        code: 'PAYPAL_EXECUTE_ERROR',
        message: error.message || 'Failed to execute PayPal subscription'
      }
    });
  }
});

export default router;
