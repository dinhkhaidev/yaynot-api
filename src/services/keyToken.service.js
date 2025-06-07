const { BadRequestError } = require("../core/error.response");
const { keyTokenModel, blackListModel } = require("../models/keyToken.model");

class KeyTokenService {
  static findRefreshToken = async (token) => {
    return await keyTokenModel.findOne({ refreshToken: token });
  };
  static findKeyTokenByUserId = async (user_id) => {
    return await keyTokenModel.findOne({ user_id });
  };
  static pushTokenToBlackList = async (token) => {
    const foundToken = await KeyTokenService.findTokenBlackList(token);
    if (foundToken) throw new BadRequestError("Token existed!");
    return await blackListModel.create({
      token,
    });
  };
  static findTokenBlackList = async (token) => {
    return await blackListModel.findOne({ token });
  };
  static deleteTokenById = async (id) => {
    return await keyTokenModel.deleteOne({ _id: id });
  };
  static createKeyToken = async ({
    publicKey,
    privateKey,
    user_id,
    refreshToken,
  }) => {
    const filter = {
        user_id: user_id,
      },
      update = {
        publicKey,
        privateKey,
        refreshToken,
      },
      options = {
        upsert: true,
        new: true,
      };
    // const keyToken = await keyTokenModel.create({
    //   publicKey,
    //   privateKey,
    //   user_id,
    //   refreshToken,
    // });
    return await keyTokenModel.findOneAndUpdate(filter, update, options);
  };
}
module.exports = KeyTokenService;
