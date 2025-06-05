const keyTokenModel = require("../models/keyToken.model");

class KeyTokenService {
  static createKeyToken = async ({
    publicKey,
    privateKey,
    user_id,
    refreshToken,
  }) => {
    const keyToken = await keyTokenModel.create({
      publicKey,
      privateKey,
      user_id,
      refreshToken,
    });
    return keyToken;
  };
}
module.exports = KeyTokenService;
