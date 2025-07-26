const Redis = require("ioredis");
const redis = new Redis({
  retryStrategy: (times) => Math.min(times * 50, 2000),
}); //TURNOFF REDIS
console.log("redis", redis.status);
module.exports = redis;
