const { default: mongoose } = require("mongoose");
const { voteModel, voteSummaryModel } = require("../vote.model");

const findVoteByUserAndQuestionInDB = async (userId, questionId) => {
  const safeUserId = new mongoose.Types.ObjectId(userId);
  const safeQuestionId = new mongoose.Types.ObjectId(questionId);
  return await voteModel
    .findOne({
      userId: safeUserId,
      questionId: safeQuestionId,
    })
    .lean();
};
const upsertVoteInDB = async ({ questionId, voteType, userId }) => {
  const filter = { questionId, userId },
    payload = {
      $set: { voteType, updatedAt: new Date() },
      $setOnInsert: { questionId, userId },
    },
    options = { upsert: true, new: true, includeResultMetadata: true };
  return await voteModel.findOneAndUpdate(filter, payload, options).lean();
};
const findVoteById = async (id) => {
  return await voteModel.findById(id).lean();
};
const findVoteByQuestionId = async (id) => {
  return await voteModel.findOne({ questionId: id }).lean();
};
const deleteVoteInDB = async (id) => {
  return await voteModel.deleteOne({ _id: id }).lean();
};
const updateVoteSummaryById = async ({
  questionId,
  voteTypeIncrease,
  voteTypeDecrease,
  typeIncr,
}) => {
  const filter = { questionId };
  const payload = {
    $inc: { [voteTypeIncrease]: typeIncr ? 1 : -1 },
  };

  if (voteTypeDecrease && voteTypeDecrease !== voteTypeIncrease) {
    payload.$inc[voteTypeDecrease] = -1;
  }

  const options = { upsert: true, new: true };
  return await voteSummaryModel.findOneAndUpdate(filter, payload, options);
};
const getVoteSummaryByQuestionId = async (questionId) => {
  return await voteSummaryModel
    .findOne({ questionId: questionId })
    .select("voteYesCount voteNoCount commentCount")
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
