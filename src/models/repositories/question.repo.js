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
const getListQuestionInDB = async ({ id, limit = 30, sort, page, select }) => {
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
const getAllDraftQuestionInDB = async ({
  filter,
  limit = 30,
  sort,
  page,
  select,
}) => {
  const sortBy = sort === "ctime" ? { updateAt: -1 } : { updateAt: 1 };
  const skip = page * limit;
  return await queryQuestion({ filter, sortBy, skip, select });
};
const getAllPublishQuestionInDB = async ({
  filter,
  limit = 30,
  sort,
  page,
  select,
}) => {
  const sortBy = sort === "ctime" ? { updateAt: -1 } : { updateAt: 1 };
  const skip = page * limit;
  return await queryQuestion({ filter, sortBy, skip, select });
};
const queryQuestion = async ({ filter, limit = 30, sortBy, skip, select }) => {
  return await questionModel
    .find(filter)
    .limit(limit)
    .skip(skip)
    .sort(sortBy)
    .select(getUnselectData(select))
    .lean();
};
const publishForQuestionInDB = async (id) => {
  return await questionModel.findByIdAndUpdate(id, { status: "publish" });
};
const draftForQuestionInDB = async (id) => {
  return await questionModel.findByIdAndUpdate(id, { status: "draft" });
};
const archiveForQuestionInDB = async (id) => {
  return await questionModel.findByIdAndUpdate(id, { status: "archive" });
};
module.exports = {
  createQuestionInDB,
  updateQuestionInDB,
  findQuestionById,
  getListQuestionInDB,
  softDeleteQuestionInDB,
  hardDeleteQuestionInDB,
  getAllDraftQuestionInDB,
  getAllPublishQuestionInDB,
  publishForQuestionInDB,
  draftForQuestionInDB,
  archiveForQuestionInDB,
};
