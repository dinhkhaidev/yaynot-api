const winston = require("winston");

// Detect deployment environment
// IS_SERVERLESS=true for Vercel (no file logging, no persistent processes)
// IS_SERVERLESS=false or undefined for Railway/VPS (full features)
const isServerless = process.env.IS_SERVERLESS === "true" || process.env.VERCEL;

// File transports - only for non-serverless (Railway, VPS, local)
let transportsCombined, transportsError, transportsDebug;

if (!isServerless) {
  require("winston-daily-rotate-file");

  transportsCombined = new winston.transports.DailyRotateFile({
    filename: "src/logs/result/combined/application-combined-%DATE%.log",
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "7d",
  });

  transportsError = new winston.transports.DailyRotateFile({
    level: "error",
    filename: "src/logs/result/error/application-error-%DATE%.log",
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "30d",
  });

  transportsDebug = new winston.transports.DailyRotateFile({
    level: "debug",
    filename: "src/logs/result/debug/application-debug-%DATE%.log",
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "30d",
  });
}

//build transports array
const transports = [
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
];

//add transports only for non-serverless environments
if (!isServerless) {
  transports.push(transportsCombined, transportsDebug, transportsError);
  console.log("Logger: File logging enabled (Railway/VPS mode)");
} else {
  console.log("Logger: Console only (Serverless mode)");
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports,
});

module.exports = logger;
