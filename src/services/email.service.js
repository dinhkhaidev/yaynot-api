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
// const { transporter } = require("../configs/nodemailer.config");
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
const { sleep } = require("../utils/time");

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

// const getOtpToken = async (email, maxRetries = 10, delayMs = 80) => {
//   for (let i = 0; i < maxRetries; i++) {
//     const otpToken = await getCache(keyOtpToken(email));

//     if (otpToken) {
//       console.log(`OTP token found for ${email} after ${i} retries`);
//       return { email, otpToken };
//     }

//     if (i < maxRetries - 1) {
//       const waitTime = delayMs * Math.pow(1.5, i);
//       console.log(
//         `OTP not ready, retry ${i + 1}/${maxRetries} after ${waitTime}ms`
//       );
//       await new Promise((resolve) => setTimeout(resolve, waitTime));
//     }
//   }

//   throw new BadRequestError(
//     "OTP token not found or expired. Please request a new one."
//   );
// };

const getOtpToken = async (email, maxRetries = 10) => {
  //Detect environment: PaaS (Render/Railway) vs local/IAAS(ec2) development
  const isPaaS = process.env.IS_PAAS === "true";

  //Config for PaaS vs local/IAAS(ec2) Redis
  const config = isPaaS
    ? {
        //PaaS Redis (higher network latency ~50-200ms)
        //Redis hosted on Upstash/Redis Cloud with shared infrastructure
        fastRetries: 6,
        baseDelay: 100,
        initialWait: 60,
        jitter: 30,
        maxWait: 250,
        totalTimeout: 1500,
      }
    : {
        //local/IAAS(ec2) Redis (very low latency ~1-5ms)
        fastRetries: 5,
        baseDelay: 30,
        initialWait: 30,
        jitter: 20,
        maxWait: 200,
        totalTimeout: 500,
      };

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const otpToken = await getCache(keyOtpToken(email));
    if (otpToken) {
      return { email, otpToken };
    }

    if (attempt === maxRetries - 1) break;

    let waitTime;

    if (attempt < config.fastRetries) {
      //Polling: initial wait + jitter
      waitTime = config.initialWait + Math.random() * config.jitter; // NOSONAR
    } else {
      //Exponential backoff
      const exp =
        config.baseDelay * 2 * Math.pow(1.5, attempt - config.fastRetries);
      waitTime = Math.min(exp + Math.random() * config.jitter, config.maxWait); // NOSONAR
    }

    await sleep(waitTime);
  }

  throw new BadRequestError(
    "OTP token not found. Please try again or request a new verification email."
  );
};

module.exports = {
  sendEmailVerifyStateless,
  generateVerifyToken,
  getOtpToken,
};
