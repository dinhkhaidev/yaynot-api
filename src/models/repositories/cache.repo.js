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
  async setnx(key, value, ttl) {
    return redis.set(key, value, "EX", ttl, "NX");
  }
  async incr(key) {
    return redis.incr(key);
  }
  async del(key) {
    return redis.del(key);
  }
  async keys(pattern) {
    return redis.keys(pattern);
  }
}
module.exports = new CacheRepo();
