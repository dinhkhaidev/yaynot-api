// const redis = require("../configs/redis.config");
const { getRedis } = require("../databases/init.redis");
const redis = getRedis();
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
const {
  updateQuestionVoteCount,
} = require("../models/repositories/question.repo");
const { voteSummaryModel } = require("../models/vote.model");
const {
  validateFindQuestionById,
  validateIdQuestionPayload,
} = require("../validations/service/questionService.validate");
const { acquireLock } = require("./lockRedis.service");
const VoteCacheService = require("./voteCache.service");
const QuestionValidationRule = require("../domain/question/rules/questionValidation.rule");
class VoteService {
  static async upsertVote({ questionId, voteType, userId }) {
    if (!userId) {
      throw new NotFoundError("User ID is required!");
    }

    let keyLock;
    try {
      keyLock = await acquireLock({ questionId, userId });
      const cachedVote = await VoteCacheService.hasUserVoted(
        questionId,
        userId
      );
      if (cachedVote !== null && cachedVote === voteType) {
        throw new BadRequestError("Vote is existed!");
      }
      //fallback db
      const voteRecord = await findVoteByUserAndQuestionInDB(
        userId,
        questionId
      );
      if (voteRecord && voteRecord.voteType === voteType) {
        throw new BadRequestError("Vote is existed!");
      }

      const newVote = await upsertVoteInDB({ questionId, voteType, userId });
      if (!newVote) {
        return "vote_failed";
      }

      //update cache
      await VoteCacheService.cacheVote(questionId, userId, voteType);

      const voteTypeIncrease = voteType ? "voteYesCount" : "voteNoCount";
      const voteTypeDecrease = !voteType ? "voteYesCount" : "voteNoCount";

      if (!newVote.lastErrorObject.updatedExisting) {
        await updateVoteSummaryById({
          questionId,
          voteTypeIncrease,
          typeIncr: true,
        });
        //non-blocking
        updateQuestionVoteCount({ questionId, increment: true }).catch((err) =>
          console.error("Failed to update question voteCount:", err)
        );
      } else {
        //Changed vote: increase new, decrease old in SINGLE query
        //voteCount stays same (user just changed vote type, not adding new vote)
        await updateVoteSummaryById({
          questionId,
          voteTypeIncrease,
          voteTypeDecrease,
          typeIncr: true,
        });
      }
      return newVote;
    } catch (error) {
      throw error;
    } finally {
      if (keyLock?.key) {
        await redis.del(keyLock.key);
      }
    }
  }
  static async deleteVote(voteId) {
    const voteRecord = await findVoteById(voteId);
    if (!voteRecord) {
      throw new NotFoundError("Vote not found!");
    }
    const deleteVote = await deleteVoteInDB(voteId);
    const voteTypeIncrease = voteRecord.voteType
      ? "voteYesCount"
      : "voteNoCount";
    await updateVoteSummaryById({
      questionId: voteRecord.questionId,
      voteTypeIncrease,
      type: false,
    });
    //non-blocking
    updateQuestionVoteCount({
      questionId: voteRecord.questionId,
      increment: false,
    }).catch((err) =>
      console.error("Failed to update question voteCount:", err)
    );
    return deleteVote;
  }
  //handle detail vote of question
  static async getDetailVote({ questionId, myVote }) {
    validateIdQuestionPayload(questionId);
    await QuestionValidationRule.validateQuestion({ questionId });
    const voteSummaryRecord = await getVoteSummaryByQuestionId(questionId);
    if (!voteSummaryRecord) {
      throw new NotFoundError("Question not included vote!");
    }
    const voteSummary = { ...voteSummaryRecord };
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
