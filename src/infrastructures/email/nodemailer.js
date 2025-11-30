const nodemailer = require("nodemailer");
require("dotenv").config();

const createTransporter = () => {
  const config = {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_NODEMAILER,
      pass: process.env.PASS_NODEMAILER,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  };

  return nodemailer.createTransport(config);
};

const transporter = createTransporter();

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("[Nodemailer] Connection failed:", error.message);
  } else {
    console.log("[Nodemailer] Server is ready to send emails");
  }
});

// Wrapper with retry logic
const sendMailWithRetry = async (mailOptions, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      console.error(`[Nodemailer] Attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
};

module.exports = { transporter, sendMailWithRetry };
