const rabbitmqConfig = require("../../../configs/rabbitmq.config");
const { BadRequestError } = require("../../../core/error.response");
const {
  notificationMQSchema,
} = require("../../../validations/Joi/notification.validation");
const connectRabbitMQ = require("../connectRabbitmq");

const notificationProducer = async (data) => {
  try {
    const { title, content, type, senderId, receiveId, message } = data;
    const result = await connectRabbitMQ();
    const { channel, connection } = result;
    //validate data
    const { error, value } = notificationMQSchema.validate(data);
    const configType = rabbitmqConfig("notification");
    const queueNoti = configType.queue.main;
    channel.sendToQueue(queueNoti, Buffer.from(JSON.stringify(value)), {
      headers: {
        "x-origin-queue": queueNoti,
        "x-created-at": Date.now(),
      },
      persistent: false,
    });
    if (error) {
      console.error("Invalid message format:", error.message);
      throw new BadRequestError(`Invalid message format: ${error.message}`);
    }
    console.log(`Sent: ${JSON.stringify(data)}`);
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    throw new BadRequestError(`error connect rabbitmq: ${error.message}`);
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
