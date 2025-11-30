const rabbitmqConfig = require("../../../configs/rabbitmq.config");
const connectRabbitMQ = require("../connectRabbitmq");

const configType = rabbitmqConfig("email.auth");
const QUEUE_NAME = configType.queue.main;
const publishVerificationEmail = async ({ email, name = "email-verify" }) => {
  try {
    const { channel } = await connectRabbitMQ();

    const message = { email, name, timestamp: Date.now() };

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
      headers: {
        "x-origin-queue": QUEUE_NAME,
        "x-created-at": Date.now(),
      },
      persistent: false,
    });

    console.log(`Email queued for: ${email}`);
  } catch (err) {
    console.error("Failed to publish email to queue:", err);
  }
};

module.exports = { publishVerificationEmail };
