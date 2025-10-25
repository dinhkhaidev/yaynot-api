const amqp = require("amqplib");
const connectRabbitmq = require("./connectRabbitmq");
const rabbitmqConfig = require("../../configs/rabbitmq.config");
(async () => {
  const isProduction = process.env.NODE_ENV === "production";
  //connect to rabbitMQ
  const result = await connectRabbitmq();
  const { channel, connect } = result;
  const configType = rabbitmqConfig("notification");
  //queue for notification
  const queueNoti = configType.queue.main;
  const queueRetryNoti = configType.queue.retry;
  const queueDlxNoti = configType.queue.dlx;
  //exchange for retry
  const exchangeRetryNoti = configType.exchange.retry;
  const exchangeNoti = configType.exchange.main;
  const exchangeDlxNoti = configType.exchange.dlx;
  //key for dlx
  const keyRetryNoti = configType.key.retry;
  const keyNoti = configType.key.main;
  const keyDlxNoti = configType.key.dlx;
  //setup for notification
  await channel.assertExchange(exchangeNoti, "direct", {
    durable: isProduction,
  });
  await channel.assertQueue(queueNoti, {
    durable: isProduction,
    deadLetterExchange: exchangeRetryNoti,
    deadLetterRoutingKey: keyRetryNoti,
  });
  await channel.bindQueue(queueNoti, exchangeNoti, keyNoti);
  //setup for retry
  await channel.assertExchange(exchangeRetryNoti, "direct", {
    durable: isProduction,
  });
  await channel.assertQueue(queueRetryNoti, {
    durable: isProduction,
    messageTtl: 10000, //delay avoid overload
    deadLetterExchange: exchangeDlxNoti,
    deadLetterRoutingKey: keyDlxNoti,
  });
  await channel.bindQueue(queueRetryNoti, exchangeRetryNoti, keyRetryNoti);
  //setup for dlx
  await channel.assertExchange(exchangeDlxNoti, "direct", {
    durable: isProduction, //production must => durable:true
  });
  await channel.assertQueue(queueDlxNoti.dlx, {
    durable: isProduction,
  });
  await channel.bindQueue(queueDlxNoti, exchangeDlxNoti, keyDlxNoti);
  //close
  console.log("Setup rabbitmq config successful and close.");
  // await channel.close();
  // await connect.close();
})();
