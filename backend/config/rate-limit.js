import rateLimit from 'express-rate-limit';
// Rate limit configuration for general APIs
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2, // Limit each session to 100 requests per windowMs
    keyGenerator: (req) => {
        // Use session ID as the key for rate limiting
        return req.session.sessionId;
    },
    message: 'Too many requests from this session, please try again later.',
});

// Rate limit configuration for auth APIs (more restrictive)
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each session to 10 requests per windowMs
    keyGenerator: (req) => {
        return req.session.sessionId;
    },
    message: 'Too many auth requests from this session, please try again later.',
});
// Rate limit configuration for auth APIs (more restrictive)
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each session to 10 requests per windowMs
    message: 'Too many auth requests from this session, please try again later.',
});