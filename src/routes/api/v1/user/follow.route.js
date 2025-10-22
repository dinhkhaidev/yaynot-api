const express = require("express");
const router = express.Router();
const FollowController = require("../../../../controllers/follow/index");
const asyncHandle = require("../../../../helpers/asyncHandle");
const { validate } = require("../../../../middlewares/validate");
const {
  followUserSchema,
} = require("../../../../validations/Joi/follow.validation");

router.post(
  "/",
  validate(followUserSchema),
  asyncHandle(FollowController.followUser)
);
router.delete(
  "/",
  validate(followUserSchema),
  asyncHandle(FollowController.unfollowUser)
);
router.get("/followers", asyncHandle(FollowController.getListFollower));
router.get("/followings", asyncHandle(FollowController.getListFollowing));

module.exports = router;
