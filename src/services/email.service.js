// const { newOtpToken, generateOtpToken } = require("./otp.service");
// const { getTemplate } = require("../services/template.service");
// const { replaceHolderTemplate } = require("../utils/email");
// const { transporter } = require("../configs/nodemailer.config");
// const {
//   findOtpByEmail,
//   deleteOtpByEmail,
// } = require("../models/repositories/email.repo");
// const { findUserByEmail } = require("../models/repositories/access.repo");
// const { BadRequestError } = require("../core/error.response");
// const jwt = require("jsonwebtoken");
// const { SHA256 } = require("crypto-js");
// const { JWT_CONFIG } = require("../configs/auth.config");
// const blake = require("blakejs");

// const sendEmailTransport = ({ from, to, subject, text, html }) => {
//   const mailOptions = {
//     from,
//     to,
//     subject,
//     html,
//   };
//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error("Lỗi gửi email:", error);
//     } else {
//       console.log("Email đã gửi:", info.response);
//     }
//   });
// };

// const sendEmailVerify = async ({ email, name = "email-verify" }) => {
//   const foundUser = await findUserByEmail(email);
//   if (foundUser.user_isVerify) {
//     throw new BadRequestError("Account has been verified!");
//   }
//   const foundOtp = await findOtpByEmail(email);
//   if (foundOtp) {
//     await deleteOtpByEmail(email);
//   }
//   const otp = await newOtpToken(email);
//   const template = await getTemplate(name);
//   const params = {
//     link_verify: `${process.env.URL_MAIL_VERIFY}/?otp=${otp.otp}`,
//   };
//   const html = replaceHolderTemplate(template.html, params);
//   sendEmailTransport({
//     from: process.env.EMAIL_NODEMAILER,
//     to: email,
//     subject: "Verify your account!",
//     html,
//   });
//   return email;
// };

// const sendEmailVerifyStateless = async ({ email, name = "email-verify" }) => {
//   const foundUser = await findUserByEmail(email);
//   if (foundUser.user_isVerify) {
//     throw new BadRequestError("Account has been verified!");
//   }

//   const saltVerify = process.env.SALT_VERIFY_EMAIL;
//   if (!saltVerify) {
//     throw new BadRequestError("SALT_VERIFY_EMAIL not found!");
//   }
//   const otp = generateOtpToken();
//   const otpHash = blake.blake2bHex(otp + saltVerify);
//   const otpToken = jwt.sign(
//     {
//       email,
//       otpHash,
//     },
//     process.env.OTP_TOKEN_SECRET,
//     {
//       algorithm: JWT_CONFIG.ALGORITHM,
//       expiresIn: "15m",
//     }
//   );
//   const template = await getTemplate(name);
//   const params = {
//     link_verify: `${process.env.URL_MAIL_VERIFY}/?token=${otpToken}`,
//     otp_plain: `${otp}`,
//   };
//   const html = replaceHolderTemplate(template.html, params);
//   sendEmailTransport({
//     from: process.env.EMAIL_NODEMAILER,
//     to: email,
//     subject: "Verify your account!",
//     html,
//   });
//   return email;
// };

// module.exports = { sendEmailVerify, sendEmailVerifyStateless };

const { newOtpToken, generateOtpToken } = require("./otp.service");
const { getTemplate } = require("../services/template.service");
const { replaceHolderTemplate } = require("../utils/email");
const { transporter } = require("../configs/nodemailer.config");
const {
  findOtpByEmail,
  deleteOtpByEmail,
} = require("../models/repositories/email.repo");
const { findUserByEmail } = require("../models/repositories/access.repo");
const { BadRequestError } = require("../core/error.response");
const jwt = require("jsonwebtoken");
const { SHA256 } = require("crypto-js");
const { JWT_CONFIG } = require("../configs/auth.config");
const blake = require("blakejs");
const { getCache } = require("../infrastructures/cache/getCache");
const { keyOtpToken } = require("../infrastructures/cache/keyBuilder");

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
//oldversion
// const sendEmailVerify = async ({ email, name = "email-verify" }) => {
//   const foundUser = await findUserByEmail(email);
//   if (!foundUser) {
//     throw new BadRequestError("User not found!");
//   }
//   if (foundUser.user_isVerify) {
//     throw new BadRequestError("Invalid verification link!");
//   }
//   const foundOtp = await findOtpByEmail(email);
//   if (foundOtp) {
//     await deleteOtpByEmail(email);
//   }
//   const otp = await newOtpToken(email);
//   const template = await getTemplate(name);
//   const params = {
//     link_verify: `${process.env.URL_MAIL_VERIFY}/?otp=${otp.otp}`,
//   };
//   const html = replaceHolderTemplate(template.html, params);
//   sendEmailTransport({
//     from: process.env.EMAIL_NODEMAILER,
//     to: email,
//     subject: "Verify your account!",
//     html,
//   });
//   return email;
// };

const generateVerifyToken = async (email) => {
  const foundUser = await findUserByEmail(email);
  if (!foundUser) {
    throw new BadRequestError("User not found!");
  }
  if (foundUser.user_isVerify) {
    throw new BadRequestError("Invalid verification link!");
  }

  const saltVerify = process.env.SALT_VERIFY_EMAIL;
  if (!saltVerify) {
    throw new BadRequestError("SALT_VERIFY_EMAIL not found!");
  }

  const otp = generateOtpToken();
  const otpHash = blake.blake2bHex(otp + saltVerify);
  const otpToken = jwt.sign({ email, otpHash }, process.env.OTP_TOKEN_SECRET, {
    algorithm: JWT_CONFIG.ALGORITHM,
    expiresIn: "15m",
  });

  return { otpToken, otp };
};

const sendEmailVerifyStateless = async ({ email, name = "email-verify" }) => {
  const foundUser = await findUserByEmail(email);
  if (!foundUser) {
    throw new BadRequestError("User not found!");
  }
  if (foundUser.user_isVerify) {
    throw new BadRequestError("Invalid verification link!");
  }

  //Queue to RabbitMQ
  const {
    publishVerificationEmail,
  } = require("../message-queue/rabbitmq/producers/email.producer");
  publishVerificationEmail({ email, name }).catch((err) => {
    console.error("Failed to queue email:", err);
  });

  return { email };
};

const getOtpToken = async (email) => {
  const otpToken = await getCache(keyOtpToken(email));

  if (!otpToken) {
    throw new BadRequestError(
      "OTP token not found or expired. Please request a new one."
    );
  }

  return { email, otpToken };
};

module.exports = {
  sendEmailVerifyStateless,
  generateVerifyToken,
  getOtpToken,
};
