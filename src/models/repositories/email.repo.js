const otpModel = require("../otp.model");
const templateModel = require("../template.model");

const createOtpInDB = async ({ email, otp }) => otpModel.create({ email, otp });
const createTemplateInDB = async ({ name, html }) =>
  templateModel.create({ name, html });
const findTemplateByName = async (name) => {
  return templateModel.findOne({ name }).lean();
};
const findOtpByEmail = async (email) => {
  return otpModel.findOne({ email }).lean();
};
const deleteOtpByEmail = async (email) => {
  return otpModel.findOneAndDelete({ email });
};
module.exports = {
  createOtpInDB,
  createTemplateInDB,
  findTemplateByName,
  findOtpByEmail,
  deleteOtpByEmail,
};
