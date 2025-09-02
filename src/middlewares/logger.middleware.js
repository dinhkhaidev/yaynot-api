const logger = require("../configs/loggerWinston.config");
const { v4: uuidv4 } = require("uuid");
const logCustom = require("../logger/logCustom");
module.exports = () => {
  return (req, res, next) => {
    // req.requestId = uuidv4();
    try {
      const start = Date.now();
      const requestId = req.header["x-trace-id"] || uuidv4();
      req.requestId = requestId;
      res.on("finish", () => {
        const duration = Date.now() - start;
        // logger.info({
        //   msg: "HTTP request log",
        //   url: req.originalUrl,
        //   requestId: req.requestId,
        //   method: req.method,
        //   status: res.statusCode,
        //   duration,
        // });
        logCustom.log(`Input params::${duration}ms response`, [
          req.path,
          { requestId: req.requestId },
          req.method === "POST" ? req.body : req.params,
        ]);
      });
      res.setHeader("x-trace-id", req.requestId);
      next();
    } catch (error) {
      next(error);
    }
  };
};
