const rabbitmqConfig = require("../../../configs/rabbitmq.config");
const {
  notificationMQSchema,
} = require("../../../validations/Joi/notification.validation");
const connectRabbitMQ = require("../connectRabbitmq");

const notificationProducer = async (data) => {
  try {
    const { title, content, type, senderId, receiveId, message } = data;
    const queueNoti = rabbitmqConfig.queue.notification;
    const result = await connectRabbitMQ();
    const { channel, connection } = result;
    await channel.assertQueue(queueNoti, { durable: false });
    //validate data
    const { error, value } = notificationMQSchema.validate(data);
    channel.sendToQueue(queueNoti, Buffer.from(JSON.stringify(value)), {
      persistent: false,
    });
    if (error) {
      console.error("Invalid message format:", error.message);
      channel.nack(msg, false, false); // push to dlq
      return;
    }
    console.log(`Sent: ${JSON.stringify(data)}`);
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error("error connect rabbitmq: ", error);
  }
};
module.exports = { notificationProducer };
// notificationProducer({
//   title: "test",
//   content: "test content",
//   type: "message",
//   senderId: "6862581564c4f74e37bed3a4",
//   receiveId: "6862581c64c4f74e37bed3a8",
//   message: "6862581c64c4f74e37bed3a8 đã gửi cho bạn tin nhắn!",
// });
