const {
  buildResultCursorBased,
} = require("../../helpers/buildResultCursorBased");
const followModel = require("../follow.model");

const followUserInDB = async ({ followerId, followingId }) => {
  return followModel.create({ followerId, followingId });
};
const findFollowUserInDB = async ({ followerId, followingId }) => {
  return followModel.findOne({ followerId, followingId }).lean();
};
const unfollowUserInDB = async ({ followerId, followingId }) => {
  return followModel.findOneAndDelete({ followerId, followingId });
};
const getListFollowerById = async ({ followId, cursor, sort }) => {
  const query = { followerId: followId };
  if (cursor) {
    query._id = { $lt: cursor };
  }
  const sortBy = sort ? sort : { _id: -1 };
  const limit = 20;
  const followerList = await followModel
    .find(query)
    .sort(sortBy)
    .limit(limit)
    .lean();
  return buildResultCursorBased(followerList, limit);
};
const getListFollowingById = async ({ followId, cursor, sort }) => {
  const query = { followingId: followId };
  if (cursor) {
    query._id = { $lt: cursor };
  }
  const sortBy = sort ? sort : { _id: -1 };
  const limit = 20;
  const followingList = await followModel
    .find(query)
    .sort(sortBy)
    .limit(limit)
    .lean();
  return buildResultCursorBased(followingList, limit);
};
module.exports = {
  followUserInDB,
  findFollowUserInDB,
  unfollowUserInDB,
  getListFollowerById,
  getListFollowingById,
};
