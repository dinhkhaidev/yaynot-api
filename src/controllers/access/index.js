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
}
module.exports = new AccessController();
