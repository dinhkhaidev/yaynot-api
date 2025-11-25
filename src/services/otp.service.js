const crypto = require("crypto");
const otpModel = require("../models/otp.model");
const { createOtpInDB } = require("../models/repositories/email.repo");
const { BadRequestError } = require("../core/error.response");
const generateOtpToken = () => {
  const token = crypto.randomInt(10000000, 99999999);
  return token;
};
const newOtpToken = async (email) => {
  const otp = generateOtpToken();
  const newOtp = await createOtpInDB({ email, otp });
  return newOtp;
};
const checkOtpToken = async (otp) => {
  const foundOtp = await otpModel.findOne({ otp });
  if (!foundOtp || foundOtp.otp !== otp) {
    throw new BadRequestError("OTP incorrect!");
  }
  return foundOtp;
};

const checkOtpStateless = (otpHash, otpDecodedHash) => {
  if (otpHash.toString() !== otpDecodedHash.toString()) {
    throw new BadRequestError("OTP incorrect!");
  }
  return true;
};
module.exports = {
  generateOtpToken,
  newOtpToken,
  checkOtpToken,
  checkOtpStateless,
};
