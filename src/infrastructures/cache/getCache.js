const cacheRepo = require("../../models/repositories/cache.repo");

const getCache = async (key) => {
  const cached = await cacheRepo.get(key);
  if (cached) {
    console.log("Cache hit:::", key);
    return JSON.parse(cached);
  }
};
const setCache = async (key, value, ttl) => {
  await cacheRepo.set(key, JSON.stringify(value), ttl);
};
const delCache = async (key) => {
  await cacheRepo.del(key);
};
module.exports = { getCache, setCache, delCache };
