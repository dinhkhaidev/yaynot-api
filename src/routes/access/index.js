const express = require("express");
const router = express.Router();
const AccessController = require("../../controllers/access/index");
const asyncHandle = require("../../helpers/asyncHandle");
const { validate } = require("../../middlewares/validate");
const { createUserSchema } = require("../../validations/user.validation");
router.post(
  "/sign-up",
  validate(createUserSchema),
  asyncHandle(AccessController.signUp)
);
module.exports = router;
