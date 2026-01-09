/**
 * Payment Service (Stripe Integration)
 * Handles payment processing and subscription management
 */

import Stripe from 'stripe';
import { getPlanByTier, getPlanMetadata, isValidTier } from '../utils/unifiedPlans.js';

// Initialize Stripe only if API key is available
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

/**
 * Stripe Pricing IDs (set these in your Stripe dashboard)
 */
const PRICING_IDS = {
  PRO: process.env.STRIPE_PRICE_ID_PRO,
  ENTERPRISE: process.env.STRIPE_PRICE_ID_ENTERPRISE
};

/**
 * Create Stripe customer
 */
export const createCustomer = async (email, name, userId = null) => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  const customerData = {
    email,
    name,
    metadata: {
      source: 'nova-xfinity-ai'
    }
  };

  if (userId) {
    customerData.metadata.userId = userId;
  }

  return await stripe.customers.create(customerData);
};

/**
 * Create checkout session for subscription
 * Uses unified plan structure with standardized metadata
 */
export const createCheckoutSession = async (userId, plan, customerId = null) => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  if (!isValidTier(plan)) {
    throw new Error(`Invalid plan: ${plan}. Must be PRO or ENTERPRISE.`);
  }

  const priceId = PRICING_IDS[plan];
  
  if (!priceId) {
    throw new Error(`Stripe price ID not configured for plan: ${plan}`);
  }

  // Get unified plan metadata
  const planConfig = getPlanByTier(plan);
  const metadata = getPlanMetadata(plan, userId);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.FRONTEND_URL}/account?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/account?canceled=true`,
    metadata: {
      // Standardized metadata fields
      tier: plan,
      tier_name: planConfig.metadata.tier_name,
      quota_articles: String(planConfig.metadata.quota_articles),
      quota_images: String(planConfig.metadata.quota_images),
      quota_videos: String(planConfig.metadata.quota_videos),
      quota_research: String(planConfig.metadata.quota_research),
      quota_wordpress: String(planConfig.metadata.quota_wordpress),
      pricing_amount: planConfig.metadata.pricing_amount,
      pricing_currency: planConfig.metadata.pricing_currency,
      pricing_interval: planConfig.metadata.pricing_interval,
      // Backward compatibility fields
      userId,
      plan
    }
  });

  return session;
};

/**
 * Create portal session for subscription management
 */
export const createPortalSession = async (customerId) => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.FRONTEND_URL}/account`
  });

  return session;
};

/**
 * Handle Stripe webhook
 */
export const handleWebhook = async (event) => {
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Handle successful checkout
      // Update subscription in database
      break;
    
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      // Handle subscription update
      break;
    
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      // Handle subscription cancellation
      break;
    
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      // Handle successful payment
      break;
    
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      // Handle failed payment
      break;
    
    default:
      // Unhandled event type - silently ignore
      break;
  }
};

/**
 * Get subscription from Stripe
 */
export const getStripeSubscription = async (subscriptionId) => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  return await stripe.subscriptions.retrieve(subscriptionId);
};

/**
 * Cancel subscription in Stripe
 */
export const cancelStripeSubscription = async (subscriptionId, immediately = false) => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
  }
};
