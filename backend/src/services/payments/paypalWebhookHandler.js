/**
 * PayPal Webhook Handler
 * Handles PayPal webhook events and updates subscription status in database
 */

import prisma from '../../config/database.js';
import { extractTierFromPayPalPlanId, isValidTier, getPlanByTier } from '../../utils/unifiedPlans.js';

/**
 * Handle PayPal webhook event
 * @param {Object} event - PayPal webhook event object
 */
export async function handlePayPalWebhookEvent(event) {
  const eventType = event.event_type;
  const resource = event.resource || {};
  const subscriptionId = resource.id || resource.billing_agreement_id;

  console.log(`[PayPal Webhook] Received event: ${eventType}`, {
    subscriptionId,
    eventId: event.id,
    summary: event.summary
  });

  if (!subscriptionId) {
    console.warn('[PayPal Webhook] No subscription ID found in event resource');
    return { processed: false, reason: 'No subscription ID' };
  }

  try {
    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        return await handleSubscriptionActivated(subscriptionId, resource);

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        return await handleSubscriptionCancelled(subscriptionId, resource);

      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        return await handleSubscriptionSuspended(subscriptionId, resource);

      case 'BILLING.SUBSCRIPTION.EXPIRED':
        return await handleSubscriptionExpired(subscriptionId, resource);

      case 'BILLING.SUBSCRIPTION.UPDATED':
        return await handleSubscriptionUpdated(subscriptionId, resource);

      case 'PAYMENT.SALE.COMPLETED':
        return await handlePaymentCompleted(subscriptionId, resource);

      case 'BILLING.SUBSCRIPTION.CREATED':
        // Subscription created, but not yet activated
        console.log(`[PayPal Webhook] Subscription ${subscriptionId} created (pending activation)`);
        return { processed: true, action: 'logged' };

      default:
        console.log(`[PayPal Webhook] Unhandled event type: ${eventType}`);
        return { processed: false, reason: 'Unhandled event type' };
    }
  } catch (error) {
    console.error(`[PayPal Webhook] Error processing event ${eventType}:`, error);
    throw error;
  }
}

/**
 * Handle subscription activated event
 */
async function handleSubscriptionActivated(subscriptionId, resource) {
  console.log(`[PayPal Webhook] Activating subscription: ${subscriptionId}`);

  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId }
  });

  if (!subscription) {
    console.warn(`[PayPal Webhook] Subscription ${subscriptionId} not found in database`);
    return { processed: false, reason: 'Subscription not found' };
  }

  const updateData = {
    status: 'ACTIVE',
    cancelAtPeriodEnd: false
  };

  // Update period dates if provided
  if (resource.billing_info) {
    const billingInfo = resource.billing_info;
    if (billingInfo.next_billing_time) {
      updateData.currentPeriodEnd = new Date(billingInfo.next_billing_time);
    }
    if (billingInfo.last_payment) {
      updateData.currentPeriodStart = new Date(billingInfo.last_payment.time);
    }
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: updateData
  });

  console.log(`[PayPal Webhook] Subscription ${subscriptionId} activated successfully`);
  return { processed: true, action: 'activated' };
}

/**
 * Handle subscription cancelled event
 */
async function handleSubscriptionCancelled(subscriptionId, resource) {
  console.log(`[PayPal Webhook] Cancelling subscription: ${subscriptionId}`);

  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId }
  });

  if (!subscription) {
    console.warn(`[PayPal Webhook] Subscription ${subscriptionId} not found in database`);
    return { processed: false, reason: 'Subscription not found' };
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'CANCELLED',
      cancelAtPeriodEnd: true
    }
  });

  console.log(`[PayPal Webhook] Subscription ${subscriptionId} cancelled successfully`);
  return { processed: true, action: 'cancelled' };
}

/**
 * Handle subscription suspended event
 */
async function handleSubscriptionSuspended(subscriptionId, resource) {
  console.log(`[PayPal Webhook] Suspending subscription: ${subscriptionId}`);

  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId }
  });

  if (!subscription) {
    console.warn(`[PayPal Webhook] Subscription ${subscriptionId} not found in database`);
    return { processed: false, reason: 'Subscription not found' };
  }

  // Note: We don't have SUSPENDED in our SubscriptionStatus enum,
  // so we'll mark it as CANCELLED for now
  // If you want to support SUSPENDED status, add it to the enum
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'CANCELLED',
      cancelAtPeriodEnd: true
    }
  });

  console.log(`[PayPal Webhook] Subscription ${subscriptionId} suspended (marked as cancelled)`);
  return { processed: true, action: 'suspended' };
}

/**
 * Handle subscription expired event
 */
async function handleSubscriptionExpired(subscriptionId, resource) {
  console.log(`[PayPal Webhook] Expiring subscription: ${subscriptionId}`);

  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId }
  });

  if (!subscription) {
    console.warn(`[PayPal Webhook] Subscription ${subscriptionId} not found in database`);
    return { processed: false, reason: 'Subscription not found' };
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'EXPIRED'
    }
  });

  console.log(`[PayPal Webhook] Subscription ${subscriptionId} expired successfully`);
  return { processed: true, action: 'expired' };
}

/**
 * Handle subscription updated event
 * Uses unified plan structure to extract tier from plan_id
 */
async function handleSubscriptionUpdated(subscriptionId, resource) {
  console.log(`[PayPal Webhook] Updating subscription: ${subscriptionId}`);

  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId }
  });

  if (!subscription) {
    console.warn(`[PayPal Webhook] Subscription ${subscriptionId} not found in database`);
    return { processed: false, reason: 'Subscription not found' };
  }

  const updateData = {};

  // Update tier if plan_id changed using unified plan structure
  if (resource.plan_id) {
    const tier = extractTierFromPayPalPlanId(resource.plan_id);
    if (tier && isValidTier(tier) && tier !== subscription.plan) {
      updateData.plan = tier;
      console.log(`[PayPal Webhook] Plan updated to ${tier} for subscription ${subscriptionId}`);
    }
  }

  // Update status if provided
  if (resource.status) {
    const statusMap = {
      'ACTIVE': 'ACTIVE',
      'CANCELLED': 'CANCELLED',
      'SUSPENDED': 'CANCELLED', // Map SUSPENDED to CANCELLED
      'EXPIRED': 'EXPIRED'
    };
    
    if (statusMap[resource.status]) {
      updateData.status = statusMap[resource.status];
    }
  }

  // Update billing period if provided
  if (resource.billing_info) {
    const billingInfo = resource.billing_info;
    if (billingInfo.next_billing_time) {
      updateData.currentPeriodEnd = new Date(billingInfo.next_billing_time);
    }
    if (billingInfo.last_payment) {
      updateData.currentPeriodStart = new Date(billingInfo.last_payment.time);
    }
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: updateData
    });

    console.log(`[PayPal Webhook] Subscription ${subscriptionId} updated successfully`);
    return { processed: true, action: 'updated', updates: Object.keys(updateData) };
  }

  return { processed: true, action: 'logged' };
}

/**
 * Handle payment completed event
 * Store payment date and update subscription period if needed
 */
async function handlePaymentCompleted(subscriptionId, resource) {
  console.log(`[PayPal Webhook] Payment completed for subscription: ${subscriptionId}`);

  // For PAYMENT.SALE.COMPLETED, the subscription ID might be in billing_agreement_id
  const actualSubscriptionId = subscriptionId || resource.billing_agreement_id;

  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: actualSubscriptionId }
  });

  if (!subscription) {
    console.warn(`[PayPal Webhook] Subscription ${actualSubscriptionId} not found for payment`);
    return { processed: false, reason: 'Subscription not found' };
  }

  const updateData = {};

  // Update payment date and period if payment info is available
  if (resource.update_time) {
    updateData.currentPeriodStart = new Date(resource.update_time);
    // Set period end to 1 month from payment date
    const periodEnd = new Date(resource.update_time);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    updateData.currentPeriodEnd = periodEnd;
  }

  // Ensure subscription is active if payment completed
  if (subscription.status !== 'ACTIVE') {
    updateData.status = 'ACTIVE';
    updateData.cancelAtPeriodEnd = false;
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: updateData
    });

    console.log(`[PayPal Webhook] Payment recorded for subscription ${actualSubscriptionId}`);
    return { processed: true, action: 'payment_recorded' };
  }

  return { processed: true, action: 'logged' };
}
