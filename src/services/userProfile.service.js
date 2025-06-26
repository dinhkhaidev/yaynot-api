const diff = require("deep-diff");
const {
  upsertUserProfileInDB,
  findUserProfileInDB,
} = require("../models/repositories/user.repo");
const { getInfoData } = require("../utils");
const { BadRequestError } = require("../core/error.response");
const _ = require("lodash");
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
      return await upsertUserProfileInDB({ userId, payload: differences });
    }
    throw new BadRequestError("No changes detected in submitted data!");
  }
}
module.exports = UserProfileService;
