// Rate limiting configuration
const rateLimits = new Map();

// Simple in-memory rate limiter
const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Get or create rate limit entry
    let limiter = rateLimits.get(key);
    
    if (!limiter) {
      limiter = {
        count: 0,
        resetTime: now + windowMs
      };
      rateLimits.set(key, limiter);
    }
    
    // Reset if window has passed
    if (now > limiter.resetTime) {
      limiter.count = 0;
      limiter.resetTime = now + windowMs;
    }
    
    // Increment counter
    limiter.count++;
    
    // Set headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - limiter.count));
    res.setHeader('X-RateLimit-Reset', new Date(limiter.resetTime).toISOString());
    
    // Check if limit exceeded
    if (limiter.count > max) {
      return res.status(429).json({
        status: 'error',
        message
      });
    }
    
    next();
  };
};

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, limiter] of rateLimits.entries()) {
    if (now > limiter.resetTime + 60000) { // 1 minute after reset
      rateLimits.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Specific rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per 15 minutes
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50
});

module.exports = {
  rateLimit,
  authLimiter,
  apiLimiter,
  strictLimiter
};
