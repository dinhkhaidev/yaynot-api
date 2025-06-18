const Redis = require("ioredis");
const { createVoteInDB } = require("../models/repositories/vote.repo");
const redis = new Redis();
console.log(redis.status);
const acquireLock = async ({ questionId, voteType, userId }) => {
  const key = `lock-vote-yaynot-2025-${questionId}-${userId}`;
  const retries = 10;
  const expire = 5000;
  for (let index = 0; index < retries; index++) {
    const result = await redis.set(key, "locked", "NX", "PX", expire);
    if (result) {
      let voteResult;
      try {
        const newVote = await createVoteInDB({ questionId, voteType, userId });
        if (!newVote) {
          voteResult = "vote_failed";
        }
        voteResult = newVote;
      } catch (error) {
        throw new Error("Distribute lock error!");
      } finally {
        await redis.del(key);
      }
      return voteResult;
    } else {
      await new Promise((res) => setTimeout(res, 300));
    }
  }
  return "vote_timeout";
};
const releaseKey = async (key) => {
  const del = await redis.del(key);
  return del;
};
module.exports = {
  acquireLock,
  releaseKey,
};
