const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { generateKeyPairSync } = require("crypto");
const {
  NotFoundError,
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { findUserByEmail } = require("../models/repositories/access.repo");
const userModel = require("../models/user.model");
const KeyTokenService = require("./keyToken.service");
const { convertToObjectId, getInfoData } = require("../utils");
const { createTokenPair } = require("../auth/authUtil");
const { keyTokenModel } = require("../models/keyToken.model");
const { default: mongoose } = require("mongoose");
const saltRounds = 10;
class AccessService {
  static handleToken = async (user, keyToken, refreshToken) => {
    if (!refreshToken) throw new NotFoundError("Missing refreshToken!");
    if (keyToken.refreshToken !== refreshToken)
      throw new AuthFailureError("Refresh token does not match current token!");
    if (keyToken.refreshTokenUsed.includes(refreshToken)) {
      await KeyTokenService.deleteTokenById(keyToken._id);
      throw new ForbiddenError("Something wrong happended. Relogin please!");
    }
    const { user_id, name, email, role } = user;
    const { publicKey, privateKey } = keyToken;
    const foundUser = await findUserByEmail(email);
    if (!foundUser) throw new NotFoundError("User not registered!");
    const tokens = createTokenPair(
      { user_id, name, email, role },
      publicKey,
      privateKey
    );
    const test = await keyTokenModel.updateMany(
      { _id: keyToken.id },
      {
        $set: { refreshToken: tokens.refreshToken },
        $push: { refreshTokenUsed: refreshToken },
      }
    );
    return { tokens, test };
  };
  static logout = async ({ id, token }) => {
    if (!id || !token)
      throw new NotFoundError("Missing token or ID for logout.");
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestError("Type of id not correct!");
    await KeyTokenService.pushTokenToBlackList(token);
    const result = await KeyTokenService.deleteTokenById(id);
    if (result.deletedCount !== 1)
      throw new BadRequestError("Logout failed. Token not deleted.");
    return { result };
  };
  static login = async ({ email, password }) => {
    const missingField = [];
    if (!email) missingField.push("email");
    if (!password) missingField.push("password");
    if (missingField.length > 0)
      throw new BadRequestError(`Missing field: ${missingField.join(", ")}`);
    const foundUser = await findUserByEmail(email);
    if (!foundUser) throw new NotFoundError("User not found!");
    const comparePassword = await bcrypt.compare(
      password,
      foundUser.user_password
    );
    if (!comparePassword) throw new AuthFailureError("Password incorrect!");
    const { privateKey, publicKey } = generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
    });
    const payload = {
      user_id: foundUser._id,
      name: foundUser.user_name,
      email: foundUser.user_email,
      role: foundUser.user_role,
    };
    const tokens = createTokenPair(payload, publicKey, privateKey);
    const newKeyToken = await KeyTokenService.createKeyToken({
      publicKey,
      privateKey,
      user_id: convertToObjectId(foundUser._id),
      refreshToken: tokens.refreshToken,
    });
    return {
      user: getInfoData({
        object: foundUser,
        field: ["user_name", "user_email", "user_isVerify", "user_role"],
      }),
      tokens,
    };
  };
  static signUp = async ({ name, email, password }) => {
    let missingField = [];
    if (!name) missingField.push("name");
    if (!email) missingField.push("email");
    if (!password) missingField.push("password");
    if (missingField.length > 0)
      throw new BadRequestError(`Missing field: ${missingField.join(", ")}`);
    const foundUser = await findUserByEmail(email);
    if (foundUser) throw new AuthFailureError("User already registered!");
    const passwordHash = await bcrypt.hash(password.toString(), saltRounds);
    const newUser = await userModel.create({
      user_name: name,
      user_email: email,
      user_password: passwordHash,
    });
    if (newUser) {
      //handle jwt
      const { privateKey, publicKey } = generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
      });

      const payload = {
        user_id: newUser.id,
        name: newUser.user_name,
        email: newUser.user_email,
      };
      const tokens = await createTokenPair(payload, publicKey, privateKey);
      const newKeyToken = await KeyTokenService.createKeyToken({
        publicKey,
        privateKey,
        user_id: convertToObjectId(newUser.id),
        refreshToken: tokens.refreshToken,
      });
      if (!newKeyToken) {
        return {
          message: "Key Token Error!",
        };
      }
      return {
        user: getInfoData({
          object: newUser,
          field: ["user_name", "user_email", "user_isVerify"],
        }),
        tokens,
      };
    }
    throw new Error("User creation failed!");
  };
}
module.exports = AccessService;
