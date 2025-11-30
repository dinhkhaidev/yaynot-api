require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const msg = {
//   to: "regaccdame6@gmail.com",
//   from: "dinhkhaidev@gmail.com",
//   subject: "Sending with Twilio SendGrid is Fun",
//   text: "and easy to do anywhere, even with Node.js",
//   html: "<strong>and easy to do anywhere, even with Node.js</strong>",
// };

const sendMailWithRetrySendGrid = async (mailOptions, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const info = await sgMail.send(mailOptions);
      return info;
    } catch (error) {
      console.error(`[Sendgrid] Attempt ${i + 1} failed:`, error.message);
      if (error.response) {
        console.error(error.response.body);
      }
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
};
module.exports = { sgMail, sendMailWithRetrySendGrid };
