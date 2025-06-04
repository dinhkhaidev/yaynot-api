const { BadRequestError, NotFoundError } = require("../../core/error.response");
const { OK, CREATED } = require("../../core/success.response");
const AccessService = require("../../services/access.js");

class AccessController {
  signUp = async (req, res, next) => {
    new CREATED({
      message: "Register successful!",
      metadata: await AccessService.signUp(),
    }).send(res);
  };
}
module.exports = new AccessController();
