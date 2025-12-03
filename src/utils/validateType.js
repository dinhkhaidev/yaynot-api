const { default: mongoose } = require("mongoose");

const isObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};
module.exports = { isObjectId };
