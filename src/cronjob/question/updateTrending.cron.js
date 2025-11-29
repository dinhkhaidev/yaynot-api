const cron = require("node-cron");
const QuestionTrending = require("../../services/trending/question.trending");
const TrendingQuestionCache = require("../../services/cache/trendingQuestionCache");
class TrendingQuestionCronjob {
  static startShortTrendings() {
    cron.schedule("0 * * * *", async () => {
      try {
        console.log("[Cron] Updating short newsfeed...");
        const questionCandidates = await getTrendingCandidates(3);
        const scoredQuestions = questionCandidates
          .map((question) => {
            return {
              id: question._id,
              score: QuestionTrending.caculator(question),
            };
          })
          .filter((q) => QuestionTrending.meetsThreshold(q.score))
          .sort((a, b) => b.score - a.score)
          .slice(0, 100);
        await TrendingQuestionCache.updateTrending(scoredQuestions, "long");
        console.log(
          `[Cron] Short newsfeed updated: ${scored.length} questions`
        );
      } catch (error) {
        console.error("[Cron] Short newsfeed error:", error);
      }
    });
  }
  static startLongTrendings() {
    cron.schedule("0 */6 * * *", async () => {
      try {
        console.log("[Cron] Updating long newsfeed...");
        const questionCandidates = await getTrendingCandidates(30);
        const scoredQuestions = questionCandidates
          .map((question) => {
            return {
              id: question._id,
              score: QuestionTrending.caculator(question),
            };
          })
          .filter((q) => QuestionTrending.meetsThreshold(q.score))
          .sort((a, b) => b.score - a.score)
          .slice(0, 200);
        await TrendingQuestionCache.updateTrending(scoredQuestions, "long");
        console.log(`[Cron] Long newsfeed updated: ${scored.length} questions`);
      } catch (error) {
        console.error("[Cron] Long newsfeed error:", error);
      }
    });
  }
  static start() {
    this.startShortNewsfeed();
    this.startLongNewsfeed();
    console.log("[Cron] Trending jobs scheduled");
  }
}
module.exports = TrendingQuestionCronjob;
