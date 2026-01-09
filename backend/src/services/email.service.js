/**
 * Email Service
 * Handles sending emails using Resend
 */

import { Resend } from 'resend';

// Initialize Resend only if API key is available
const apiKey = process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@nova-xfinity.ai';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Nova‑XFinity AI';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Send email using Resend
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!resend || !apiKey) {
    // Email API key not configured - silently return failure
    return { success: false, error: 'Email API key not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      text
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    // Error will be logged by centralized error handler if needed
    return { success: false, error: error.message };
  }
};

/**
 * Send quota warning email (80% threshold)
 */
export const sendQuotaWarningEmail = async (userEmail, userName, quotaInfo) => {
  const { feature, currentUsage, limit, percentage } = quotaInfo;
  const featureName = feature.charAt(0).toUpperCase() + feature.slice(1);

  const subject = `Quota Warning: ${percentage}% of Your ${featureName} Limit Used`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .usage-bar { background: #e5e7eb; height: 30px; border-radius: 15px; margin: 20px 0; overflow: hidden; position: relative; }
        .usage-fill { background: linear-gradient(90deg, #f59e0b 0%, #ef4444 100%); height: 100%; transition: width 0.3s; }
        .usage-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; color: #1f2937; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Quota Warning</h1>
        </div>
        <div class="content">
          <p>Hi ${userName || 'there'},</p>
          
          <p>You've used <strong>${percentage}%</strong> of your monthly ${featureName} quota. Here's your current usage:</p>
          
          <div class="warning-box">
            <strong>Usage Summary:</strong><br>
            <strong>${featureName}:</strong> ${currentUsage} / ${limit === -1 ? 'Unlimited' : limit}<br>
            <strong>Remaining:</strong> ${limit === -1 ? 'Unlimited' : Math.max(0, limit - currentUsage)}
          </div>
          
          <div class="usage-bar">
            <div class="usage-fill" style="width: ${Math.min(percentage, 100)}%"></div>
            <div class="usage-text">${percentage}%</div>
          </div>
          
          <p>To continue using all features without interruption, consider upgrading your plan or wait until your quota resets next month.</p>
          
          <a href="${FRONTEND_URL}/subscription" class="button">View Usage & Upgrade</a>
          
          <p>Your quota will automatically reset at the beginning of each billing period.</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Nova‑XFinity AI.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Quota Warning: ${percentage}% of Your ${featureName} Limit Used

Hi ${userName || 'there'},

You've used ${percentage}% of your monthly ${featureName} quota.

Usage Summary:
${featureName}: ${currentUsage} / ${limit === -1 ? 'Unlimited' : limit}
Remaining: ${limit === -1 ? 'Unlimited' : Math.max(0, limit - currentUsage)}

To continue using all features without interruption, consider upgrading your plan or wait until your quota resets next month.

View Usage: ${FRONTEND_URL}/subscription

Your quota will automatically reset at the beginning of each billing period.

This is an automated notification from Nova‑XFinity AI.
  `;

  return await sendEmail({ to: userEmail, subject, html, text });
};

/**
 * Send quota exceeded email (100% threshold)
 */
export const sendQuotaExceededEmail = async (userEmail, userName, quotaInfo) => {
  const { feature, currentUsage, limit } = quotaInfo;
  const featureName = feature.charAt(0).toUpperCase() + feature.slice(1);

  const subject = `Action Required: ${featureName} Quota Exceeded`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .error-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button-secondary { display: inline-block; padding: 12px 24px; background: #6b7280; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; margin-left: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚫 Quota Exceeded</h1>
        </div>
        <div class="content">
          <p>Hi ${userName || 'there'},</p>
          
          <div class="error-box">
            <strong>⚠️ Important:</strong> You've reached your monthly ${featureName} quota limit.<br><br>
            <strong>Usage:</strong> ${currentUsage} / ${limit === -1 ? 'Unlimited' : limit}
          </div>
          
          <p>${featureName} generation has been temporarily disabled until your quota resets at the beginning of your next billing period.</p>
          
          <p>To continue using ${featureName} immediately, you can:</p>
          <ul>
            <li>Upgrade to a higher plan with more quota</li>
            <li>Wait for your quota to reset at the start of next month</li>
          </ul>
          
          <a href="${FRONTEND_URL}/subscription" class="button">Upgrade Plan</a>
          <a href="${FRONTEND_URL}/account" class="button-secondary">View Account</a>
          
          <p>Your quota will automatically reset at the beginning of each billing period.</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Nova‑XFinity AI.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Action Required: ${featureName} Quota Exceeded

Hi ${userName || 'there'},

⚠️ Important: You've reached your monthly ${featureName} quota limit.

Usage: ${currentUsage} / ${limit === -1 ? 'Unlimited' : limit}

${featureName} generation has been temporarily disabled until your quota resets at the beginning of your next billing period.

To continue using ${featureName} immediately, you can:
- Upgrade to a higher plan with more quota
- Wait for your quota to reset at the start of next month

Upgrade Plan: ${FRONTEND_URL}/subscription
View Account: ${FRONTEND_URL}/account

Your quota will automatically reset at the beginning of each billing period.

This is an automated notification from Nova‑XFinity AI.
  `;

  return await sendEmail({ to: userEmail, subject, html, text });
};

/**
 * Send quota reset notification email
 */
export const sendQuotaResetEmail = async (userEmail, userName, plan) => {
  const subject = 'Your Monthly Quota Has Been Reset';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Quota Reset</h1>
        </div>
        <div class="content">
          <p>Hi ${userName || 'there'},</p>
          
          <div class="success-box">
            <strong>Great news!</strong> Your monthly quota has been reset, and you now have full access to all features in your ${plan} plan.
          </div>
          
          <p>You can now continue generating content without any restrictions. Your quota will reset automatically at the beginning of each billing period.</p>
          
          <a href="${FRONTEND_URL}/subscription" class="button">View Your Usage</a>
          
          <p>Thank you for using Nova‑XFinity AI!</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Nova‑XFinity AI.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Your Monthly Quota Has Been Reset

Hi ${userName || 'there'},

Great news! Your monthly quota has been reset, and you now have full access to all features in your ${plan} plan.

You can now continue generating content without any restrictions. Your quota will reset automatically at the beginning of each billing period.

View Your Usage: ${FRONTEND_URL}/subscription

Thank you for using Nova‑XFinity AI!

This is an automated notification from Nova‑XFinity AI.
  `;

  return await sendEmail({ to: userEmail, subject, html, text });
};
