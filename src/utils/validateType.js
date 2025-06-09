const { default: mongoose } = require("mongoose");

const isObjectId = async (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};
module.exports = { isObjectId };
