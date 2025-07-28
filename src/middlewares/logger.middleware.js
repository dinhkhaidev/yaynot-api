const logger = require("../configs/loggerWinston.config");
const { v4: uuidv4 } = require("uuid");
module.exports = () => {
  return (req, res, next) => {
    req.requestId = uuidv4();
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      logger.info({
        msg: "HTTP request log",
        url: req.originalUrl,
        requestId: req.requestId,
        method: req.method,
        status: res.statusCode,
        duration,
      });
    });
    next();
  };
};
