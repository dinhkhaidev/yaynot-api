const express = require("express");
const router = express.Router();
const AccessController = require("../../controllers/access/index");
const asyncHandle = require("../../helpers/asyncHandle");
const { validate } = require("../../middlewares/validate");
const {
  createUserSchema,
  loginUserSchema,
  logoutUserSchema,
} = require("../../validations/user.validation");
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
router.post(
  "/logout",
  validate(logoutUserSchema),
  asyncHandle(AccessController.logout)
);
module.exports = router;
