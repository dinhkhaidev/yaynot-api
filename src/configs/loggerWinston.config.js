const winston = require("winston");
require("winston-daily-rotate-file");
const transportsCombined = new winston.transports.DailyRotateFile({
  filename: "src/logs/result/combined/application-combined-%DATE%.log",
  datePattern: "YYYY-MM-DD-HH",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "7d",
});
const transportsError = new winston.transports.DailyRotateFile({
  level: "error",
  filename: "src/logs/result/error/application-error-%DATE%.log",
  datePattern: "YYYY-MM-DD-HH",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "30d",
});
const transportsDebug = new winston.transports.DailyRotateFile({
  level: "debug",
  filename: "src/logs/result/debug/application-debug-%DATE%.log",
  datePattern: "YYYY-MM-DD-HH",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "30d",
});
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf((info) => {
          const msg =
            typeof info.message === "object"
              ? JSON.stringify(info.message, null, 2)
              : info.message;
          return `${info.level}: ${msg || JSON.stringify(info, null, 2)}`;
        })
      ),
    }),
    transportsCombined,
    transportsDebug,
    transportsError,
  ],
});
module.exports = logger;
// logger.info("Server started on port 3000");
