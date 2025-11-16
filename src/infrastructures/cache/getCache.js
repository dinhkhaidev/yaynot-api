const cacheRepo = require("../../models/repositories/cache.repo");

const getCache = async (key) => {
  const cached = await cacheRepo.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
};
const setCache = async (key, value, ttl) => {
  await cacheRepo.set(key, JSON.stringify(value), ttl);
};
module.exports = { getCache, setCache };
