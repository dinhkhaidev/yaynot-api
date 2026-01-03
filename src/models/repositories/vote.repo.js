const { default: mongoose } = require("mongoose");
const { voteModel, voteSummaryModel } = require("../vote.model");

const findVoteByUserAndQuestionInDB = async (
  userId,
  questionId,
  options = {}
) => {
  const safeUserId = new mongoose.Types.ObjectId(userId);
  const safeQuestionId = new mongoose.Types.ObjectId(questionId);
  return voteModel
    .findOne(
      {
        userId: safeUserId,
        questionId: safeQuestionId,
      },
      null,
      options
    )
    .lean();
};
const upsertVoteInDB = async (
  { questionId, voteType, userId },
  options = {}
) => {
  options = {
    ...options,
    upsert: true,
    new: true,
    includeResultMetadata: true,
  };
  const filter = { questionId, userId },
    payload = {
      $set: { voteType, updatedAt: new Date() },
      $setOnInsert: { questionId, userId },
    };
  return voteModel.findOneAndUpdate(filter, payload, options).lean();
};
const findVoteById = async (id, options = {}) => {
  return voteModel.findById(id, null, options).lean();
};
const findVoteByQuestionId = async (id, options = {}) => {
  return voteModel.findOne({ questionId: id }, null, options).lean();
};
const deleteVoteInDB = async (id, options = {}) => {
  return voteModel.deleteOne({ _id: id }, options).lean();
};

const updateVoteSummaryById = async (
  { questionId, voteTypeIncrease, voteTypeDecrease, typeIncr },
  options = {}
) => {
  const filter = { questionId };
  const payload = {
    $inc: { [voteTypeIncrease]: typeIncr ? 1 : -1 },
  };

  if (voteTypeDecrease && voteTypeDecrease !== voteTypeIncrease) {
    payload.$inc[voteTypeDecrease] = -1;
  }

  options = { ...options, upsert: true, new: true };
  return voteSummaryModel.findOneAndUpdate(filter, payload, options);
};
const getVoteSummaryByQuestionId = async (questionId, options = {}) => {
  return voteSummaryModel
    .findOne({ questionId: questionId }, null, options)
    .select("voteYesCount voteNoCount")
    .lean();
};
module.exports = {
  findVoteByUserAndQuestionInDB,
  upsertVoteInDB,
  findVoteById,
  deleteVoteInDB,
  updateVoteSummaryById,
  getVoteSummaryByQuestionId,
  findVoteByQuestionId,
};
