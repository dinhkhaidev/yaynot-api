const express = require("express");
const router = express.Router();
const asyncHandle = require("../../helpers/asyncHandle");
const UserProfileController = require("../../controllers/userProfile/index");
const {
  createUserProfileSchema,
} = require("../../validations/Joi/userProfile.validation");
const { validate } = require("../../middlewares/validate");
const userProfileModel = require("../../models/userProfile.model");
router.patch(
  "/",
  validate(createUserProfileSchema),
  asyncHandle(UserProfileController.upsertUserProfile)
);
router.get("/", asyncHandle(UserProfileController.getInfoProfile));
module.exports = router;
