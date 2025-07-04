const Redis = require("ioredis");
const {
  upsertVoteInDB,
  updateVoteSummaryById,
} = require("../models/repositories/vote.repo");
const { RequestTimeoutError } = require("../core/error.response");
// const redis = new Redis(); //TURNOFF REDIS
// console.log(redis.status);
const acquireLock = async ({ questionId, userId }) => {
  const key = `${process.env.DISTRIBUTED_LOCK}-${questionId}-${userId}`;
  const retries = 10;
  const expire = 5000;
  for (let index = 0; index < retries; index++) {
    const result = await redis.set(key, "locked", "NX", "PX", expire);
    if (result) {
      return { key };
    } else {
      await new Promise((res) => setTimeout(res, 300));
    }
  }
  throw new RequestTimeoutError("Server busy! Try again.");
};
const releaseKey = async (key) => {
  const del = await redis.del(key);
  return del;
};
module.exports = {
  acquireLock,
  releaseKey,
};
