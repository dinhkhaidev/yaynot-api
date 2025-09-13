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
  try {
    const queueNoti = rabbitmqConfig.queue.notification;
    const result = await connectRabbitMQ();
    const { channel, connection } = result;
    await channel.assertQueue(queueNoti, { durable: false });
    console.log(`RabbitMQ: Waiting for messages in ${queueNoti}...`);
    channel.consume(
      queueNoti,
      async (msg) => {
        const data = JSON.parse(msg.content.toString());
        console.log("msg", data);
        //create noti
        await NotificationService.pushNotificationFactory(data);
        const ioChatNamespace = io.of("/notification");
        const text = data.message;
        //send to socketio
        ioChatNamespace.to(`user_${data.userId}`).emit(text);
        channel.ack(msg);
      },
      { noAck: true }
    );
  } catch (error) {
    //dlx
  }
};
module.exports = { notificationConsumer };
notificationConsumer();
