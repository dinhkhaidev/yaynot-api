const express = require("express");
const router = express.Router();
const asyncHandle = require("../../../../helpers/asyncHandle");
const UserProfileController = require("../../../../controllers/userProfile/index");
const { validate } = require("../../../../middlewares/validate");
const {
  createUserProfileSchema,
  updateAvatarSchema,
} = require("../../../../validations/Joi/userProfile.validation");

router.patch(
  "/",
  validate(createUserProfileSchema),
  asyncHandle(UserProfileController.upsertUserProfile)
);
router.get("/", asyncHandle(UserProfileController.getInfoProfile));
router.patch(
  "/avatar",
  validate(updateAvatarSchema),
  asyncHandle(UserProfileController.updateAvatar)
);

module.exports = router;
