const express = require("express");
const router = express.Router();
const authController = require("../../../../controllers/auth/index");

const {
  authenticationRefreshToken,
  authentication,
} = require("../../../../auth/authUtil.hybrid");
const asyncHandle = require("../../../../helpers/asyncHandle");
const loggerMiddleware = require("../../../../middlewares/logger.middleware");
const {
  createUserSchema,
  loginUserSchema,
} = require("../../../../validations/Joi/user.validation");
const { validate } = require("../../../../middlewares/validate");
const { limitAuth } = require("../../../../configs/rateLimit.config");
const {
  limitVerifyOtp,
} = require("../../../../infrastructures/rate-limit/rateLimit");
//verify
router.get(
  "/verify-email",
  limitVerifyOtp,
  asyncHandle(authController.verifyEmail)
);
router.post(
  "/verify-email",
  limitVerifyOtp,
  asyncHandle(authController.verifyOtp)
);

// router.use(limitAuth);
router.post("/verify", asyncHandle(authController.resendOtp));

router.post(
  "/register",
  validate(createUserSchema),
  asyncHandle(authController.signUp)
);

router.post(
  "/login",
  validate(loginUserSchema),
  asyncHandle(authController.login)
);

router.post(
  "/refresh",
  authenticationRefreshToken,
  asyncHandle(authController.handleToken)
);
router.use(authentication);
//turn off log
router.use(loggerMiddleware());
router.post("/logout", asyncHandle(authController.logout));

router.post("/logout-all", asyncHandle(authController.logoutAll));

router.get("/sessions", asyncHandle(authController.getActiveSessions));

router.delete(
  "/sessions/:sessionId",
  asyncHandle(authController.revokeSession)
);

module.exports = router;
