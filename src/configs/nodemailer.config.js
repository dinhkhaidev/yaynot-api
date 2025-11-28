//migrate to infra
const nodemailerInfra = require("../infrastructures/email/nodemailer");
// const nodemailer = require("nodemailer");
// require("dotenv").config();
// // Create a test account or replace with real credentials.
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_NODEMAILER,
//     pass: process.env.PASS_NODEMAILER,
//   },
// });
module.exports = { 
  transporter: nodemailerInfra.transporter,
  sendMailWithRetry: nodemailerInfra.sendMailWithRetry 
};
