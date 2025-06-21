const { tagModel } = require("../tag.model");

const findTagByNameInDB = async (name) => {
  return await tagModel.findOne({ name });
};
module.exports = { findTagByNameInDB };
