const { CREATED, OK } = require("../../core/success.response");
const FollowSerivice = require("../../services/follow.service");

class FollowController {
  followUser = async (req, res, next) => {
    new CREATED({
      message: "Follow user successful!",
      metadata: await FollowSerivice.followUser({
        followerId: req.user.user_id,
        followingId: req.body.followingId,
      }),
    }).send(res);
  };
  unfollowUser = async (req, res, next) => {
    new OK({
      message: "Unfollow user successful!",
      metadata: await FollowSerivice.unfollowUser({
        followerId: req.user.user_id,
        followingId: req.body.followingId,
      }),
    }).send(res);
  };
  getListFollower = async (req, res, next) => {
    new OK({
      message: "Get follower list successful!",
      metadata: await FollowSerivice.getListFollowByAction({
        ...req.query,
        followId: req.user.user_id,
        action: "follower",
      }),
    }).send(res);
  };
  getListFollowing = async (req, res, next) => {
    new OK({
      message: "Get following list successful!",
      metadata: await FollowSerivice.getListFollowByAction({
        ...req.query,
        followId: req.user.user_id,
        action: "following",
      }),
    }).send(res);
  };
}
module.exports = new FollowController();
