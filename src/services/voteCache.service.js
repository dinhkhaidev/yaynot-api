const { getRedis } = require("../databases/init.redis");
const {
  findVoteByUserAndQuestionInDB,
} = require("../models/repositories/vote.repo");
const redis = getRedis();

class VoteCacheService {
  /**
   * Cache key: voted:{questionId}:{userId}
   * Value: "yay" | "nay" | null
   * TTL: 1 hour (votes rarely change)
   */
  static async hasUserVoted(questionId, userId, voteType) {
    const key = `voted:${questionId}:${userId}`;
    const cached = await redis.get(key);

    if (cached !== null) return cached === "yay"; //Convert to boolean
    //fallback db
    const voteRecord = await findVoteByUserAndQuestionInDB(userId, questionId);
    return !!voteRecord && voteRecord.voteType === voteType;
  }
  static async cacheVote(questionId, userId, voteType) {
    const key = `voted:${questionId}:${userId}`;
    const value = voteType ? "yay" : "nay";
    await redis.setex(key, 3600, value);
  }
  static async invalidateVote(questionId, userId) {
    const key = `voted:${questionId}:${userId}`;
    await redis.del(key);
  }

  static async batchCheckVotes(questionId, userIds) {
    if (!userIds || userIds.length === 0) return {};
    const keys = userIds.map((uid) => `voted:${questionId}:${uid}`);
    const values = await redis.mget(keys);
    const result = {};
    userIds.forEach((uid, idx) => {
      if (values[idx] !== null) {
        result[uid] = values[idx] === "yay";
      }
    });
    return result;
  }
}

module.exports = VoteCacheService;
