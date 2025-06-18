const voteModel = require("../vote.model");

const findVoteUserInDB = async (userId, questionId) => {
  return await voteModel.findOne({ userId, questionId });
};
const createVoteInDB = async ({ questionId, voteType, userId }) => {
  return await voteModel.create({ questionId, voteType, userId });
};
module.exports = {
  findVoteUserInDB,
  createVoteInDB,
};
