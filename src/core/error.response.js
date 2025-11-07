const { StatusCodes, ReasonPhrases } = require("../utils/httpStatusCode");
// const statusCodes = require("../utils/statusCodes");
// const StatusCode = {
//   BAD_REQUEST: 400,
//   NOT_FOUND: 404,
//   UNAUTHORIZED: 401,
//   FORBIDDEN: 403,
// };
// const ReasonStatusCode = {
//   BAD_REQUEST: "Invalid request!",
//   NOT_FOUND: "Not Found",
//   UNAUTHORIZED: "Unauthorized",
//   FORBIDDEN: "Forbidden",
// };

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
class BadRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.BAD_REQUEST,
    status = StatusCodes.BAD_REQUEST,
  ) {
    super(message, status);
  }
}
class NotFoundError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.NOT_FOUND,
    status = StatusCodes.NOT_FOUND,
  ) {
    super(message, status);
  }
}
class AuthFailureError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.UNAUTHORIZED,
    status = StatusCodes.UNAUTHORIZED,
  ) {
    super(message, status);
  }
}
class ForbiddenError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.FORBIDDEN,
    status = StatusCodes.FORBIDDEN,
  ) {
    super(message, status);
  }
}
class RequestTimeoutError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.REQUEST_TIMEOUT,
    status = StatusCodes.REQUEST_TIMEOUT,
  ) {
    super(message, status);
  }
}
module.exports = {
  AuthFailureError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  RequestTimeoutError,
};
