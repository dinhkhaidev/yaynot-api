const Joi = require("joi");
const rabbitmqConfig = require("../../../configs/rabbitmq.config");
const { io } = require("../../../configs/socketio.config");
const NotificationService = require("../../../services/notification.service");
const connectRabbitMQ = require("../connectRabbitmq");
const { default: mongoose } = require("mongoose");
const { BadRequestError } = require("../../../core/error.response");
//db mock
// mongoose
//   .connect("mongodb://localhost:27018/YayNot", {
//     // bufferCommands: true, // Default is true
//     // bufferMaxEntries: 0, // Set to 0 to disable buffering, or a higher number for more entries
//   })
//   .then(() => console.log("Database connected!"))
//   .catch((err) => console.error("Database connection error:", err));
const notificationConsumer = async () => {
  const result = await connectRabbitMQ();
  const { channel, connection } = result;
  try {
    const configType = rabbitmqConfig("notification");
    const queueNoti = configType.queue.main;
    console.log(`RabbitMQ: Waiting for messages in ${queueNoti}...`);
    await channel.prefetch(3);
    channel.consume(
      queueNoti,
      async (msg) => {
        try {
          const data = JSON.parse(msg.content.toString());
          console.log("[CONSUMER] Processing notification:", data);

          //Create and send notification
          await NotificationService.pushNotificationFactory(data);
          const ioChatNamespace = io.of("/notification");
          const text = data.message;
          //send to socketio
          ioChatNamespace.to(`user_${data.receiveId}`).emit(text);
          channel.ack(msg);
          console.log("[CONSUMER] Notification processed successfully");
        } catch (error) {
          console.error(
            "[CONSUMER] Error processing notification:",
            error.message
          );
          // nack(msg, false, false): reject without requeue in this queue but send to dlx
          // This will send the message to retry queue via DLX
          channel.nack(msg, false, false);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Error in notification consumer:", error.message);
    // channel.nack(msg, false, false);
  }
};
module.exports = { notificationConsumer };
// notificationConsumer();
