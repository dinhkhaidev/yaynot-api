const { BadRequestError, NotFoundError } = require("../core/error.response");
const {
  findVoteByUserAndQuestionInDB,
  deleteVoteInDB,
  updateVoteSummaryById,
  findVoteById,
} = require("../models/repositories/vote.repo");
const {
  validateFindQuestionById,
} = require("../validations/service/questionService.validate");
const { acquireLock } = require("./redis.service");

class VoteService {
  static async upsertVote({ questionId, voteType, userId }) {
    if (!userId) throw new NotFoundError("User ID is required!");
    const voteRecord = await findVoteByUserAndQuestionInDB(userId, questionId);
    if (voteRecord && voteRecord.voteType === voteType)
      throw new BadRequestError("Vote is existed!");
    const newVote = await acquireLock({ questionId, voteType, userId });
    return newVote;
  }
  static async deleteVote(voteId) {
    const voteRecord = await findVoteById(voteId);
    if (!voteRecord) throw new NotFoundError("Vote not found!");
    const deleteVote = await deleteVoteInDB(voteId);
    const voteTypeIncrease = voteRecord.voteType
      ? "voteYesCount"
      : "voteNoCount";
    console.log("voteTypeIncrease", voteTypeIncrease);
    await updateVoteSummaryById({
      questionId: voteRecord.questionId,
      voteTypeIncrease,
      type: false,
    });
    return deleteVote;
  }
  //handle detail vote of question
  static async getDetailVote({ voteId }) {
    const voteRecord = await findVoteById(voteId);
    if (!voteRecord) throw new NotFoundError("Vote not found!");
  }
}
module.exports = VoteService;
