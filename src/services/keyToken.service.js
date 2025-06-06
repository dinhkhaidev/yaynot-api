const { keyTokenModel, blackListModel } = require("../models/keyToken.model");

class KeyTokenService {
  static pushTokenToBlackList = async (token) => {
    return await blackListModel.create({
      token,
    });
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
