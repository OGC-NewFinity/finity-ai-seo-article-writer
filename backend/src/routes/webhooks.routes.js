/**
 * Webhook Routes
 * Handles webhook events from external services (PayPal, etc.)
 * 
 * Note: Webhook routes should NOT require authentication middleware
 * as they are called by external services
 */

import express from 'express';
import axios from 'axios';
import { handlePayPalWebhookEvent } from '../services/payments/paypalWebhookHandler.js';

const router = express.Router();

// PayPal credentials from environment
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

// Determine PayPal base URL (handle both URL and mode format)
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const PAYPAL_BASE_URL = PAYPAL_MODE.includes('sandbox') || PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

/**
 * Get PayPal access token for webhook verification
 */
async function getPayPalAccessToken() {
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
    console.error('[Webhook] PayPal access token error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with PayPal');
  }
}

/**
 * Verify PayPal webhook signature
 */
async function verifyPayPalWebhookSignature(headers, body) {
  if (!PAYPAL_WEBHOOK_ID) {
    console.warn('[Webhook] PAYPAL_WEBHOOK_ID not configured, skipping signature verification');
    // In development, you might want to allow webhooks without verification
    // In production, you should always verify signatures
    return process.env.NODE_ENV !== 'production';
  }

  // Helper to get header (Express lowercases header names)
  const getHeader = (name) => headers[name.toLowerCase()] || headers[name];

  const requiredHeaders = [
    'paypal-auth-algo',
    'paypal-cert-url',
    'paypal-transmission-id',
    'paypal-transmission-sig',
    'paypal-transmission-time'
  ];

  // Check if all required headers are present
  for (const header of requiredHeaders) {
    if (!getHeader(header)) {
      console.warn(`[Webhook] Missing required header: ${header}`);
      return false;
    }
  }

  try {
    const accessToken = await getPayPalAccessToken();

    // Prepare verification request body
    const verificationData = {
      auth_algo: getHeader('paypal-auth-algo'),
      cert_url: getHeader('paypal-cert-url'),
      transmission_id: getHeader('paypal-transmission-id'),
      transmission_sig: getHeader('paypal-transmission-sig'),
      transmission_time: getHeader('paypal-transmission-time'),
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: body
    };

    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
      verificationData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const verificationStatus = response.data.verification_status;

    if (verificationStatus === 'SUCCESS') {
      console.log('[Webhook] PayPal signature verification successful');
      return true;
    } else {
      console.warn(`[Webhook] PayPal signature verification failed: ${verificationStatus}`);
      return false;
    }
  } catch (error) {
    console.error('[Webhook] PayPal signature verification error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * POST /api/webhooks/paypal
 * Handle PayPal webhook events
 * 
 * PayPal requires that webhook endpoints:
 * 1. Return 200 OK status (always, even on errors)
 * 2. Respond within a reasonable timeframe
 * 3. Validate webhook signatures
 */
router.post('/paypal', async (req, res) => {
  // Always return 200 OK immediately (PayPal requirement)
  // Process webhook asynchronously
  res.status(200).json({ received: true });

  // Process webhook asynchronously
  (async () => {
    try {
      const headers = req.headers;
      const body = req.body;
      const getHeader = (name) => headers[name.toLowerCase()] || headers[name];

      console.log('[Webhook] Received PayPal webhook event:', {
        eventType: body.event_type,
        eventId: body.id,
        transmissionId: getHeader('paypal-transmission-id')
      });

      // Verify webhook signature
      const isValid = await verifyPayPalWebhookSignature(headers, body);

      if (!isValid) {
        console.error('[Webhook] Invalid PayPal webhook signature, ignoring event');
        return;
      }

      // Handle the webhook event
      const result = await handlePayPalWebhookEvent(body);
      console.log('[Webhook] PayPal webhook processed:', result);

    } catch (error) {
      // Log error but don't throw (we already returned 200 OK)
      console.error('[Webhook] Error processing PayPal webhook:', error);
    }
  })();
});

/**
 * POST /api/webhooks/paypal/test
 * Test endpoint for webhook handler (optional)
 * Allows testing webhook handling without PayPal
 */
router.post('/paypal/test', async (req, res) => {
  try {
    const { eventType, resource } = req.body;

    if (!eventType || !resource) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: eventType and resource'
      });
    }

    // Create test event object
    const testEvent = {
      id: `test-${Date.now()}`,
      event_type: eventType,
      resource: resource,
      create_time: new Date().toISOString(),
      summary: `Test ${eventType} event`
    };

    console.log('[Webhook Test] Processing test event:', testEvent);

    // Handle the test event
    const result = await handlePayPalWebhookEvent(testEvent);

    res.json({
      success: true,
      message: 'Test webhook event processed',
      result
    });
  } catch (error) {
    console.error('[Webhook Test] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
