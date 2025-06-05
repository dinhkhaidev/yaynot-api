const userModel = require("../user.model");

const findUserByEmail = async (email) => {
  return await userModel.findOne({ user_email: email }).lean();
};

module.exports = { findUserByEmail };
