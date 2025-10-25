const amqp = require("amqplib");
const connectRabbitmq = require("../connectRabbitmq");
const rabbitmqConfig = require("../../../configs/rabbitmq.config");

const notificationRetry = async () => {
  try {
    const { channel, connect } = await connectRabbitmq();
    const configType = rabbitmqConfig("notification");

    const retryQueue = configType.queue.retry;
    const deadQueue = configType.queue.dead; // add queue DLQ
    const RETRY_LIMIT = 3;

    await channel.prefetch(1);

    channel.consume(retryQueue, async (msg) => {
      if (!msg) return;
      const notification = JSON.parse(msg.content.toString());
      const headers = msg.properties.headers || {};
      let retries = 0;
      if (headers["x-death"] && Array.isArray(headers["x-death"])) {
        retries = headers["x-death"][0].count || 0;
      }
      try {
        if (retries >= RETRY_LIMIT) {
          console.log(
            `[DLQ] Exceeded retry limit. Moving notification for user: ${notification.to}`
          );
          // Chuyển message sang Dead Letter Queue
          channel.sendToQueue(deadQueue, msg.content, {
            headers: {
              ...headers,
              "x-reason": "Exceeded retry limit",
              "x-retries": retries,
            },
            persistent: true,
          });
          channel.ack(msg);
          return;
        }
        console.log(
          `[RETRY] Retry ${retries + 1}/${RETRY_LIMIT} for notification to: ${
            notification.to
          }`
        );
        const originQueue = headers["x-origin-queue"];
        if (!originQueue) {
          console.error(`[RETRY] Missing origin queue for: ${notification.to}`);
          channel.ack(msg);
          return;
        }
        //resend to queue
        channel.sendToQueue(originQueue, msg.content, {
          headers: {
            ...headers,
            "x-origin-queue": originQueue,
            "x-retries": retries + 1,
          },
          persistent: true,
        });

        channel.ack(msg);
      } catch (error) {
        console.error(
          `[ERROR] Failed to process retry for ${notification.to}:`,
          error
        );
        channel.nack(msg, false, true); //Requeue avoid lost message
      }
    });

    console.log(`[*] Waiting for messages in ${retryQueue}`);
  } catch (error) {
    console.error("❌ Error connecting to RabbitMQ:", error);
  }
};

module.exports = { notificationRetry };
notificationRetry();
