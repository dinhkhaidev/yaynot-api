const { BadRequestError } = require("../core/error.response");
const { keyTokenModel, blackListModel } = require("../models/keyToken.model");

class KeyTokenService {
  static async findRefreshToken(token) {
    return await keyTokenModel.findOne({ refreshToken: token });
  }

  static async findKeyTokenByUserId(user_id) {
    return await keyTokenModel.findOne({ user_id });
  }

  static async pushTokenToBlackList(token) {
    const foundToken = await KeyTokenService.findTokenBlackList(token);
    if (foundToken) {throw new BadRequestError("Token existed!");}
    return await blackListModel.create({ token });
  }

  static async findTokenBlackList(token) {
    return await blackListModel.findOne({ token });
  }

  static async deleteTokenById(id) {
    return await keyTokenModel.deleteOne({ _id: id });
  }

  static async createKeyToken({
    publicKey,
    privateKey,
    user_id,
    refreshToken,
  }) {
    const filter = { user_id };
    const update = { publicKey, privateKey, refreshToken };
    const options = { upsert: true, new: true };
    // const keyToken = await keyTokenModel.create({
    //   publicKey,
    //   privateKey,
    //   user_id,
    //   refreshToken,
    // });
    return await keyTokenModel.findOneAndUpdate(filter, update, options);
  }
}

module.exports = KeyTokenService;
