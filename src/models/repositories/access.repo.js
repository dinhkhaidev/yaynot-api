const userModel = require("../user.model");

const findUserByEmail = async (email) => {
  return await userModel.findOne({ user_email: email }).lean();
};
const findUserById = async (id) => {
  return await userModel.findById(id).lean();
};
const findListUserId = async (limit) => {
  return userModel.find().select("_id").cursor({ batchSize: limit });
};
module.exports = { findUserByEmail, findUserById, findListUserId };
