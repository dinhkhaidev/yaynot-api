const header = require("../../constants/header.js");
const { BadRequestError, NotFoundError } = require("../../core/error.response");
const { OK, CREATED } = require("../../core/success.response");
const AccessService = require("../../services/access.service.js");

class AccessController {
  signUp = async (req, res, next) => {
    new CREATED({
      message: "Register successful!",
      metadata: await AccessService.signUp(req.body),
    }).send(res);
  };
  login = async (req, res, next) => {
    new OK({
      message: "Login successful!",
      metadata: await AccessService.login(req.body),
    }).send(res);
  };
  logout = async (req, res, next) => {
    new OK({
      message: "Logged out successful!",
      metadata: await AccessService.logout({
        id: req.keyToken._id,
        token: req.header(header.AUTHORIZATION),
      }),
    }).send(res);
  };
  handleToken = async (req, res, next) => {
    new OK({
      message: "Get token successful!",
      metadata: await AccessService.handleToken(
        req.user,
        req.keyToken,
        req.header(header.REFRESH_TOKEN),
      ),
    }).send(res);
  };
  verifyOtp = async (req, res, next) => {
    new OK({
      message: "Verify otp successful!",
      metadata: await AccessService.verifyUser({
        email: req.user.email,
        otp: req.query.otp,
      }),
    }).send(res);
  };
}
module.exports = new AccessController();
