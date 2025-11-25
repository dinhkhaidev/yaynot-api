const { rateLimit } = require("express-rate-limit");
const windowMsAuth =
  (Number(process.env.WINDOW_MS_AUTH_MINUTES) || 10) * 60 * 1000;
const windowMsUser =
  (Number(process.env.WINDOW_MS_USER_MINUTES) || 10) * 60 * 1000;
const windowMsVerifyOtp =
  (Number(process.env.WINDOW_MS_VERIFY_OTP_MINUTES) || 10) * 60 * 1000;

const limitAuth = rateLimit({
  windowMs: windowMsAuth,
  max: Number(process.env.MAX_AUTH),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: 429,
    message: process.env.MESSAGE_AUTH,
  },
});

const limitUser = rateLimit({
  windowMs: windowMsUser,
  max: Number(process.env.MAX_USER, 10),
  message: {
    status: 429,
    message: process.env.MESSAGE_USER,
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const limitVerifyOtp = rateLimit({
  windowMs: windowMsVerifyOtp,
  max: Number(process.env.MAX_VERIFY_OTP, 10),
  message: {
    status: 429,
    message: process.env.MESSAGE_VERIFY_OTP,
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
module.exports = { limitAuth, limitUser, limitVerifyOtp };
