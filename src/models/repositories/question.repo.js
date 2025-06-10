const { getSelectData, getUnselectData } = require("../../utils");
const questionModel = require("../question.model");

const createQuestionInDB = async (payload) => {
  return await questionModel.create(payload);
};
const updateQuestionInDB = async (id, payload) => {
  return await questionModel.findByIdAndUpdate(id, payload, { new: true });
};
const findQuestionById = async (id) => {
  return await questionModel.findById(id).lean();
};
const getListQuestionInDB = async ({ id, limit, sort, page, select }) => {
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const skip = page * limit;
  return await questionModel
    .find({
      userId: id,
      moderationStatus: "ok",
      isDeleted: false,
    })
    .limit(limit)
    .skip(skip)
    .sort(sortBy)
    .select(getUnselectData(select))
    .lean();
};
const softDeleteQuestionInDB = async (id, statusDelete) => {
  return await questionModel.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
    },
    { new: true }
  );
};
const hardDeleteQuestionInDB = async (id) => {
  return await questionModel.deleteOne({ _id: id });
};
module.exports = {
  createQuestionInDB,
  updateQuestionInDB,
  findQuestionById,
  getListQuestionInDB,
  softDeleteQuestionInDB,
  hardDeleteQuestionInDB,
};
