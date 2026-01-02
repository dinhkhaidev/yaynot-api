const userModel = require("../user.model");

const findUserByEmail = async (email, options = {}) => {
  return userModel.findOne({ user_email: email }, null, options).lean();
};
const findUserById = async (id, options = {}) => {
  return userModel.findById(id, null, options).lean();
};
const findListUserId = async (limit, options = {}) => {
  const { session } = options;
  if (session) {
    return userModel
      .find()
      .select("_id")
      .session(session)
      .cursor({ batchSize: limit });
  }
  return userModel.find().select("_id").cursor({ batchSize: limit });
};
module.exports = {
  findUserByEmail,
  findUserById,
  findListUserId,
};
