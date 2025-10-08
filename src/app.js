const express = require("express");
const app = express();
const cors = require("cors");
const logger = require("./configs/loggerWinston.config");
const logCustom = require("./logger/logCustom");
const { v4: uuidv4 } = require("uuid");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger/swagger-output.json");
const { sendEmailVerify } = require("./services/email.service");
const asyncViewCronjob = require("./cronjob/question/asyncView.cron");
const asyncDataCronjob = require("./cronjob/question/asyncData.cron");
const { keyFlushShareQuestion } = require("./utils/cacheRedis");
// const mongodb=require("./databases/mongodb.database")
require("./databases/mongodb.database");
require("./configs/redis.config");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  next();
});
//cronjob async data
asyncViewCronjob({ patternKeyViewQuestion: "question:*:view", mode: "start" });
asyncDataCronjob({
  patternKey: "question:*:share",
  mode: "start",
  keyFlushFunc: keyFlushShareQuestion,
  fieldData: "shareCount",
});

//routes
app.use("/v1", require("./routes/index"));
app.get("/health", (req, res) => res.json({ status: "ok", gateway: true }));
//swagger
app.get("/swagger-output.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDocument);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use((req, res, next) => {
  const error = new Error("Route not found!");
  error.status = 404;
  next(error);
});
app.use((err, req, res, next) => {
  const messageError = err.message || "Internal Server Error!";
  const statusError = err.status || 500;
  // logger.error({
  //   messageError,
  //   url: req.originalUrl,
  //   method: req.method,
  //   status: statusError,
  //   err: err.stack,
  // });
  //v2
  // logCustom.error({
  //   message: messageError,
  //   context: req.originalUrl,
  //   requestId: 123,
  //   metadata: {},
  // });
  res.status(statusError).json({
    status: "Error",
    code: statusError,
    messageError,
    err: err.stack,
  });
});
module.exports = app;
