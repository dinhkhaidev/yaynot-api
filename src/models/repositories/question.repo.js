const {
  buildResultCursorBased,
} = require("../../helpers/buildResultCursorBased");
const { getSelectData, getUnselectData } = require("../../utils");
const careQuestionModel = require("../careQuestion.model");
const questionModel = require("../question.model");
const questionHistoryModel = require("../questionHistory.model");

const createQuestionInDB = async (payload) => {
  return await questionModel.create(payload);
};
const updateQuestionInDB = async (id, payload) => {
  return await questionModel.findByIdAndUpdate(id, payload, { new: true });
};
const findQuestionById = async (id) => {
  const query = { _id: id, isDeleted: false };
  return await questionModel.findOne(query).lean();
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
  return await questionModel
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
  return await questionModel
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
  return await questionModel
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
//care question
const careQuestionInDB = async ({ userId, questionId }) => {
  return await careQuestionModel.create({
    userId,
    questionId,
  });
};
const unCareQuestionInDB = async ({ userId, questionId }) => {
  return await careQuestionModel.updateOne(
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
  return await careQuestionModel.find({ userId }).lean();
};
const findHistoryQuestionByQuestionId = async (questionId) => {
  return await questionHistoryModel.find({ questionId }).lean();
};
const createHistoryQuestionInDB = async ({
  questionId,
  userId,
  metadata,
  version,
}) => {
  return await questionHistoryModel.create({
    questionId,
    userId,
    metadata,
    version,
  });
};
//for trending
const getTrendingCandidates = async (daysAgo = 3) => {
  const since = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return await questionModel
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
  return await questionModel.findByIdAndUpdate(
    { _id: questionId },
    {
      $inc: { voteCount: increment ? 1 : -1 },
    },
    { new: true }
  );
};

const updateVoteSummaryById = async ({
  questionId,
  voteTypeIncrease,
  voteTypeDecrease,
  typeIncr,
}) => {
  const filter = { _id: questionId };
  const payload = {
    $inc: { [voteTypeIncrease]: typeIncr ? 1 : -1 },
  };

  if (voteTypeDecrease && voteTypeDecrease !== voteTypeIncrease) {
    payload.$inc[voteTypeDecrease] = -1;
  }

  const options = { upsert: true, new: true };
  return await questionModel.findOneAndUpdate(filter, payload, options);
};
const getVoteSummaryByQuestionId = async (questionId) => {
  return await questionModel
    .findOne({ _id: questionId })
    .select("voteYesCount voteNoCount commentCount")
    .lean();
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
  updateVoteSummaryById,
  getVoteSummaryByQuestionId,
};
