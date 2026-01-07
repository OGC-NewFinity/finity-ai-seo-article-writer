/**
 * PayPal Service
 * Handles PayPal subscription creation and execution
 */

import axios from 'axios';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'; // sandbox or live
// Handle both URL format (https://sandbox.paypal.com) and mode format (sandbox)
const PAYPAL_BASE_URL = PAYPAL_MODE.includes('sandbox') || PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// PayPal Plan IDs from environment
const PAYPAL_PLAN_IDS = {
  PRO: process.env.PAYPAL_PLAN_ID_PRO,
  ENTERPRISE: process.env.PAYPAL_PLAN_ID_ENTERPRISE
};

/**
 * Get PayPal access token
 */
async function getAccessToken() {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('PayPal access token error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with PayPal');
  }
}

/**
 * Make authenticated PayPal API request
 */
async function makePayPalRequest(method, endpoint, data = null) {
  const accessToken = await getAccessToken();
  
  const config = {
    method,
    url: `${PAYPAL_BASE_URL}${endpoint}`,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`PayPal API error (${method} ${endpoint}):`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create PayPal subscription checkout
 * Returns approval URL for user to complete subscription
 */
export async function createPayPalCheckout(userId, plan) {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal credentials not configured');
  }

  const planId = PAYPAL_PLAN_IDS[plan];
  if (!planId) {
    throw new Error(`PayPal plan ID not configured for plan: ${plan}`);
  }

  try {
    // Create subscription
    const subscriptionData = {
      plan_id: planId,
      start_time: new Date(Date.now() + 60000).toISOString(), // Start in 1 minute
      subscriber: {
        name: {
          given_name: 'Customer',
          surname: 'Name'
        }
      },
      application_context: {
        brand_name: 'Nova‑XFinity AI',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
        },
        return_url: `${FRONTEND_URL}/subscription?subscription_id={SUB_ID}&token={TOKEN}`,
        cancel_url: `${FRONTEND_URL}/subscription?canceled=true`
      }
    };

    const subscription = await makePayPalRequest('POST', '/v1/billing/subscriptions', subscriptionData);

    // Find approval link
    const approvalLink = subscription.links?.find(link => link.rel === 'approve');
    if (!approvalLink) {
      throw new Error('No approval URL returned from PayPal');
    }

    return {
      subscriptionId: subscription.id,
      approvalUrl: approvalLink.href,
      status: subscription.status
    };
  } catch (error) {
    console.error('PayPal checkout creation error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create PayPal checkout');
  }
}

/**
 * Execute approved PayPal subscription
 * Called after user approves subscription on PayPal
 * Note: PayPal subscriptions are automatically active after approval
 */
export async function executePayPalSubscription(subscriptionId, token) {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal credentials not configured');
  }

  try {
    // Get subscription details (subscription is already active after approval)
    const subscriptionDetails = await makePayPalRequest(
      'GET',
      `/v1/billing/subscriptions/${subscriptionId}`
    );

    // Extract payer ID from subscriber object
    const payerId = subscriptionDetails.subscriber?.payer_id || 
                   subscriptionDetails.subscriber?.email_address ||
                   null;

    return {
      subscriptionId: subscriptionDetails.id,
      status: subscriptionDetails.status,
      payerId: payerId,
      planId: subscriptionDetails.plan_id,
      startTime: subscriptionDetails.start_time,
      billingInfo: subscriptionDetails.billing_info
    };
  } catch (error) {
    console.error('PayPal subscription execution error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to execute PayPal subscription');
  }
}

/**
 * Get PayPal subscription details
 */
export async function getPayPalSubscription(subscriptionId) {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal credentials not configured');
  }

  try {
    const subscription = await makePayPalRequest(
      'GET',
      `/v1/billing/subscriptions/${subscriptionId}`
    );

    return subscription;
  } catch (error) {
    console.error('PayPal subscription fetch error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch PayPal subscription');
  }
}

/**
 * Cancel PayPal subscription
 */
export async function cancelPayPalSubscription(subscriptionId, reason = 'User requested cancellation') {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal credentials not configured');
  }

  try {
    const cancelData = {
      reason: reason
    };

    await makePayPalRequest(
      'POST',
      `/v1/billing/subscriptions/${subscriptionId}/cancel`,
      cancelData
    );

    return { success: true };
  } catch (error) {
    console.error('PayPal subscription cancellation error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to cancel PayPal subscription');
  }
}
