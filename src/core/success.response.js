const { StatusCodes, ReasonPhrases } = require("../utils/httpStatusCode");
const StatusCode = {
  OK: 200,
  CREATED: 201,
};
const ReasonStatusCode = {
  OK: "Success",
  CREATED: "Created!",
};
class SuccessResponse {
  constructor({
    message,
    metadata = [],
    statusCode = StatusCode.OK,
    reasonPhrases = ReasonStatusCode.OK,
  }) {
    (this.message = !message ? reasonPhrases : message),
      (this.status = statusCode),
      (this.metadata = metadata);
  }
  send(res, headers = {}) {
    res.status(this.status).json(this);
  }
}
class OK extends SuccessResponse {
  constructor({ message, metadata = [] }) {
    super({ message, metadata });
  }
}
class CREATED extends SuccessResponse {
  constructor({ message, metadata = [], reasonPhrases, statusCode }) {
    super({
      message,
      metadata,
      reasonPhrases: ReasonStatusCode.CREATED,
      statusCode: StatusCode.CREATED,
    });
  }
}
module.exports = {
  OK,
  CREATED,
};
