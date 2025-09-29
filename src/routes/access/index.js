const express = require("express");
const router = express.Router();
const AccessController = require("../../controllers/access/index");
const asyncHandle = require("../../helpers/asyncHandle");
const { validate } = require("../../middlewares/validate");
const {
  createUserSchema,
  loginUserSchema,
  logoutUserSchema,
} = require("../../validations/Joi/user.validation");
const { authentication } = require("../../auth/authUtil");
router.post(
  "/register",
  validate(createUserSchema),
  asyncHandle(AccessController.signUp)
);
router.post(
  "/login",
  validate(loginUserSchema),
  asyncHandle(AccessController.login)
);
//middleware check auth
router.use(authentication);
router.post(
  "/logout",
  validate(logoutUserSchema),
  asyncHandle(AccessController.logout)
);
router.post("/verify", asyncHandle(AccessController.verifyOtp));
router.post("/refresh-token", asyncHandle(AccessController.handleToken));
module.exports = router;
