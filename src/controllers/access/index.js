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
      metadata: await AccessService.logout(req.body),
    }).send(res);
  };
}
module.exports = new AccessController();
