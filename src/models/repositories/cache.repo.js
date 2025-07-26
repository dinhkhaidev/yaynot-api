/**
 * @type {import('ioredis').Redis}
 */
const redis = require("../../configs/redis.config");
class CacheRepo {
  async get(key) {
    return redis.get(key);
  }
  async set(key, value, ttl) {
    return redis.set(key, value, "EX", ttl);
  }
  async del(key) {
    return redis.del(key);
  }
}
module.exports = new CacheRepo();
