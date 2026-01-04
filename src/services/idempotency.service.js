const { IdempotencyProcessingError } = require("../core/error.response");
const { getCache, setCache } = require("../infrastructures/cache/getCache");
const { keyIdempotency } = require("../infrastructures/cache/keyBuilder");

class IdempotencyService {
  /**
   * //check idempotency key
   * @todo ensure idempotency
   * @todo set cache idempotency in service
   */
  static async ensureIdempotency(key) {
    const cached = await getCache(key);
    if (!cached) return null;

    const parsed = JSON.parse(cached);

    if (parsed.status === "DONE") {
      return {
        statusCached: parsed.status,
        dataCached: JSON.parse(cached),
      };
    }
  }
  static async storeIdempotency(payload) {
    //set cache idempotency in service
    const { userId, path, statusCode, ...data } = payload;
    const value = { status: "DONE", dataCached: data, status: statusCode };
    const key = keyIdempotency(path, userId);
    await setCache(key, JSON.stringify(value), 60 * 60);
  }
}
module.exports = IdempotencyService;
