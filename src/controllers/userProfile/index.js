const { OK } = require("../../core/success.response");
const UserProfileService = require("../../services/userProfile.service");
const { convertToObjectId } = require("../../utils");

class UserProfileController {
  upsertUserProfile = async (req, res, next) => {
    new OK({
      message: "Update profile succesful!",
      metadata: await UserProfileService.upsertUserProfile({
        ...req.body,
        userId: convertToObjectId(req.user.user_id),
      }),
    }).send(res);
  };
  getInfoProfile = async (req, res, next) => {
    new OK({
      message: "Get detail profile succesful!",
      metadata: await UserProfileService.getInfoProfile(req.user),
    }).send(res);
  };
}
module.exports = new UserProfileController();
