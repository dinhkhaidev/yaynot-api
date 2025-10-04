const Redis = require("ioredis");
const redis = new Redis({
  port: process.env.REDIS_PORT || 6379, // Redis port
  host: process.env.REDIS_HOST || "redis",
  username: process.env.REDIS_USERNAME || "",
  password: process.env.REDIS_PASSWORD || "",
  retryStrategy: (times) => Math.min(times * 50, 2000),
}); //TURNOFF REDIS
// console.log("redis", redis.status);
redis.on("connect", () => console.log("Redis connected"));
redis.on("ready", () => console.log("Redis ready"));
redis.on("error", (err) => console.error("Redis error:", err.message));
redis.on("close", () => console.log("Redis connection closed"));
module.exports = redis;
