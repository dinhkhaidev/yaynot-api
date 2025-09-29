const otpModel = require("../otp.model");
const templateModel = require("../template.model");

const createOtpInDB = async ({ email, otp }) =>
  await otpModel.create({ email, otp });
const createTemplateInDB = async ({ name, html }) =>
  await templateModel.create({ name, html });
const findTemplateByName = async (name) => {
  return await templateModel.findOne({ name }).lean();
};
const findOtpByEmail = async (email) => {
  return await otpModel.findOne({ email }).lean();
};
const deleteOtpByEmail = async (email) => {
  return await otpModel.findOneAndDelete({ email });
};
module.exports = {
  createOtpInDB,
  createTemplateInDB,
  findTemplateByName,
  findOtpByEmail,
  deleteOtpByEmail,
};
