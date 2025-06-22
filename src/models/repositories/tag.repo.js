const { tagModel, tagQuestionModel } = require("../tag.model");

const findTagByNameInDB = async (name) => {
  return await tagModel.findOne({ name });
};
const findTagByQuestionId = async (questionId) => {
  return await tagQuestionModel
    .find({ questionId })
    .select("tagId -_id")
    .lean();
};
module.exports = { findTagByNameInDB, findTagByQuestionId };
