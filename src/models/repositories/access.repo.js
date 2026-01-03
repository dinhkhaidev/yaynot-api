const userModel = require("../user.model");

const findUserByEmail = async (email, options = {}) => {
  return userModel.findOne({ user_email: email }, null, options).lean();
};
const findUserById = async (id, options = {}) => {
  return userModel.findById(id, null, options).lean();
};
const findListUserId = async (batchSize, options = {}) => {
  const { session } = options;
  //using lazy evaluation
  let query = userModel.find().select("_id");

  if (session) {
    query = query.session(session);
  }
  return query.cursor({ batchSize });
};
module.exports = {
  findUserByEmail,
  findUserById,
  findListUserId,
};
