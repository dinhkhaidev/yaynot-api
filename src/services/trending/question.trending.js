const { questionTrendingScore } = require("../../configs/trending.config");
const { QuestionEntity } = require("../../domain/question");
const { findByIds } = require("../../models/repositories/question.repo");
const TrendingQuestionCache = require("../cache/trendingQuestionCache");

class QuestionTrending {
  static caculator(question) {
    const questionEntity = QuestionEntity.fromDatabase(question);
    const engagementScore = questionEntity.getEngagementScore();
    const ageInHours = (Date.now() - new Date(question.createdAt)) / 3600000;
    return (
      engagementScore /
      Math.pow(
        ageInHours + questionTrendingScore.OFFSET,
        questionTrendingScore.GRAVITY
      )
    );
  }
  static meetsThreshold(score) {
    return score >= questionTrendingScore.THRESHOLD;
  }
  static async getTrendingQuestion({ userId, page = 0, pageSize = 10 }) {
    let trending = await TrendingQuestionCache.getTrending(
      "short",
      page,
      pageSize
    );

    if (trending.length < pageSize) {
      const longTrending = await TrendingQuestionCache.getTrending(
        "long",
        page,
        pageSize - trending.length
      );
      trending.push(...longTrending);
    }
    const questionIds = trending.map((t) => t.id);
    const unseenIds = await TrendingQuestionCache.filterUnseen(
      userId,
      questionIds
    );

    if (unseenIds.length < pageSize && trending.length === pageSize) {
      const moreTrending = await TrendingQuestionCache.getTrending(
        "short",
        page + 1,
        pageSize
      );
      const moreIds = moreTrending.map((t) => t.id);
      const moreUnseen = await TrendingQuestionCache.filterUnseen(
        userId,
        moreIds
      );
      unseenIds.push(...moreUnseen);
    }
    const questions = await findByIds(unseenIds.slice(0, pageSize));

    // await TrendingQuestionCache.markAsSeen(
    //   userId,
    //   questions.map((q) => q._id)
    // );

    return questions;
  }
  static async getStats() {
    const shortCount = await TrendingQuestionCache.getCount("short");
    const longCount = await TrendingQuestionCache.getCount("long");

    return {
      shortNewsfeed: shortCount,
      longNewsfeed: longCount,
    };
  }
}
module.exports = QuestionTrending;
