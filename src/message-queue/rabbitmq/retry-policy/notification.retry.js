const amqp = require("amqplib");
const connectRabbitmq = require("../connectRabbitmq");
const rabbitmqConfig = require("../../../configs/rabbitmq.config");

const notificationRetry = async () => {
  try {
    const { channel, connect } = await connectRabbitmq();
    const configType = rabbitmqConfig("notification");
    const retryQueue = configType.queue.retry;
    const deadQueue = configType.queue.dlx; // add queue DLQ
    const RETRY_LIMIT = 3;
    await channel.prefetch(1);
    channel.consume(retryQueue, async (msg) => {
      if (!msg) {return;}
      const notification = JSON.parse(msg.content.toString());
      const headers = msg.properties.headers || {};
      const retries = headers["x-retries"] || 0;
      try {
        //Check if exceeded retry limit
        if (retries >= RETRY_LIMIT) {
          console.log(
            `[DLQ] Exceeded retry limit (${retries}/${RETRY_LIMIT}). Moving notification for user: ${notification.receiveId}`,
          );
          //Send message to Dead Letter Queue
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
          `[RETRY] Attempt ${newRetries}/${RETRY_LIMIT} for notification to: ${notification.receiveId}`,
        );
        const originQueue = headers["x-origin-queue"];
        if (!originQueue) {
          console.error(
            `[RETRY] Missing origin queue for: ${notification.receiveId}`,
          );
          // Send to DLQ if no origin queue
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
        //Resend to origin queue with incremented retry count
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
          `[ERROR] Failed to process retry for ${notification.receiveId}:`,
          error,
        );
        channel.nack(msg, false, true); //Requeue to avoid lost message
      }
    });
    console.log(`[*] Waiting for messages in ${retryQueue}`);
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
  }
};
module.exports = { notificationRetry };
// notificationRetry();
