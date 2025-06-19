const { voteModel, voteSummaryModel } = require("../vote.model");

const findVoteByUserAndQuestionInDB = async (userId, questionId) => {
  return await voteModel.findOne({ userId, questionId });
};
const upsertVoteInDB = async ({ questionId, voteType, userId }) => {
  const filter = { questionId, userId },
    payload = {
      $set: { voteType, updatedAt: new Date() },
      $setOnInsert: { questionId, userId },
    },
    options = { upsert: true, new: true, includeResultMetadata: true };
  return await voteModel.findOneAndUpdate(filter, payload, options);
};
const findVoteById = async (id) => {
  return await voteModel.findById(id);
};
const deleteVoteInDB = async (id) => {
  return await voteModel.deleteOne({ _id: id });
};
const updateVoteSummaryById = async ({
  questionId,
  voteTypeIncrease,
  type,
}) => {
  const filter = { questionId },
    payload = {
      $inc: { [voteTypeIncrease]: type ? 1 : -1 },
    },
    options = { upsert: true, new: true };
  return await voteSummaryModel.findOneAndUpdate(filter, payload, options);
};
module.exports = {
  findVoteByUserAndQuestionInDB,
  upsertVoteInDB,
  findVoteById,
  deleteVoteInDB,
  updateVoteSummaryById,
};
