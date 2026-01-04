const { NotFoundError } = require("../core/error.response");
const IdempotencyService = require("../services/idempotency.service");

const idempotencyMiddleware = () => {
  return async (req, res, next) => {
    if (req.method !== "POST") {
      return next();
    }
    const key = req.headers["idempotency-key"];
    if (!key) {
      throw new NotFoundError("Idempotency key missing!");
    }
    const ensureIdempotency = await IdempotencyService.ensureIdempotency(key);
    if (ensureIdempotency) {
      req.keyIdempotency = key;
      return res
        .status(ensureIdempotency.statusCached)
        .json(ensureIdempotency.dataCached);
    }
    next();
  };
};

module.exports = { idempotencyMiddleware };
