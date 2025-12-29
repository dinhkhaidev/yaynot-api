const {
  keyTrendingQuestionLong,
  keyTrendingQuestionShort,
  keyTrendingUserSeen,
} = require("../../infrastructures/cache/keyBuilder");
const {
  getRedisInstance,
} = require("../../infrastructures/cache/redis.service");
const { BadRequestError } = require("../../core/error.response");
/** @type {import("ioredis").Redis} */
const redis = getRedisInstance();
class TrendingQuestionCache {
  static TTL() {
    return {
      SHORT: 3 * 24 * 60 * 60, // 3 days
      LONG: 30 * 24 * 60 * 60, // 30 days
      USER_SEEN: 7 * 24 * 60 * 60, // 7 days
    };
  }

  static async updateTrending(questions, type = "short") {
    const key =
      type === "long" ? keyTrendingQuestionLong() : keyTrendingQuestionShort();
    const ttl = type === "long" ? this.TTL.LONG : this.TTL.SHORT;
    if (questions.length === 0) {
      return;
    }

    const pipeline = redis.pipeline();

    //del old trending
    pipeline.del(key);

    //add new scores
    questions.forEach(({ id, score }) => {
      pipeline.zadd(key, score, id.toString());
    });

    //set ttl
    pipeline.expire(key, ttl);

    await pipeline.exec();
  }

  static async getTrending(type = "short", page = 0, pageSize = 10) {
    const key =
      type === "long" ? keyTrendingQuestionLong() : keyTrendingQuestionShort();
    const start = page * pageSize;
    const end = start + pageSize - 1;
    const results = await redis.zrevrange(key, start, end, "WITHSCORES");
    let questions = [];
    if (results.length === 0) {
      return [];
    }
    for (let i = 0; i < results.length; i += 2) {
      questions.push({
        id: results[i],
        score: results[i + 1],
      });
    }
    return questions;
  }

  static async markAsSeen(userId, questionIds) {
    const key = keyTrendingUserSeen(userId);
    const pipeline = redis.pipeline();
    questionIds.forEach((questionId) => {
      pipeline.sadd(key, questionId.toString());
    });
    pipeline.expire(key, this.TTL.USER_SEEN);
    await pipeline.exec();
  }

  static async filterUnseen(userId, questionIds) {
    if (questionIds.length === 0) return [];
    const key = keyTrendingUserSeen(userId);
    const seenIds = await redis.smembers(key);
    const seenSet = new Set(seenIds);

    return questionIds.filter((id) => !seenSet.has(id.toString()));
  }

  static async getCount(type = "short") {
    const key =
      type === "long" ? keyTrendingQuestionLong() : keyTrendingQuestionShort();
    return await redis.zcard(key);
  }
}
module.exports = TrendingQuestionCache;
