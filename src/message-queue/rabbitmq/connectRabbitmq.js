// const amqp = require("amqplib");
// require("dotenv").config();
// const connectRabbitMQ = async () => {
//   const connection = await amqp.connect(process.env.URL_RABBITMQ);
//   const channel = await connection.createChannel();
//   return { connection, channel };
// };
// module.exports = connectRabbitMQ;

const amqp = require("amqplib");
require("dotenv").config();
let connection;

const connectRabbitMQ = async () => {
  if (!connection) {
    connection = await amqp.connect(process.env.URL_RABBITMQ);
    connection.on("close", () => {
      connection = null;
    });
    connection.on("error", () => {
      connection = null;
    });
  }
  const channel = await connection.createChannel(); // channel mới
  return { connection, channel };
};
module.exports = connectRabbitMQ;
