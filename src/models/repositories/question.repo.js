const questionModel = require("../question.model");

const createQuestionInDB = async (payload) => {
  return await questionModel.create(payload);
};
const updateQuestionInDB = async (payload) => {
  return await questionModel.updateOne(payload);
};
const findQuestionById = async (id) => {
  return await questionModel.findById(id).lean();
};
module.exports = { createQuestionInDB, updateQuestionInDB, findQuestionById };
