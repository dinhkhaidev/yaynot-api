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
  return await userProfileModel
    .findOne({ _id: userId })
    .select("-_id -createdAt -updatedAt -__v")
    .lean();
};
const updateAvatarInDB = async ({ userId, url }) => {
  return await userProfileModel.findByIdAndUpdate(
    { _id: userId },
    { avatar: url },
    { new: true }
  );
};
const updateFollowCount = async ({ followerId, followingId }) => {
  const followerCountData = await userProfileModel.findByIdAndUpdate(
    followerId,
    { $inc: { following: 1 } }
  );
  const followingCountData = await userProfileModel.findByIdAndUpdate(
    followingId,
    { $inc: { follower: 1 } }
  );
  return {
    followerCountData,
    followingCountData,
  };
};
const updateUnfollowCount = async ({ followerId, followingId }) => {
  const followerCountData = await userProfileModel.findByIdAndUpdate(
    followerId,
    { $inc: { following: -1 } }
  );
  const followingCountData = await userProfileModel.findByIdAndUpdate(
    followingId,
    { $inc: { follower: -1 } }
  );
  return {
    followerCountData,
    followingCountData,
  };
};
const findUserProfileById = async (profileId) => {
  return await userProfileModel.findById(profileId);
};
module.exports = {
  upsertUserProfileInDB,
  findUserProfileInDB,
  updateAvatarInDB,
  updateFollowCount,
  updateUnfollowCount,
  findUserProfileById,
};
