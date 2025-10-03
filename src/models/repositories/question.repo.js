const {
  buildResultCursorBased,
} = require("../../helpers/buildResultCursorBased");
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
const getListQuestionInDB = async ({ id, limit, sort, cursor, select }) => {
  const sortBy = sort ? sort : { _id: -1 };
  const query = { userId: id, moderationStatus: "ok", isDeleted: false };
  if (cursor) query._id = { $lt: cursor };
  questonList = await questionModel
    .find(query)
    .sort(sortBy)
    .limit(limit)
    .select(getUnselectData(select))
    .lean();

  return buildResultCursorBased(questonList, limit);
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
  return await questionModel.deleteOne({ _id: id }).lean();
};
const getAllStatusQuestionInDB = async ({
  filter,
  limit,
  sort,
  cursor,
  select,
}) => {
  return await queryQuestion({ filter, limit, sort, cursor, select });
};
const queryQuestion = async ({ filter, limit, sort, cursor, select }) => {
  const sortBy = sort ? sort : { _id: -1 };
  const query = filter;
  if (cursor) query._id = { $lt: cursor };
  questionList = await questionModel
    .find(query)
    .sort(sortBy)
    .limit(limit)
    .select(getUnselectData(select))
    .lean();

  return buildResultCursorBased(questionList, limit);
};
const publishForQuestionInDB = async (id) => {
  return await questionModel
    .findByIdAndUpdate(id, { status: "publish", visibility: "public" })
    .lean();
};
const draftForQuestionInDB = async (id) => {
  return await questionModel
    .findByIdAndUpdate(id, { status: "draft", visibility: "private" })
    .lean();
};
const archiveForQuestionInDB = async (id) => {
  return await questionModel
    .findByIdAndUpdate(id, { status: "archive", visibility: "private" })
    .lean();
};
const changeVisibilityQuestionInDB = async (id, type) => {
  return await questionModel.findByIdAndUpdate(
    id,
    {
      visibility: type,
    },
    {
      new: true,
    }
  );
};
module.exports = {
  createQuestionInDB,
  updateQuestionInDB,
  findQuestionById,
  getListQuestionInDB,
  softDeleteQuestionInDB,
  hardDeleteQuestionInDB,
  getAllStatusQuestionInDB,
  publishForQuestionInDB,
  draftForQuestionInDB,
  archiveForQuestionInDB,
  changeVisibilityQuestionInDB,
};
