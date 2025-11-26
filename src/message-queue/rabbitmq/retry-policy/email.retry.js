const connectRabbitmq = require("../connectRabbitmq");
const rabbitmqConfig = require("../../../configs/rabbitmq.config");

const emailRetry = async () => {
  try {
    const { channel, connect } = await connectRabbitmq();
    const configType = rabbitmqConfig("email");
    const retryQueue = configType.queue.retry;
    const deadQueue = configType.queue.dlx;
    const RETRY_LIMIT = 3;
    await channel.prefetch(1);
    channel.consume(retryQueue, async (msg) => {
      if (!msg) return;
      const emailData = JSON.parse(msg.content.toString());
      const headers = msg.properties.headers || {};
      const retries = headers["x-retries"] || 0;
      try {
        if (retries >= RETRY_LIMIT) {
          console.log(
            `[DLQ] Exceeded retry limit (${retries}/${RETRY_LIMIT}). Moving email for: ${emailData.to}`,
          );
          channel.sendToQueue(deadQueue, msg.content, {
            headers: {
              ...headers,
              "x-reason": "Exceeded retry limit",
              "x-retries": retries,
              "x-failed-at": new Date().toISOString(),
            },
            persistent: true,
          });
          channel.ack(msg);
          return;
        }
        const newRetries = retries + 1;
        console.log(
          `[RETRY] Attempt ${newRetries}/${RETRY_LIMIT} for email to: ${emailData.to}`,
        );
        const originQueue = headers["x-origin-queue"];
        if (!originQueue) {
          console.error(
            `[RETRY] Missing origin queue for: ${emailData.to}`,
          );
          channel.sendToQueue(deadQueue, msg.content, {
            headers: {
              ...headers,
              "x-reason": "Missing origin queue",
              "x-retries": retries,
              "x-failed-at": new Date().toISOString(),
            },
            persistent: true,
          });
          channel.ack(msg);
          return;
        }
        channel.sendToQueue(originQueue, msg.content, {
          headers: {
            ...headers,
            "x-origin-queue": originQueue,
            "x-retries": newRetries,
          },
          persistent: true,
        });
        channel.ack(msg);
      } catch (error) {
        console.error(
          `[ERROR] Failed to process retry for ${emailData.to}:`,
          error,
        );
        channel.nack(msg, false, true);
      }
    });
    console.log(`[*] Waiting for messages in ${retryQueue}`);
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
  }
};
module.exports = { emailRetry };
