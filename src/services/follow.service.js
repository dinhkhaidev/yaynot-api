const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require("../core/error.response");
const followModel = require("../models/follow.model");
const { findUserById } = require("../models/repositories/access.repo");
const {
  findFollowUserInDB,
  followUserInDB,
  unfollowUserInDB,
  getListFollowingById,
  getListFollowerById,
} = require("../models/repositories/follow.repo");
const {
  updateFollowCount,
  updateUnfollowCount,
} = require("../models/repositories/user.repo");

class FollowSerivice {
  static async followUser({ followerId, followingId }) {
    const userRecord = await findUserById(followingId);
    if (!userRecord) throw new NotFoundError("User incorrect!");
    if (followerId === followingId)
      throw new ForbiddenError("User can't follow themselves!");
    const followUserRecord = await findFollowUserInDB({
      followerId,
      followingId,
    });
    if (followUserRecord)
      throw new BadRequestError("You are already following this user!");
    const followUserData = await followUserInDB({ followerId, followingId });
    await updateFollowCount({ followerId, followingId });
    return followUserData;
  }
  static async unfollowUser({ followerId, followingId }) {
    const userRecord = await findUserById(followingId);
    if (!userRecord) throw new NotFoundError("User incorrect!");
    const followUserRecord = await findFollowUserInDB({
      followerId,
      followingId,
    });
    if (!followUserRecord)
      throw new BadRequestError("You are not following this user!");
    const unfollowUserData = await unfollowUserInDB({
      followerId,
      followingId,
    });
    await updateUnfollowCount({ followerId, followingId });
    return unfollowUserData;
  }
  static async getListFollowByAction({ followId, cursor, sort, action }) {
    if (action === "follower")
      return await getListFollowerById({ followId, cursor, sort });
    if (action === "following")
      return await getListFollowingById({ followId, cursor, sort });
  }
}
module.exports = FollowSerivice;
