/**
 * Stripe Webhook Handler
 * Handles Stripe webhook events and updates subscription status in database
 */

import prisma from '../../config/database.js';
import { updateSubscriptionPlan } from '../../features/subscription/services/subscription.service.js';
import { extractTierFromMetadata, extractTierFromStripePriceId, isValidTier } from '../../utils/unifiedPlans.js';

/**
 * Handle Stripe webhook event
 * @param {Object} event - Stripe webhook event object
 */
export async function handleStripeWebhookEvent(event) {
  const eventType = event.type;
  const eventId = event.id;

  console.log(`[Stripe Webhook] Received event: ${eventType}`, {
    eventId,
    livemode: event.livemode
  });

  try {
    switch (eventType) {
      case 'checkout.session.completed':
        return await handleCheckoutSessionCompleted(event.data.object);

      case 'customer.subscription.created':
        return await handleSubscriptionCreated(event.data.object);

      case 'customer.subscription.updated':
        return await handleSubscriptionUpdated(event.data.object);

      case 'customer.subscription.deleted':
        return await handleSubscriptionDeleted(event.data.object);

      case 'invoice.payment_succeeded':
        return await handlePaymentSucceeded(event.data.object);

      case 'invoice.payment_failed':
        return await handlePaymentFailed(event.data.object);

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${eventType}`);
        return { processed: false, reason: 'Unhandled event type' };
    }
  } catch (error) {
    console.error(`[Stripe Webhook] Error processing event ${eventType}:`, error);
    throw error;
  }
}

/**
 * Handle checkout session completed event
 * This is triggered when a user successfully completes checkout
 * Uses unified plan structure to extract tier from metadata
 */
async function handleCheckoutSessionCompleted(session) {
  console.log(`[Stripe Webhook] Checkout session completed: ${session.id}`);

  const userId = session.metadata?.userId;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  if (!userId) {
    console.warn('[Stripe Webhook] No userId in checkout session metadata');
    return { processed: false, reason: 'No userId in metadata' };
  }

  // Extract tier from standardized metadata using unified plan structure
  const tier = extractTierFromMetadata(session.metadata);
  
  if (!isValidTier(tier)) {
    console.warn('[Stripe Webhook] Invalid tier in metadata:', tier);
    return { processed: false, reason: 'Invalid tier in metadata' };
  }

  // Update subscription with Stripe customer and subscription IDs
  try {
    await updateSubscriptionPlan(
      userId,
      tier,
      subscriptionId,
      customerId,
      null, // paypalSubscriptionId
      null, // paypalPayerId
      null  // paypalPlanId
    );

    console.log(`[Stripe Webhook] Subscription activated for user ${userId}, tier: ${tier}`);
    return { processed: true, action: 'subscription_activated', tier };
  } catch (error) {
    console.error('[Stripe Webhook] Error updating subscription:', error);
    throw error;
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(subscription) {
  console.log(`[Stripe Webhook] Subscription created: ${subscription.id}`);

  // Find subscription by Stripe subscription ID
  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (!dbSubscription) {
    console.warn(`[Stripe Webhook] Subscription ${subscription.id} not found in database`);
    return { processed: false, reason: 'Subscription not found' };
  }

  const updateData = {
    status: mapStripeStatus(subscription.status),
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end || false
  };

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: updateData
  });

  console.log(`[Stripe Webhook] Subscription ${subscription.id} created successfully`);
  return { processed: true, action: 'subscription_created' };
}

/**
 * Handle subscription updated event
 * Uses unified plan structure to extract tier from price ID
 */
async function handleSubscriptionUpdated(subscription) {
  console.log(`[Stripe Webhook] Subscription updated: ${subscription.id}`);

  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (!dbSubscription) {
    console.warn(`[Stripe Webhook] Subscription ${subscription.id} not found in database`);
    return { processed: false, reason: 'Subscription not found' };
  }

  const updateData = {
    status: mapStripeStatus(subscription.status),
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end || false
  };

  // Update tier if price changed using unified plan structure
  if (subscription.items?.data?.[0]?.price?.id) {
    const priceId = subscription.items.data[0].price.id;
    const tier = extractTierFromStripePriceId(priceId);
    if (tier && isValidTier(tier)) {
      updateData.plan = tier;
      console.log(`[Stripe Webhook] Plan updated to ${tier} for subscription ${subscription.id}`);
    }
  }

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: updateData
  });

  console.log(`[Stripe Webhook] Subscription ${subscription.id} updated successfully`);
  return { processed: true, action: 'subscription_updated' };
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription) {
  console.log(`[Stripe Webhook] Subscription deleted: ${subscription.id}`);

  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (!dbSubscription) {
    console.warn(`[Stripe Webhook] Subscription ${subscription.id} not found in database`);
    return { processed: false, reason: 'Subscription not found' };
  }

  // Downgrade to FREE plan
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      plan: 'FREE',
      status: 'CANCELLED',
      stripeSubscriptionId: null,
      stripeCustomerId: null,
      cancelAtPeriodEnd: false
    }
  });

  console.log(`[Stripe Webhook] Subscription ${subscription.id} cancelled, downgraded to FREE`);
  return { processed: true, action: 'subscription_cancelled' };
}

/**
 * Handle payment succeeded event
 */
async function handlePaymentSucceeded(invoice) {
  console.log(`[Stripe Webhook] Payment succeeded for invoice: ${invoice.id}`);

  const subscriptionId = invoice.subscription;
  if (!subscriptionId) {
    console.log('[Stripe Webhook] Invoice has no subscription, skipping');
    return { processed: true, action: 'logged' };
  }

  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId }
  });

  if (!dbSubscription) {
    console.warn(`[Stripe Webhook] Subscription ${subscriptionId} not found for payment`);
    return { processed: false, reason: 'Subscription not found' };
  }

  // Ensure subscription is active
  if (dbSubscription.status !== 'ACTIVE') {
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: 'ACTIVE',
        cancelAtPeriodEnd: false
      }
    });
  }

  console.log(`[Stripe Webhook] Payment recorded for subscription ${subscriptionId}`);
  return { processed: true, action: 'payment_recorded' };
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(invoice) {
  console.log(`[Stripe Webhook] Payment failed for invoice: ${invoice.id}`);

  const subscriptionId = invoice.subscription;
  if (!subscriptionId) {
    console.log('[Stripe Webhook] Invoice has no subscription, skipping');
    return { processed: true, action: 'logged' };
  }

  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId }
  });

  if (!dbSubscription) {
    console.warn(`[Stripe Webhook] Subscription ${subscriptionId} not found for failed payment`);
    return { processed: false, reason: 'Subscription not found' };
  }

  // Log payment failure (Stripe will handle retries)
  console.warn(`[Stripe Webhook] Payment failed for subscription ${subscriptionId}, Stripe will retry`);
  return { processed: true, action: 'payment_failure_logged' };
}

/**
 * Map Stripe subscription status to our status
 */
function mapStripeStatus(stripeStatus) {
  const statusMap = {
    'active': 'ACTIVE',
    'trialing': 'ACTIVE',
    'past_due': 'ACTIVE', // Keep active, Stripe will handle retries
    'canceled': 'CANCELLED',
    'unpaid': 'CANCELLED',
    'incomplete': 'CANCELLED',
    'incomplete_expired': 'EXPIRED',
    'paused': 'CANCELLED'
  };

  return statusMap[stripeStatus] || 'CANCELLED';
}

/**
 * Get plan from Stripe price ID (deprecated - use extractTierFromStripePriceId from unifiedPlans)
 * @deprecated Use extractTierFromStripePriceId from unifiedPlans.js instead
 */
function getPlanFromPriceId(priceId) {
  return extractTierFromStripePriceId(priceId);
}
