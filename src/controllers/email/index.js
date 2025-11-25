const { CREATED, OK } = require("../../core/success.response");
const { sendEmailVerify } = require("../../services/email.service");
const { checkOtpToken } = require("../../services/otp.service");
const { createTemplate } = require("../../services/template.service");

class EmailController {
  createTemplate = async (req, res, next) => {
    new CREATED({
      message: "Create template successful!",
      metadata: await createTemplate(req.body),
    }).send(res);
  };
}
module.exports = new EmailController();
