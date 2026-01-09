/**
 * Environment Variable Validation
 * Ensures all required environment variables are set at application startup
 */

/**
 * Validate required environment variables
 * Throws error and exits if any required variable is missing
 */
export const validateEnv = () => {
  const errors = [];
  const warnings = [];

  // Required environment variables (app will fail without these)
  const requiredVars = [
    'DATABASE_URL',
    'SECRET', // JWT secret
  ];

  // Critical API keys (required for core functionality)
  // Note: Some may be optional depending on your deployment
  const criticalApiKeys = [
    'GEMINI_API_KEY', // Primary AI provider
  ];

  // Optional API keys (warnings only if missing, depending on features used)
  const optionalApiKeys = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GROQ_API_KEY',
    'STRIPE_SECRET_KEY',
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET',
    'EMAIL_API_KEY',
    'RESEND_API_KEY',
  ];

  // Check required variables
  requiredVars.forEach((key) => {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  // Check critical API keys
  // In production, you might want these to be required
  // For now, we'll make GEMINI_API_KEY required since it's the default provider
  criticalApiKeys.forEach((key) => {
    if (!process.env[key]) {
      errors.push(`Missing critical API key: ${key}`);
    }
  });

  // Check optional API keys (warnings only)
  // These are needed only if corresponding features are used
  optionalApiKeys.forEach((key) => {
    if (!process.env[key]) {
      warnings.push(`Optional API key not set: ${key} (some features may be unavailable)`);
    }
  });

  // Check Stripe configuration (if using Stripe)
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_WEBHOOK_SECRET) {
    warnings.push('STRIPE_SECRET_KEY is set but STRIPE_WEBHOOK_SECRET is missing (webhooks will not be verified)');
  }

  // Check PayPal configuration (if using PayPal)
  if (process.env.PAYPAL_CLIENT_ID && !process.env.PAYPAL_CLIENT_SECRET) {
    errors.push('PAYPAL_CLIENT_ID is set but PAYPAL_CLIENT_SECRET is missing');
  }
  if (process.env.PAYPAL_CLIENT_SECRET && !process.env.PAYPAL_CLIENT_ID) {
    errors.push('PAYPAL_CLIENT_SECRET is set but PAYPAL_CLIENT_ID is missing');
  }
  if ((process.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_SECRET) && !process.env.PAYPAL_WEBHOOK_ID) {
    warnings.push('PayPal credentials are set but PAYPAL_WEBHOOK_ID is missing (webhooks will not be verified)');
  }

  // Display warnings (non-fatal)
  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment Variable Warnings:');
    warnings.forEach((warning) => {
      console.warn(`   - ${warning}`);
    });
    console.warn('');
  }

  // Display errors and exit (fatal)
  if (errors.length > 0) {
    console.error('\n❌ Missing Required Environment Variables:');
    errors.forEach((error) => {
      console.error(`   - ${error}`);
    });
    console.error('\n💡 Please set all required environment variables in your .env file.');
    console.error('   See .env.example for a complete list of required variables.\n');
    process.exit(1);
  }

  // Success message
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All required environment variables are set');
  } else if (errors.length === 0) {
    console.log('✅ All required environment variables are set (some optional keys are missing)');
  }
};

/**
 * Get environment variable with optional default
 * @param {string} key - Environment variable name
 * @param {any} defaultValue - Default value if not set
 * @returns {string|any} Environment variable value or default
 */
export const getEnv = (key, defaultValue = null) => {
  return process.env[key] || defaultValue;
};

/**
 * Check if environment variable is set
 * @param {string} key - Environment variable name
 * @returns {boolean} True if variable is set
 */
export const hasEnv = (key) => {
  return !!process.env[key];
};
