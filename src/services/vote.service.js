const { BadRequestError } = require("../core/error.response");
const {
  findVoteUserInDB,
  createVoteInDB,
} = require("../models/repositories/vote.repo");
const {
  validateFindQuestionById,
} = require("../validations/service/questionService.validate");
const { acquireLock } = require("./redis.service");

class VoteService {
  static async createVote({ questionId, voteType, userId }) {
    if (!userId) throw new NotFoundError("User ID is required!");
    const voteRecord = await findVoteUserInDB(userId, questionId);
    if (voteRecord) throw new BadRequestError("Vote is existed!");
    const newVote = await acquireLock({ questionId, voteType, userId });
    return newVote;
  }
}
module.exports = VoteService;
