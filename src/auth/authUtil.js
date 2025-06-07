const jwt = require("jsonwebtoken");
const {
  BadRequestError,
  AuthFailureError,
  NotFoundError,
} = require("../core/error.response");
const asyncHandle = require("../helpers/asyncHandle");
const header = require("../constants/header");
const { findKeyTokenByUserId } = require("../services/keyToken.service");
const { default: mongoose } = require("mongoose");
const createTokenPair = (payload, publicKey, privateKey) => {
  try {
    const accessToken = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1d",
    });
    const refreshToken = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "5 days",
    });
    // const verify = jwt.verify(refreshToken, publicKey, function (err, decode) {
    //   if (err) throw new BadRequestError("Token invalid!");
    //   console.log("decode", decode);
    // });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new BadRequestError(`Create Token Error ${error}`);
  }
};
const decodeToken = (token, publicKey) => {
  try {
    return jwt.verify(token, publicKey);
  } catch (err) {
    throw new BadRequestError("Token expired or invalid!");
  }
};
const authentication = asyncHandle(async (req, res, next) => {
  const userId = req.header(header.USER_ID);
  if (!userId || !mongoose.Types.ObjectId.isValid(userId))
    throw new BadRequestError("Invalid or missing userId!");
  const foundUserId = await findKeyTokenByUserId(userId);
  if (!foundUserId) throw new NotFoundError("UserId not found!");
  const accessToken = req.header(header.AUTHORIZATION);
  if (!accessToken) throw new AuthFailureError("Missing access token!");
  const decodeAccessToken = decodeToken(accessToken, foundUserId.publicKey);
  if (!decodeAccessToken)
    throw new BadRequestError("Access token expried or invalid!");
  req.keyToken = foundUserId;
  req.user = decodeAccessToken;
  return next();
});

module.exports = {
  createTokenPair,
  decodeToken,
  authentication,
};
