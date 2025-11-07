const amqp = require("amqplib");
const connectRabbitmq = require("../connectRabbitmq");
const rabbitmqConfig = require("../../../configs/rabbitmq.config");
const notificationDlx = async () => {
  try {
    const result = await connectRabbitmq();
    const { channel, connect } = result;
    const configType = rabbitmqConfig("notification");
    const dlxQueue = configType.queue.dlx;
    await channel.prefetch(1);
    console.log(`[DLX] Waiting for failed messages in ${dlxQueue}...`);
    channel.consume(dlxQueue, async (msg) => {
      if (!msg) {return;}
      try {
        const notification = JSON.parse(msg.content.toString());
        const headers = msg.properties.headers || {};
        const retries = headers["x-retries"] || 0;
        const reason = headers["x-reason"] || "Unknown";
        const failedAt = headers["x-failed-at"] || new Date().toISOString();

        console.log("[DLX] ⚠️ Processing permanently failed notification:");
        console.log(`  - Receiver: ${notification.receiveId}`);
        console.log(`  - Type: ${notification.type}`);
        console.log(`  - Retries: ${retries}`);
        console.log(`  - Reason: ${reason}`);
        console.log(`  - Failed at: ${failedAt}`);
        console.log("  - Content:", notification);

        // TODO: Implement permanent failure handling
        // Options:
        // 1. Save to database for manual review
        // 2. Send alert to monitoring system (e.g., Slack, email)
        // 3. Log to external logging service
        // 4. Store in Redis for admin dashboard

        // Example: Save to database (uncomment when ready)
        // await FailedNotificationModel.create({
        //   notification,
        //   retries,
        //   reason,
        //   failedAt,
        //   headers
        // });

        // Example: Send alert (uncomment when ready)
        // await sendAlertToAdmin({
        //   title: 'Notification permanently failed',
        //   notification,
        //   retries,
        //   reason
        // });
        channel.ack(msg);
        console.log("[DLX] Message acknowledged and logged");
      } catch (error) {
        console.error("[DLX] Error processing DLX message:", error);
        // Dont requeue - this is the final destination
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("[DLX] Error connecting to RabbitMQ:", error);
  }
};

module.exports = { notificationDlx };
// notificationDlx();
