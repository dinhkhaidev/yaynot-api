const jwt = require("jsonwebtoken");
const {
  BadRequestError,
  AuthFailureError,
  NotFoundError,
} = require("../core/error.response");
const asyncHandle = require("../helpers/asyncHandle");
const header = require("../constants/header");
const {
  findKeyTokenByUserId,
  findTokenBlackList,
} = require("../services/keyToken.service");
const { default: mongoose } = require("mongoose");
const { isObjectId } = require("../utils/validateType");
const createTokenPair = (payload, publicKey, privateKey) => {
  try {
    console.log("process.env.TTL_ACCESS_TOKEN", process.env.TTL_ACCESS_TOKEN);
    const accessToken = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: `${process.env.TTL_ACCESS_TOKEN}`,
    });
    const refreshToken = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: `${process.env.TTL_REFRESH_TOKEN}`,
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
  if (!userId || !isObjectId(userId))
    throw new BadRequestError("Invalid or missing userId!");
  const accessToken = req.header(header.AUTHORIZATION);
  if (!accessToken) throw new AuthFailureError("Missing access token!");
  const isTokenBlackListed = await findTokenBlackList(accessToken);
  if (isTokenBlackListed) {
    throw new AuthFailureError(
      "Access token has been revoked. Please re-login."
    );
  }
  const userKeyTokenRecord = await findKeyTokenByUserId(userId);
  if (!userKeyTokenRecord) throw new NotFoundError("UserId not found!");

  const decodedToken = decodeToken(accessToken, userKeyTokenRecord.publicKey);
  if (!decodedToken)
    throw new BadRequestError("Access token expired or invalid!");
  req.keyToken = userKeyTokenRecord;
  req.user = decodedToken;
  return next();
});

module.exports = {
  createTokenPair,
  decodeToken,
  authentication,
};
