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
const { isObjectId } = require("../utils/validateType");
const { sendEmailVerify } = require("./email.service");
const { checkOtpToken } = require("./otp.service");
const { deleteOtpByEmail } = require("../models/repositories/email.repo");

const saltRounds = 10;
class AccessService {
  static async verifyUser({ email, otp }) {
    const foundUser = await findUserByEmail(email);
    if (foundUser.user_isVerify) {
      throw new BadRequestError("Account has been verified!");
    }
    const checkOtp = await checkOtpToken(otp);
    if (checkOtp) {
      const updateVerify = await userModel.updateOne(
        { user_email: email },
        { user_isVerify: true }
      );
      await deleteOtpByEmail(email);
      return updateVerify;
    } else throw new BadRequestError("OTP incorrect!");
  }
  static async handleToken(user, keyToken, refreshToken) {
    if (!refreshToken) throw new NotFoundError("Missing refreshToken!");
    if (keyToken.refreshTokenUsed.includes(refreshToken)) {
      await KeyTokenService.deleteTokenById(keyToken._id);
      throw new ForbiddenError("Something wrong happended. Relogin please!");
    }
    if (keyToken.refreshToken !== refreshToken)
      throw new AuthFailureError("Refresh token does not match current token!");
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
  }
  static async logout({ id, token }) {
    if (!id || !token)
      throw new NotFoundError("Missing token or ID for logout.");
    if (!isObjectId(id)) throw new BadRequestError("Type of id not correct!");
    await KeyTokenService.pushTokenToBlackList(token);
    const result = await KeyTokenService.deleteTokenById(id);
    if (result.deletedCount !== 1)
      throw new BadRequestError("Logout failed. Token not deleted.");
    return { result };
  }
  static async login({ email, password }) {
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
      publicKeyEncoding: { type: "pkcs1", format: "pem" },
      privateKeyEncoding: { type: "pkcs1", format: "pem" },
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
  }
  static async signUp({ name, email, password }) {
    const missingField = [];
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
    if (!newUser) throw new Error("User creation failed!");
    const { privateKey, publicKey } = generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: { type: "pkcs1", format: "pem" },
      privateKeyEncoding: { type: "pkcs1", format: "pem" },
    });
    const payload = {
      user_id: newUser.id,
      username: newUser.user_name,
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
    await sendEmailVerify({ email: newUser.user_email, name: "email-verify" });
    return {
      user: getInfoData({
        object: newUser,
        field: ["user_name", "user_email", "user_isVerify"],
      }),
      tokens,
    };
  }
}

module.exports = AccessService;
