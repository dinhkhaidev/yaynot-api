const diff = require("deep-diff");
const {
  upsertUserProfileInDB,
  findUserProfileInDB,
  updateAvatarInDB,
} = require("../models/repositories/user.repo");
const { getInfoData } = require("../utils");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const _ = require("lodash");
const { cloudinary } = require("../configs/cloudinary.config");
const { keyProfile } = require("../utils/cacheRedis");
const cacheRepo = require("../models/repositories/cache.repo");
const { getCache, setCache } = require("../infrastructures/cache/getCache");
class UserProfileService {
  //handle when user want update profile
  static async upsertUserProfile(payload) {
    const { userId } = payload;
    const fieldsToCheck = Object.keys(payload);
    const existData = await findUserProfileInDB({ userId });
    const newExistData = getInfoData({
      object: existData,
      field: fieldsToCheck,
    });
    // const differences = diff(payload, newExistData);
    const differences = fieldsToCheck.reduce((diff, key) => {
      if (!_.isEqual(payload[key], newExistData[key])) {
        diff[key] = payload[key];
      }
      return diff;
    }, {});
    if (Object.keys(differences).length > 0) {
      differences._id = userId;
      return await upsertUserProfileInDB({ userId, payload: differences });
    }
    throw new BadRequestError("No changes detected in submitted data!");
  }
  static async getInfoProfile({ user_id, name }) {
    const key = keyProfile(user_id);
    await getCache(key);
    const userProfileRecord = await findUserProfileInDB({ userId: user_id });
    if (!userProfileRecord) {
      return { username: name, name, follower: 0, following: 0 };
    }
    await setCache(key, { ...userProfileRecord, username: name }, 120);
    return { ...userProfileRecord, username: name };
  }
  static async updateAvatar({ userId, url }) {
    return await updateAvatarInDB({ userId, url });
  }
}
module.exports = UserProfileService;
