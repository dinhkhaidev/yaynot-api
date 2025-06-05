const jwt = require("jsonwebtoken");
const { BadRequestError } = require("../core/error.response");
const createTokenPair = (payload, publicKey, privateKey) => {
  try {
    const accessToken = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "3m",
    });
    const refreshToken = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "10m",
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
const decodeToken = async (token, publicKey) => {
  return jwt.verify(token, publicKey, function (err, decode) {
    if (err) throw new BadRequestError("Token invalid!");
    console.log("decode", decode);
    return decode;
  });
};
module.exports = {
  createTokenPair,
  decodeToken,
};
