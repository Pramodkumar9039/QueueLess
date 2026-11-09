const rateLimit = require("express-rate-limit");

const createAuthRateLimiter = (limit, windowMs, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({ message });
    },
  });

const loginRateLimiter = createAuthRateLimiter(
  10,
  15 * 60 * 1000,
  "Too many login attempts. Please try again later."
);

const registerRateLimiter = createAuthRateLimiter(
  5,
  60 * 60 * 1000,
  "Too many registration attempts. Please try again later."
);

module.exports = {
  createAuthRateLimiter,
  loginRateLimiter,
  registerRateLimiter,
};
