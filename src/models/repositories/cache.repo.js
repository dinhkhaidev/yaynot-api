/**
 * @type {import('ioredis').Redis}
 */
// const redis = require("../../configs/redis.config");
const { getRedis } = require("../../databases/init.redis");

class CacheRepo {
  getRedisInstance() {
    const instanceRedis = getRedis();
    if (!instanceRedis) {
      throw new Error(
        "Redis instance is not initialized. Make sure initRedis() is called before using cache operations."
      );
    }
    return instanceRedis;
  }

  async get(key) {
    const redis = this.getRedisInstance();
    return redis.get(key);
  }
  async set(key, value, ttl) {
    const redis = this.getRedisInstance();
    return redis.set(key, value, "EX", ttl);
  }
  async setnx(key, value, ttl) {
    const redis = this.getRedisInstance();
    return redis.set(key, value, "EX", ttl, "NX");
  }
  async incr(key) {
    const redis = this.getRedisInstance();
    return redis.incr(key);
  }
  async del(key) {
    const redis = this.getRedisInstance();
    return redis.del(key);
  }
  async keys(pattern) {
    const redis = this.getRedisInstance();
    return redis.keys(pattern);
  }
}
module.exports = new CacheRepo();
