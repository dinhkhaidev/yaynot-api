const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { generateKeyPairSync } = require("crypto");
const {
  NotFoundError,
  BadRequestError,
  AuthFailureError,
} = require("../core/error.response");
const { findUserByEmail } = require("../models/repositories/access.repo");
const userModel = require("../models/user.model");
const KeyTokenService = require("./keyToken.service");
const { convertToObjectId, getInfoData } = require("../utils");
const { createTokenPair } = require("../auth/authUtil");
const saltRounds = 10;
class AccessService {
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
