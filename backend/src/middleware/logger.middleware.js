/**
 * Request Logging Middleware
 * Centralized HTTP request logging for debugging and auditing
 * Logs timestamp, method, URL, status code, response time, and user ID
 */

/**
 * Request logging middleware
 * Captures request metadata and logs when response is finished
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const requestLogger = (req, res, next) => {
  // Skip logging for health checks and static files
  if (req.path === '/health' || req.path.startsWith('/static')) {
    return next();
  }

  // Record start time
  const startTime = Date.now();

  // Extract user ID from request (set by auth middleware)
  const userId = req.user?.id || null;

  // Capture response finish event
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    // Build log entry
    const logEntry = {
      timestamp,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: userId || 'anonymous',
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
    };

    // Format log output
    const logMessage = [
      `[${logEntry.timestamp}]`,
      `${logEntry.method}`,
      `${logEntry.url}`,
      `${logEntry.statusCode}`,
      `(${logEntry.responseTime})`,
      `User: ${logEntry.userId}`,
      `IP: ${logEntry.ip}`,
    ].join(' ');

    // Log based on status code
    if (res.statusCode >= 500) {
      // Server errors - always log
      console.error(logMessage);
    } else if (res.statusCode >= 400) {
      // Client errors - log as warning
      console.warn(logMessage);
    } else {
      // Success responses - log as info (can be filtered in production)
      if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_REQUEST_LOGS === 'true') {
        console.log(logMessage);
      }
    }
  });

  // Continue to next middleware
  next();
};

/**
 * Error logging middleware (used in error handler)
 * Logs detailed error information for debugging
 * 
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 */
export const logError = (error, req) => {
  const userId = req.user?.id || 'anonymous';
  const timestamp = new Date().toISOString();
  
  const errorLog = {
    timestamp,
    method: req.method,
    url: req.originalUrl || req.url,
    userId,
    error: {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
  };

  console.error(`[${timestamp}] ERROR:`, {
    ...errorLog,
    error: errorLog.error.message,
    stack: errorLog.error.stack,
  });
};