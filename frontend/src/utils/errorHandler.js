/**
 * Centralized Error Handler Utility
 * 
 * Provides structured, user-friendly error messages with:
 * - Error Type: What failed?
 * - Probable Cause: Why did it fail?
 * - Suggested Fix: What the user can do next
 * 
 * @module utils/errorHandler
 */

/**
 * Error categories and their structured messages
 */
const ERROR_TYPES = {
  // API Key Errors
  API_KEY_MISSING: {
    type: 'API Key Missing',
    cause: 'No API key configured for this service',
    fix: 'Go to Settings and configure your API key. A Gemini API key is required for basic functionality.',
    category: 'configuration'
  },
  API_KEY_INVALID: {
    type: 'API Key Invalid',
    cause: 'The API key is incorrect or has been revoked',
    fix: 'Verify your API key in Settings. Check that the key is correct and hasn\'t expired.',
    category: 'configuration'
  },
  API_KEY_QUOTA_EXCEEDED: {
    type: 'API Quota Exceeded',
    cause: 'Your API key has reached its usage limit',
    fix: 'Check your API provider dashboard for quota limits. Consider upgrading your plan or waiting for quota reset.',
    category: 'quota'
  },

  // Generation Errors
  GENERATION_FAILED: {
    type: 'Content Generation Failed',
    cause: 'The AI service could not generate the requested content',
    fix: 'Check your prompt for clarity and try again. If the issue persists, verify your API key and network connection.',
    category: 'generation'
  },
  IMAGE_GENERATION_FAILED: {
    type: 'Image Generation Failed',
    cause: 'The image generation service encountered an error',
    fix: 'Verify your prompt is clear and descriptive. Check your API key settings and try again. If using a paid API key, ensure it\'s properly configured.',
    category: 'generation'
  },
  VIDEO_GENERATION_FAILED: {
    type: 'Video Generation Failed',
    cause: 'The video generation service could not create the video',
    fix: 'Video generation requires a valid paid API key. Go to Settings to configure your API key, or try again later if the service is temporarily unavailable.',
    category: 'generation'
  },
  AUDIO_GENERATION_FAILED: {
    type: 'Audio Generation Failed',
    cause: 'The audio generation service encountered an error',
    fix: 'Check your prompt and API key configuration. Ensure your API key supports audio generation features.',
    category: 'generation'
  },
  SECTION_GENERATION_FAILED: {
    type: 'Section Generation Failed',
    cause: 'Could not generate content for this section',
    fix: 'The AI service may be temporarily unavailable. Try generating this section again, or check your API key configuration.',
    category: 'generation'
  },
  METADATA_GENERATION_FAILED: {
    type: 'Metadata Generation Failed',
    cause: 'Could not generate SEO metadata for your article',
    fix: 'Check your topic and keywords are valid. Verify your API key in Settings and try again.',
    category: 'generation'
  },
  OUTLINE_GENERATION_FAILED: {
    type: 'Outline Generation Failed',
    cause: 'Could not generate article outline',
    fix: 'Ensure your topic is clear and keywords are relevant. Check API key configuration and try again.',
    category: 'generation'
  },

  // Network Errors
  NETWORK_ERROR: {
    type: 'Network Connection Error',
    cause: 'Unable to connect to the server',
    fix: 'Check your internet connection and try again. If the problem persists, the service may be temporarily unavailable.',
    category: 'network'
  },
  TIMEOUT_ERROR: {
    type: 'Request Timeout',
    cause: 'The request took too long to complete',
    fix: 'The AI service may be experiencing high load. Please try again in a few moments.',
    category: 'network'
  },
  SERVER_ERROR: {
    type: 'Server Error',
    cause: 'The server encountered an unexpected error',
    fix: 'This is a temporary issue. Please try again in a few moments. If the problem persists, contact support.',
    category: 'server'
  },

  // Quota/Usage Errors
  QUOTA_EXCEEDED: {
    type: 'Usage Quota Exceeded',
    cause: 'You have reached your plan\'s usage limit',
    fix: 'Upgrade your plan to continue generating content, or wait for your quota to reset.',
    category: 'quota'
  },
  RATE_LIMIT_EXCEEDED: {
    type: 'Rate Limit Exceeded',
    cause: 'Too many requests in a short time period',
    fix: 'Please wait a moment before making another request. Consider spacing out your generation requests.',
    category: 'quota'
  },

  // Validation Errors
  VALIDATION_ERROR: {
    type: 'Input Validation Error',
    cause: 'One or more required fields are missing or invalid',
    fix: 'Please check all required fields are filled correctly and try again.',
    category: 'validation'
  },
  MISSING_TOPIC: {
    type: 'Topic Required',
    cause: 'Article topic is required to generate content',
    fix: 'Please enter a topic for your article before starting generation.',
    category: 'validation'
  },
  MISSING_PROMPT: {
    type: 'Prompt Required',
    cause: 'A prompt is required to generate content',
    fix: 'Please enter a description of what you want to generate.',
    category: 'validation'
  },
  MISSING_IMAGE: {
    type: 'Image Required',
    cause: 'A source image is required for editing',
    fix: 'Please upload an image before attempting to edit it.',
    category: 'validation'
  },

  // Authentication Errors
  AUTH_FAILED: {
    type: 'Authentication Failed',
    cause: 'Invalid email or password',
    fix: 'Please check your credentials and try again. If you forgot your password, use the "Forgot password" link.',
    category: 'auth'
  },
  AUTH_TOKEN_MISSING: {
    type: 'Authentication Token Missing',
    cause: 'Your session has expired or you are not logged in',
    fix: 'Please log in again to continue.',
    category: 'auth'
  },
  AUTH_TOKEN_INVALID: {
    type: 'Authentication Token Invalid',
    cause: 'Your session has expired',
    fix: 'Please log in again to continue.',
    category: 'auth'
  },
  OAUTH_FAILED: {
    type: 'OAuth Login Failed',
    cause: 'Social login authentication failed',
    fix: 'The OAuth provider may be temporarily unavailable. Please try again or use email/password login.',
    category: 'auth'
  },

  // File Errors
  FILE_TOO_LARGE: {
    type: 'File Too Large',
    cause: 'The uploaded file exceeds the maximum size limit',
    fix: 'Please select a smaller file. Maximum file size is typically 10MB for images and 100MB for videos.',
    category: 'file'
  },
  INVALID_FILE_TYPE: {
    type: 'Invalid File Type',
    cause: 'The uploaded file type is not supported',
    fix: 'Please select a supported file format (e.g., PNG, JPG for images; MP4 for videos).',
    category: 'file'
  },

  // Subscription/Payment Errors
  SUBSCRIPTION_ERROR: {
    type: 'Subscription Error',
    cause: 'An error occurred with your subscription',
    fix: 'Please check your subscription status in the Account page. If the issue persists, contact support.',
    category: 'subscription'
  },
  PAYMENT_FAILED: {
    type: 'Payment Processing Failed',
    cause: 'The payment could not be processed',
    fix: 'Please check your payment method and try again. Ensure your card has sufficient funds or your PayPal account is active.',
    category: 'subscription'
  },
  CHECKOUT_FAILED: {
    type: 'Checkout Failed',
    cause: 'Unable to start the checkout process',
    fix: 'Please check your internet connection and try again. If the problem persists, the payment provider may be temporarily unavailable.',
    category: 'subscription'
  },

  // Unknown/Generic Errors
  UNKNOWN_ERROR: {
    type: 'Unexpected Error',
    cause: 'An unexpected error occurred',
    fix: 'Please try again. If the problem persists, contact support with details about what you were trying to do.',
    category: 'unknown'
  }
};

/**
 * Extract error information from various error formats
 * @param {Error|Object|string} error - The error object or message
 * @returns {Object} Parsed error information
 */
function parseError(error) {
  // Handle string errors
  if (typeof error === 'string') {
    return { message: error, code: null, status: null };
  }

  // Handle Error objects
  if (error instanceof Error) {
    return {
      message: error.message,
      code: error.code || null,
      status: error.status || null,
      originalError: error
    };
  }

  // Handle API response errors
  if (error?.response) {
    const response = error.response;
    return {
      message: response.data?.error?.message || 
               response.data?.detail || 
               response.data?.message || 
               `Request failed with status ${response.status}`,
      code: response.data?.error?.code || response.statusText,
      status: response.status,
      originalError: error
    };
  }

  // Handle error objects with message
  if (error?.message) {
    return {
      message: error.message,
      code: error.code || null,
      status: error.status || null,
      originalError: error
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: null,
    status: null,
    originalError: error
  };
}

/**
 * Determine error type from error message or code
 * @param {Object} parsedError - Parsed error information
 * @returns {string} Error type key
 */
function determineErrorType(parsedError) {
  const { message, code, status } = parsedError;
  const lowerMessage = message?.toLowerCase() || '';

  // Network errors
  if (status === 0 || lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'NETWORK_ERROR';
  }
  if (lowerMessage.includes('timeout') || status === 408) {
    return 'TIMEOUT_ERROR';
  }
  if (status >= 500) {
    return 'SERVER_ERROR';
  }

  // API key errors
  if (lowerMessage.includes('api key') || lowerMessage.includes('apikey')) {
    if (lowerMessage.includes('missing') || lowerMessage.includes('not found')) {
      return 'API_KEY_MISSING';
    }
    if (lowerMessage.includes('invalid') || lowerMessage.includes('unauthorized') || status === 401) {
      return 'API_KEY_INVALID';
    }
    if (lowerMessage.includes('quota') || lowerMessage.includes('limit')) {
      return 'API_KEY_QUOTA_EXCEEDED';
    }
    return 'API_KEY_INVALID';
  }

  // Quota errors
  if (lowerMessage.includes('quota') || lowerMessage.includes('usage limit') || status === 429) {
    return 'QUOTA_EXCEEDED';
  }
  if (lowerMessage.includes('rate limit')) {
    return 'RATE_LIMIT_EXCEEDED';
  }

  // Auth errors
  if (status === 401 || lowerMessage.includes('unauthorized') || lowerMessage.includes('authentication')) {
    if (lowerMessage.includes('token')) {
      return 'AUTH_TOKEN_INVALID';
    }
    return 'AUTH_FAILED';
  }
  if (lowerMessage.includes('oauth')) {
    return 'OAUTH_FAILED';
  }

  // Generation errors
  if (lowerMessage.includes('generation failed') || lowerMessage.includes('failed to generate')) {
    if (lowerMessage.includes('image')) {
      return 'IMAGE_GENERATION_FAILED';
    }
    if (lowerMessage.includes('video')) {
      return 'VIDEO_GENERATION_FAILED';
    }
    if (lowerMessage.includes('audio')) {
      return 'AUDIO_GENERATION_FAILED';
    }
    if (lowerMessage.includes('section')) {
      return 'SECTION_GENERATION_FAILED';
    }
    if (lowerMessage.includes('metadata')) {
      return 'METADATA_GENERATION_FAILED';
    }
    if (lowerMessage.includes('outline')) {
      return 'OUTLINE_GENERATION_FAILED';
    }
    return 'GENERATION_FAILED';
  }

  // Validation errors
  if (status === 400 || lowerMessage.includes('validation') || lowerMessage.includes('required')) {
    if (lowerMessage.includes('topic')) {
      return 'MISSING_TOPIC';
    }
    if (lowerMessage.includes('prompt')) {
      return 'MISSING_PROMPT';
    }
    if (lowerMessage.includes('image')) {
      return 'MISSING_IMAGE';
    }
    return 'VALIDATION_ERROR';
  }

  // File errors
  if (lowerMessage.includes('file') && lowerMessage.includes('large')) {
    return 'FILE_TOO_LARGE';
  }
  if (lowerMessage.includes('file type') || lowerMessage.includes('invalid file')) {
    return 'INVALID_FILE_TYPE';
  }

  // Subscription/Payment errors
  if (lowerMessage.includes('subscription') || lowerMessage.includes('checkout') || lowerMessage.includes('payment')) {
    if (lowerMessage.includes('cancel') || lowerMessage.includes('canceled')) {
      return 'VALIDATION_ERROR'; // User cancellation is a validation case
    }
    if (lowerMessage.includes('failed') || lowerMessage.includes('error')) {
      if (lowerMessage.includes('payment') || lowerMessage.includes('checkout')) {
        return lowerMessage.includes('checkout') ? 'CHECKOUT_FAILED' : 'PAYMENT_FAILED';
      }
      return 'SUBSCRIPTION_ERROR';
    }
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Get structured error message
 * @param {Error|Object|string} error - The error to process
 * @param {string} customType - Optional custom error type override
 * @returns {Object} Structured error information
 */
export function getStructuredError(error, customType = null) {
  const parsedError = parseError(error);
  const errorType = customType || determineErrorType(parsedError);
  const errorTemplate = ERROR_TYPES[errorType] || ERROR_TYPES.UNKNOWN_ERROR;

  return {
    type: errorTemplate.type,
    cause: errorTemplate.cause,
    fix: errorTemplate.fix,
    category: errorTemplate.category,
    originalMessage: parsedError.message,
    code: parsedError.code,
    status: parsedError.status,
    // Full formatted message for display
    message: `${errorTemplate.type}: ${errorTemplate.cause}. ${errorTemplate.fix}`,
    // Short message for alerts/toasts
    shortMessage: `${errorTemplate.type}: ${errorTemplate.cause}`,
    // Detailed message with fix
    detailedMessage: `${errorTemplate.type}\n\nCause: ${errorTemplate.cause}\n\nSolution: ${errorTemplate.fix}`
  };
}

/**
 * Display error to user (using alert for now, can be replaced with toast system)
 * @param {Error|Object|string} error - The error to display
 * @param {string} customType - Optional custom error type
 */
export function showError(error, customType = null) {
  const structuredError = getStructuredError(error, customType);
  
  // Log to console for debugging
  console.warn('Error Handler:', {
    type: structuredError.type,
    cause: structuredError.cause,
    originalMessage: structuredError.originalMessage,
    code: structuredError.code,
    status: structuredError.status
  });

  // Display to user
  alert(structuredError.detailedMessage);
  
  return structuredError;
}

/**
 * Get error message string (for use with setError, toast, etc.)
 * @param {Error|Object|string} error - The error to process
 * @param {string} customType - Optional custom error type
 * @param {string} format - 'short', 'message', or 'detailed' (default: 'message')
 * @returns {string} Formatted error message
 */
export function getErrorMessage(error, customType = null, format = 'message') {
  const structuredError = getStructuredError(error, customType);
  
  switch (format) {
    case 'short':
      return structuredError.shortMessage;
    case 'detailed':
      return structuredError.detailedMessage;
    case 'message':
    default:
      return structuredError.message;
  }
}

/**
 * Check if error is of a specific category
 * @param {Error|Object|string} error - The error to check
 * @param {string} category - Category to check ('configuration', 'generation', 'network', etc.)
 * @returns {boolean}
 */
export function isErrorCategory(error, category) {
  const structuredError = getStructuredError(error);
  return structuredError.category === category;
}

export default {
  getStructuredError,
  showError,
  getErrorMessage,
  isErrorCategory,
  ERROR_TYPES
};
