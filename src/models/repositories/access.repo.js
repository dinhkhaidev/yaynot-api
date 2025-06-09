const userModel = require("../user.model");

const findUserByEmail = async (email) => {
  return await userModel.findOne({ user_email: email }).lean();
};
const findUserById = async (id) => {
  return await userModel.findById(id).lean();
};

module.exports = { findUserByEmail, findUserById };
