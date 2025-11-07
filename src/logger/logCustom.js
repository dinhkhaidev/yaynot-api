const { v4: uuidv4 } = require("uuid");
const winston = require("winston");
const { combine, timestamp, metadata, printf } = winston.format;

// Detect deployment environment
const isServerless =
  process.env.IS_SERVERLESS === "true" || process.env.VERCEL === "1"; // Vercel sets VERCEL=1

// File transports - only for non-serverless (Railway, VPS, local)
const transportsInfo = (myFormat) => {
  if (isServerless) {
    return null;
  }

  require("winston-daily-rotate-file");
  return new winston.transports.DailyRotateFile({
    filename: "src/logs/result/combined/application-%DATE%.info.log",
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "5m",
    maxFiles: "14d",
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      myFormat
    ),
    level: "info",
  });
};

const transportsError = (myFormat) => {
  if (isServerless) {
    return null;
  }

  return new winston.transports.DailyRotateFile({
    level: "error",
    filename: "src/logs/result/error/application-%DATE%.error.log",
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "5m",
    maxFiles: "14d",
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      myFormat
    ),
  });
};

class LoggerCustom {
  constructor() {
    const myFormat = printf(
      ({ level, message, context, requestId, timestamp, metadata }) => {
        return `${timestamp}::${level}::${message}::${context}::${requestId}::${JSON.stringify(
          metadata
        )}`;
      }
    );

    // Build transports array
    const transports = [new winston.transports.Console()];

    // Add file transports for non-serverless environments
    if (!isServerless) {
      const infoTransport = transportsInfo(myFormat);
      const errorTransport = transportsError(myFormat);
      if (infoTransport) {
        transports.push(infoTransport);
      }
      if (errorTransport) {
        transports.push(errorTransport);
      }
    }

    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        myFormat
      ),
      transports,
    });
  }
  commonObject(params) {
    let context, req, metadata;
    if (!Array.isArray(params)) {
      context = params;
    } else {
      [context, req, metadata] = params;
    }
    const requestId = req?.requestId || uuidv4();
    return {
      requestId,
      context,
      metadata,
    };
  }
  log(message, params) {
    const logParams = this.commonObject(params);
    const logObject = { message, ...logParams };
    // const logObject = Object.assign({ message }, logParams);
    this.logger.info(logObject);
  }
  error(message, params) {
    const logParams = this.commonObject(params);
    const logObject = { message, ...logParams };
    this.logger.error(logObject);
  }
}
module.exports = new LoggerCustom();
