const Redis = require("ioredis");
const redis = new Redis();
const { BadRequestError, NotFoundError } = require("../core/error.response");
const {
  findVoteByUserAndQuestionInDB,
  deleteVoteInDB,
  updateVoteSummaryById,
  findVoteById,
  getVoteSummaryByQuestionId,
  findVoteByQuestionId,
  upsertVoteInDB,
} = require("../models/repositories/vote.repo");
const { voteSummaryModel } = require("../models/vote.model");
const {
  validateFindQuestionById,
  validateIdQuestionPayload,
} = require("../validations/service/questionService.validate");
const { acquireLock } = require("./lockRedis.service");
class VoteService {
  static async upsertVote({ questionId, voteType, userId }) {
    if (!userId) throw new NotFoundError("User ID is required!");
    const voteRecord = await findVoteByUserAndQuestionInDB(userId, questionId);
    if (voteRecord && voteRecord.voteType === voteType)
      throw new BadRequestError("Vote is existed!");
    // const newVote = await acquireLock({ questionId, voteType, userId });
    let key;
    try {
      const newVote = await upsertVoteInDB({ questionId, voteType, userId });
      const voteTypeIncrease = voteType ? "voteYesCount" : "voteNoCount";
      const voteTypeDecrease = !voteType ? "voteYesCount" : "voteNoCount";
      const keyLock = await acquireLock({ questionId, userId });
      key = keyLock.key;
      if (!newVote) {
        return "vote_failed";
      }
      if (!newVote.lastErrorObject.updatedExisting) {
        await updateVoteSummaryById({
          questionId,
          voteTypeIncrease,
          typeIncr: true,
        });
      } else {
        await updateVoteSummaryById({
          questionId,
          voteTypeIncrease,
          typeIncr: true,
        });
        await updateVoteSummaryById({
          questionId,
          voteTypeIncrease: voteTypeDecrease,
          typeIncr: false,
        });
      }
      return newVote;
    } catch (error) {
      throw new Error("Distribute lock error!");
    } finally {
      if (key) await redis.del(key);
    }
  }
  static async deleteVote(voteId) {
    const voteRecord = await findVoteById(voteId);
    if (!voteRecord) throw new NotFoundError("Vote not found!");
    const deleteVote = await deleteVoteInDB(voteId);
    const voteTypeIncrease = voteRecord.voteType
      ? "voteYesCount"
      : "voteNoCount";
    await updateVoteSummaryById({
      questionId: voteRecord.questionId,
      voteTypeIncrease,
      type: false,
    });
    return deleteVote;
  }
  //handle detail vote of question
  static async getDetailVote({ questionId, myVote }) {
    validateIdQuestionPayload(questionId);
    await validateFindQuestionById(questionId);
    const voteSummaryRecord = await getVoteSummaryByQuestionId(questionId);
    if (!voteSummaryRecord)
      throw new NotFoundError("Question not included vote!");
    let voteSummary = { ...voteSummaryRecord };
    const { voteYesCount, voteNoCount } = voteSummaryRecord;
    //hanlde topcomment ...
    voteSummary.voteYesPercentage =
      Math.round((voteYesCount / (voteYesCount + voteNoCount)) * 100) || 0;
    voteSummary.voteNoPercentage =
      Math.round((voteNoCount / (voteYesCount + voteNoCount)) * 100) || 0;
    voteSummary.myVote = myVote;
    voteSummary.totalVote = voteYesCount + voteNoCount;
    return voteSummary;
  }
}
module.exports = VoteService;
