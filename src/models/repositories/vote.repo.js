const { default: mongoose } = require("mongoose");
const { voteModel } = require("../vote.model");

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

module.exports = {
  findVoteByUserAndQuestionInDB,
  upsertVoteInDB,
  findVoteById,
  deleteVoteInDB,
  findVoteByQuestionId,
};
