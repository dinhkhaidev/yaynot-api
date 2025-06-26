const userProfileModel = require("../userProfile.model");

const upsertUserProfileInDB = async ({ userId, payload }) => {
  const test = await userProfileModel.findOneAndUpdate({ userId }, payload, {
    upsert: true,
    new: true,
  });
  return test;
};
const findUserProfileInDB = async ({ userId }) => {
  return await userProfileModel
    .findOne({ userId })
    .select("-_id -createdAt -updatedAt -__v")
    .lean();
};
module.exports = { upsertUserProfileInDB, findUserProfileInDB };
