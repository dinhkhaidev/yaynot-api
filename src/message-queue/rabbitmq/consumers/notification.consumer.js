const Joi = require("joi");
const rabbitmqConfig = require("../../../configs/rabbitmq.config");
const { io } = require("../../../configs/socketio.config");
const NotificationService = require("../../../services/notification.service");
const connectRabbitMQ = require("../connectRabbitmq");
const { default: mongoose } = require("mongoose");
const { BadRequestError } = require("../../../core/error.response");
//db mock
mongoose
  .connect("mongodb://localhost:27018/YayNot", {
    // bufferCommands: true, // Default is true
    // bufferMaxEntries: 0, // Set to 0 to disable buffering, or a higher number for more entries
  })
  .then(() => console.log("Database connected!"))
  .catch((err) => console.error("Database connection error:", err));
const notificationConsumer = async () => {
  const result = await connectRabbitMQ();
  const { channel, connection } = result;
  try {
    const queueNoti = rabbitmqConfig.queue.notification;
    console.log(`RabbitMQ: Waiting for messages in ${queueNoti}...`);
    await channel.prefetch(3);
    channel.consume(
      queueNoti,
      async (msg) => {
        try {
          let random = Math.random() * 10;
          console.log("random", random);
          if (random < 8) {
            throw new Error("errr");
          }
          const data = JSON.parse(msg.content.toString());
          console.log("msg", data);
          //create noti
          // await NotificationService.pushNotificationFactory(data);
          // const ioChatNamespace = io.of("/notification");
          // const text = data.message;
          // //send to socketio
          // ioChatNamespace.to(`user_${data.userId}`).emit(text);
          channel.ack(msg);
        } catch (error) {
          console.log("error!");
          channel.nack(msg, false, false);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    // channel.nack(msg, false, false);
  }
};
module.exports = { notificationConsumer };
notificationConsumer();
