const {
  buildResultCursorBased,
} = require("../../helpers/buildResultCursorBased");
const { getSelectData, getUnselectData } = require("../../utils");
const careQuestionModel = require("../careQuestion.model");
const questionModel = require("../question.model");
const questionHistoryModel = require("../questionHistory.model");

const createQuestionInDB = async (payload) => {
  return questionModel.create(payload);
};
const updateQuestionInDB = async (id, payload) => {
  return questionModel.findByIdAndUpdate(id, payload, { new: true });
};
const findQuestionById = async (id) => {
  const query = { _id: id, isDeleted: false };
  return questionModel.findOne(query).lean();
};
const getListQuestionInDB = async ({ id, limit, sort, cursor, select }) => {
  const sortBy = sort ? sort : { _id: -1 };
  const query = { userId: id, moderationStatus: "ok", isDeleted: false };
  if (cursor) {
    query._id = { $lt: cursor };
  }
  const questionList = await questionModel // Fixed typo: questonList → questionList
    .find(query)
    .sort(sortBy)
    .limit(limit)
    .select(getUnselectData(select))
    .lean();

  return buildResultCursorBased(questionList, limit); // Fixed typo
};
const softDeleteQuestionInDB = async (id, statusDelete) => {
  return questionModel.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
    },
    { new: true }
  );
};
const hardDeleteQuestionInDB = async (id) => {
  return questionModel.deleteOne({ _id: id }).lean();
};
const getAllStatusQuestionInDB = async ({
  filter,
  limit,
  sort,
  cursor,
  select,
}) => {
  return queryQuestion({ filter, limit, sort, cursor, select });
};
const queryQuestion = async ({ filter, limit, sort, cursor, select }) => {
  const sortBy = sort ? sort : { _id: -1 };
  const query = filter;
  if (cursor) {
    query._id = { $lt: cursor };
  }
  const questionList = await questionModel // Fixed typo: added const
    .find(query)
    .sort(sortBy)
    .limit(limit)
    .select(getUnselectData(select))
    .lean();

  return buildResultCursorBased(questionList, limit);
};
const publishForQuestionInDB = async (id) => {
  return questionModel
    .findByIdAndUpdate(
      id,
      { status: "publish", visibility: "public" },
      {
        new: true,
      }
    )
    .lean();
};
const draftForQuestionInDB = async (id) => {
  return questionModel
    .findByIdAndUpdate(
      id,
      { status: "draft", visibility: "private" },
      {
        new: true,
      }
    )
    .lean();
};
const archiveForQuestionInDB = async (id) => {
  return questionModel
    .findByIdAndUpdate(
      id,
      { status: "archive", visibility: "private" },
      {
        new: true,
      }
    )
    .lean();
};
const changeVisibilityQuestionInDB = async (id, type) => {
  return questionModel.findByIdAndUpdate(
    id,
    {
      visibility: type,
    },
    {
      new: true,
    }
  );
};
//care question
const careQuestionInDB = async ({ userId, questionId }) => {
  return careQuestionModel.create({
    userId,
    questionId,
  });
};
const unCareQuestionInDB = async ({ userId, questionId }) => {
  return careQuestionModel.updateOne(
    {
      userId,
      questionId,
    },
    {
      isDeleted: true,
    }
  );
};
const getListCareQuestionByUserInDB = async ({ userId }) => {
  //handle sort, cursor,...
  return careQuestionModel.find({ userId }).lean();
};
const findHistoryQuestionByQuestionId = async (questionId) => {
  return questionHistoryModel.find({ questionId }).lean();
};
const createHistoryQuestionInDB = async ({
  questionId,
  userId,
  metadata,
  version,
}) => {
  return questionHistoryModel.create({
    questionId,
    userId,
    metadata,
    version,
  });
};
//for trending
const getTrendingCandidates = async (daysAgo = 3) => {
  const since = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return questionModel
    .find({
      status: "publish",
      isDeleted: false,
      createdAt: { $gte: since },
    })
    .select(
      "_id viewCount shareCount voteCount shareCount commentCount bookmarkCount createdAt"
    )
    .lean();
};
const findByIds = async (ids) => {
  if (ids.length === 0) return [];

  const questions = await questionModel
    .find({
      _id: { $in: ids },
      status: "publish",
      isDeleted: false,
    })
    .populate("userId", "user_name")
    .lean();
  const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));
  return ids.map((id) => questionMap.get(id.toString())).filter(Boolean);
};
const updateQuestionVoteCount = async ({ questionId, increment }) => {
  return questionModel.findByIdAndUpdate(
    { _id: questionId },
    {
      $inc: { voteCount: increment ? 1 : -1 },
    },
    { new: true }
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
  careQuestionInDB,
  unCareQuestionInDB,
  getListCareQuestionByUserInDB,
  findHistoryQuestionByQuestionId,
  createHistoryQuestionInDB,
  getTrendingCandidates,
  findByIds,
  updateQuestionVoteCount,
};
