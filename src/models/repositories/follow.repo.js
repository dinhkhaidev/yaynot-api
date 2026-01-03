const {
  buildResultCursorBased,
} = require("../../helpers/buildResultCursorBased");
const followModel = require("../follow.model");

const followUserInDB = async ({ followerId, followingId }, options = {}) => {
  return followModel.create([{ followerId, followingId }], options);
};
const findFollowUserInDB = async (
  { followerId, followingId },
  options = {}
) => {
  return followModel.findOne({ followerId, followingId }, null, options).lean();
};
const unfollowUserInDB = async ({ followerId, followingId }, options = {}) => {
  return followModel.findOneAndDelete({ followerId, followingId }, options);
};
const getListFollowerById = async (
  { followId, cursor, sort },
  options = {}
) => {
  const query = { followerId: followId };
  if (cursor) {
    query._id = { $lt: cursor };
  }
  const sortBy = sort ? sort : { _id: -1 };
  const limit = 20;

  let followerList;
  const { session } = options;

  if (session) {
    followerList = await followModel
      .find(query)
      .session(session)
      .sort(sortBy)
      .limit(limit)
      .lean();
  } else {
    followerList = await followModel
      .find(query)
      .sort(sortBy)
      .limit(limit)
      .lean();
  }
  return buildResultCursorBased(followerList, limit);
};
const getListFollowingById = async (
  { followId, cursor, sort },
  options = {}
) => {
  const query = { followingId: followId };
  if (cursor) {
    query._id = { $lt: cursor };
  }
  const sortBy = sort ? sort : { _id: -1 };
  const limit = 20;
  let followingList;
  const { session } = options;

  if (session) {
    followingList = await followModel
      .find(query)
      .session(session)
      .sort(sortBy)
      .limit(limit)
      .lean();
  } else {
    followingList = await followModel
      .find(query)
      .sort(sortBy)
      .limit(limit)
      .lean();
  }
  return buildResultCursorBased(followingList, limit);
};
module.exports = {
  followUserInDB,
  findFollowUserInDB,
  unfollowUserInDB,
  getListFollowerById,
  getListFollowingById,
};
