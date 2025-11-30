const connectRabbitMQ = require("../connectRabbitmq");
const { generateVerifyToken } = require("../../../services/email.service");
const { getTemplate } = require("../../../services/template.service");
const { replaceHolderTemplate } = require("../../../utils/email");
// const { sendMailWithRetry } = require("../../../configs/nodemailer.config");
const { getRedis } = require("../../../databases/init.redis");
const { setCache } = require("../../../infrastructures/cache/getCache");
const { keyOtpToken } = require("../../../infrastructures/cache/keyBuilder");
const rabbitmqConfig = require("../../../configs/rabbitmq.config");
const {
  sendMailWithRetrySendGrid,
} = require("../../../infrastructures/email/sendGrid");

const configType = rabbitmqConfig("email.auth");
const QUEUE_NAME = configType.queue.main;

const emailConsumer = async () => {
  const { channel } = await connectRabbitMQ();

  try {
    await channel.prefetch(1);

    console.log(`[Email Consumer] Waiting for messages in ${QUEUE_NAME}...`);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        try {
          const { email, name } = JSON.parse(msg.content.toString());
          console.log(`[Email Consumer] Processing email for: ${email}`);

          const { otpToken, otp } = await generateVerifyToken(email);
          await setCache(keyOtpToken(email), otpToken, 900);
          console.log(`[Email Consumer] Token cached for: ${email}`);

          const template = await getTemplate(name);
          const params = {
            link_verify: `${process.env.URL_MAIL_VERIFY}/?token=${otpToken}`,
            otp_plain: otp,
          };
          const html = replaceHolderTemplate(template.html, params);

          await sendMailWithRetrySendGrid({
            from: process.env.EMAIL_NODEMAILER,
            to: email,
            subject: "Verify your account!",
            html,
          });

          channel.ack(msg);
          console.log(`[Email Consumer] Email sent successfully to: ${email}`);
        } catch (error) {
          console.error("[Email Consumer] Error:", error.message, error);
          channel.nack(msg, false, false); // Requeue on error
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("[Email Consumer] Setup error:", error.message);
  }
};

module.exports = { emailConsumer };
