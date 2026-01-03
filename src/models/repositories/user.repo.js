const userProfileModel = require("../userProfile.model");

const upsertUserProfileInDB = async ({ userId, payload }) => {
  const test = await userProfileModel.findOneAndUpdate(
    { _id: userId },
    payload,
    {
      upsert: true,
      new: true,
    }
  );
  return test;
};
const findUserProfileInDB = async ({ userId }) => {
  return userProfileModel
    .findOne({ _id: userId })
    .select("-_id -createdAt -updatedAt -__v")
    .lean();
};
const updateAvatarInDB = async ({ userId, url }) => {
  return userProfileModel.findByIdAndUpdate(
    { _id: userId },
    { avatar: url },
    { new: true }
  );
};
const updateFollowCount = async ({ followerId, followingId }, options = {}) => {
  const followerCountData = await userProfileModel.findByIdAndUpdate(
    followerId,
    { $inc: { following: 1 } },
    options
  );
  const followingCountData = await userProfileModel.findByIdAndUpdate(
    followingId,
    { $inc: { follower: 1 } },
    options
  );
  return {
    followerCountData,
    followingCountData,
  };
};
const updateUnfollowCount = async (
  { followerId, followingId },
  options = {}
) => {
  const followerCountData = await userProfileModel.findByIdAndUpdate(
    followerId,
    { $inc: { following: -1 } },
    options
  );
  const followingCountData = await userProfileModel.findByIdAndUpdate(
    followingId,
    { $inc: { follower: -1 } },
    options
  );
  return {
    followerCountData,
    followingCountData,
  };
};
const findUserProfileById = async (profileId) => {
  return userProfileModel.findById(profileId);
};
module.exports = {
  upsertUserProfileInDB,
  findUserProfileInDB,
  updateAvatarInDB,
  updateFollowCount,
  updateUnfollowCount,
  findUserProfileById,
};
