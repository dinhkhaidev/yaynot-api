const express = require("express");
const router = express.Router();
const asyncHandle = require("../../helpers/asyncHandle");
const UserProfileController = require("../../controllers/userProfile/index");
const {
  createUserProfileSchema,
} = require("../../validations/Joi/userProfile.validation");
const { validate } = require("../../middlewares/validate");
router.post(
  "/",
  validate(createUserProfileSchema),
  asyncHandle(UserProfileController.upsertUserProfile)
);
module.exports = router;
