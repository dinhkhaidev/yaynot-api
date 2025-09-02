const { v4: uuidv4 } = require("uuid");
const winston = require("winston");
const { combine, timestamp, metadata, printf } = winston.format;
require("winston-daily-rotate-file");
const transportsInfo = (myFormat) => {
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
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        myFormat
      ),
      transports: [
        new winston.transports.Console(),
        transportsInfo(myFormat),
        transportsError(myFormat),
      ],
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
