const { newOtpToken } = require("./otp.service");
const { getTemplate } = require("../services/template.service");
const { replaceHolderTemplate } = require("../utils/email");
const { transporter } = require("../configs/nodemailer.config");
const {
  findOtpByEmail,
  deleteOtpByEmail,
} = require("../models/repositories/email.repo");
const { findUserByEmail } = require("../models/repositories/access.repo");
const { BadRequestError } = require("../core/error.response");
const sendEmailTransport = ({ from, to, subject, text, html }) => {
  const mailOptions = {
    from,
    to,
    subject,
    html,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Lỗi gửi email:", error);
    } else {
      console.log("Email đã gửi:", info.response);
    }
  });
};
const sendEmailVerify = async ({ email, name = "email-verify" }) => {
  const foundUser = await findUserByEmail(email);
  if (foundUser.user_isVerify) {
    throw new BadRequestError("Account has been verified!");
  }
  const foundOtp = await findOtpByEmail(email);
  if (foundOtp) {
    await deleteOtpByEmail(email);
  }
  const otp = await newOtpToken(email);
  const template = await getTemplate(name);
  const params = {
    link_verify: `${process.env.URL_MAIL_VERIFY}/?otp=${otp.otp}`,
  };
  const html = replaceHolderTemplate(template.html, params);
  sendEmailTransport({
    from: process.env.EMAIL_NODEMAILER,
    to: email,
    subject: "Verify your account!",
    html,
  });
  return email;
};
module.exports = { sendEmailVerify };
