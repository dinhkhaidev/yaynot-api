/**
 * Middleware để rate limit report creation
 * Ngăn spam reports
 */

const rateLimit = {};
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 phút
const MAX_REPORTS_PER_WINDOW = 5; // Tối đa 5 reports/phút

const reportRateLimit = (req, res, next) => {
  const userId = req.user.user_id;
  const now = Date.now();

  if (!rateLimit[userId]) {
    rateLimit[userId] = {
      count: 1,
      startTime: now,
    };
    return next();
  }

  const userLimit = rateLimit[userId];
  const timeElapsed = now - userLimit.startTime;

  // Reset nếu đã qua window
  if (timeElapsed > RATE_LIMIT_WINDOW) {
    rateLimit[userId] = {
      count: 1,
      startTime: now,
    };
    return next();
  }

  // Check limit
  if (userLimit.count >= MAX_REPORTS_PER_WINDOW) {
    return res.status(429).json({
      status: 429,
      message: "Too many reports. Please try again later.",
      retryAfter: Math.ceil((RATE_LIMIT_WINDOW - timeElapsed) / 1000),
    });
  }

  userLimit.count++;
  next();
};

// Cleanup old entries mỗi 5 phút
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimit).forEach((userId) => {
    if (now - rateLimit[userId].startTime > RATE_LIMIT_WINDOW * 2) {
      delete rateLimit[userId];
    }
  });
}, 5 * 60 * 1000);

module.exports = { reportRateLimit };
