const {
  buildResultCursorBased,
} = require("../../helpers/buildResultCursorBased");
const { getUnselectData } = require("../../utils");
const careQuestionModel = require("../careQuestion.model");
const questionModel = require("../question.model");
const questionHistoryModel = require("../questionHistory.model");

const createQuestionInDB = async (payload, options = {}) => {
  return questionModel.create([payload], options);
};
const updateQuestionInDB = async (id, payload, options = {}) => {
  options.new = true;
  return questionModel.findByIdAndUpdate(id, payload, options);
};
const findQuestionById = async (id, options = {}) => {
  const query = { _id: id, isDeleted: false };
  return questionModel.findOne(query, null, options).lean();
};
const getListQuestionInDB = async (
  { id, limit, sort, cursor, select },
  options = {}
) => {
  const sortBy = sort ? sort : { _id: -1 };
  const filter = { userId: id, moderationStatus: "ok", isDeleted: false };
  if (cursor) {
    filter._id = { $lt: cursor };
  }
  const { session } = options;
  let query = await questionModel // Fixed typo: questonList → questionList
    .find(filter)
    .sort(sortBy)
    .limit(limit)
    .select(getUnselectData(select))
    .lean();
  if (session) {
    query = query.session(session);
  }
  const questionList = await query.exec();

  return buildResultCursorBased(questionList, limit); // Fixed typo
};
const softDeleteQuestionInDB = async (id, options = {}) => {
  options.new = true;
  return questionModel.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
    },
    options
  );
};
const hardDeleteQuestionInDB = async (id, options = {}) => {
  return questionModel.deleteOne({ _id: id }, options).lean();
};
const getAllStatusQuestionInDB = async (
  { filter, limit, sort, cursor, select },
  options = {}
) => {
  return queryQuestion({ filter, limit, sort, cursor, select }, options);
};

const queryQuestion = async (
  { filter, limit, sort, cursor, select },
  options = {}
) => {
  const sortBy = sort ? sort : { _id: -1 };
  const filterQuery = filter;
  if (cursor) {
    filterQuery._id = { $lt: cursor };
  }

  const { session } = options;
  let query = await questionModel // Fixed typo: added const
    .find(filterQuery)
    .sort(sortBy)
    .limit(limit)
    .select(getUnselectData(select))
    .lean();
  if (session) {
    query = query.session(session);
  }

  const questionList = await query.exec();

  return buildResultCursorBased(questionList, limit);
};
const publishForQuestionInDB = async (id, options = {}) => {
  options.new = true;
  return questionModel
    .findByIdAndUpdate(id, { status: "publish", visibility: "public" }, options)
    .lean();
};
const draftForQuestionInDB = async (id, options = {}) => {
  options.new = true;
  return questionModel
    .findByIdAndUpdate(id, { status: "draft", visibility: "private" }, options)
    .lean();
};
const archiveForQuestionInDB = async (id, options = {}) => {
  options.new = true;
  return questionModel
    .findByIdAndUpdate(
      id,
      { status: "archive", visibility: "private" },
      options
    )
    .lean();
};
const changeVisibilityQuestionInDB = async (id, type, options = {}) => {
  options.new = true;
  return questionModel.findByIdAndUpdate(
    id,
    {
      visibility: type,
    },
    options
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

const findHistoryQuestionByQuestionId = async (questionId, options = {}) => {
  return questionHistoryModel.find({ questionId }, null, options).lean();
};
const createHistoryQuestionInDB = async (
  { questionId, userId, metadata, version },
  options = {}
) => {
  return questionHistoryModel.create(
    [
      {
        questionId,
        userId,
        metadata,
        version,
      },
    ],
    options
  );
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
