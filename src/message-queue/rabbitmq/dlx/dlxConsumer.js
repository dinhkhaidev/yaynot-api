const amqp = require("amqplib");
const connectRabbitmq = require("../connectRabbitmq");
const rabbitmqConfig = require("../../../configs/rabbitmq.config");

const consumerDlx = async () => {
  try {
    const result = await connectRabbitmq();
    const { channel, connect } = result;
    const dlxQueue = rabbitmqConfig.queue.dlx;
    const RETRY_LIMIT = 3;
    await channel.prefetch(1);
    channel.consume(dlxQueue, (msg) => {
      if (!msg) return;
      console.log("msg", msg.content.toString());
      const notification = JSON.parse(msg.content.toString());
      const headers = msg.properties.headers || {};
      let retries = 0;
      if (headers["x-death"] && Array.isArray(headers["x-death"])) {
        retries = headers["x-death"][0].count || 0;
      }
      try {
        //update: check type TEMPORARY, PERMANENT, unknown
        retries += 1;
        if (retries >= RETRY_LIMIT) {
          console.log(
            `Moving notification to DLQ for user: ${notification.to}`
          );
          channel.ack(msg);
        } else {
          console.log(
            `Retry ${retries} for notification to: ${notification.to}`
          );
          // Update headers for retry count
          const originQueue = headers["x-origin-queue"];
          console.log("originQueue", headers);
          if (originQueue) {
            channel.sendToQueue(originQueue, msg.content, {
              headers: {
                ...headers,
                "x-origin-queue": originQueue,
                "x-death": retries,
              },
            });
            channel.ack(msg);
          } else {
            console.error(
              `No origin queue found for notification to: ${notification.to}`
            );
            channel.ack(msg);
            return;
          }
        }
      } catch (error) {
        console.error(`Error sending notification to: ${notification.to}`);
        channel.nack(msg, false, true);
      }
    });
  } catch (error) {
    console.error("error connect rabbitmq:", error);
  }
};
module.exports = { consumerDlx };
consumerDlx();
