const connectRabbitmq = require("./connectRabbitmq");
const rabbitmqConfig = require("../../configs/rabbitmq.config");
const logger = require("../../logger/logCustom");

const isProduction = process.env.NODE_ENV === "production";

/**
 * Setup queue topology with DLX and retry mechanism
 * @param {Object} channel - RabbitMQ channel
 * @param {Object} config - Queue configuration from rabbitmqConfig
 */
async function setupQueueTopology(channel, config) {
  const { queue, exchange, key } = config;

  // 1. Setup DLX (Dead Letter Exchange)
  await channel.assertExchange(exchange.dlx, "direct", {
    durable: isProduction,
  });
  await channel.assertQueue(queue.dlx, { durable: isProduction });
  await channel.bindQueue(queue.dlx, exchange.dlx, key.dlx);

  // 2. Setup Retry Queue
  await channel.assertExchange(exchange.retry, "direct", {
    durable: isProduction,
  });
  await channel.assertQueue(queue.retry, {
    durable: isProduction,
    messageTtl: 10000,
    deadLetterExchange: exchange.dlx,
    deadLetterRoutingKey: key.dlx,
  });
  await channel.bindQueue(queue.retry, exchange.retry, key.retry);

  // 3. Setup Main Queue
  await channel.assertExchange(exchange.main, "direct", {
    durable: isProduction,
  });
  await channel.assertQueue(queue.main, {
    durable: isProduction,
    deadLetterExchange: exchange.retry,
    deadLetterRoutingKey: key.retry,
  });
  await channel.bindQueue(queue.main, exchange.main, key.main);
}

/**
 * Setup all RabbitMQ queues
 * @param {Array<string>} queueTypes - Array of queue types to setup (default: ["notification"])
 */
async function setupRabbitmq(queueTypes = ["notification", "email"]) {
  let connection, channel;

  try {
    const result = await connectRabbitmq();
    connection = result.connect;
    channel = result.channel;

    for (const type of queueTypes) {
      const config = rabbitmqConfig(type);
      await setupQueueTopology(channel, config);
      logger.log(`RabbitMQ topology setup completed for: ${type}`);
    }

    logger.log("All RabbitMQ queues setup successfully");
  } catch (error) {
    logger.error("✗ RabbitMQ setup failed:", error);
    throw error;
  } finally {
    if (channel) await channel.close();
    if (connection) await connection.close();
  }
}

// Run setup if executed directly
// if (require.main === module) {
//   setupRabbitmq()
//     .then(() => process.exit(0))
//     .catch((err) => {
//       console.error(err);
//       process.exit(1);
//     });
// }

module.exports = setupRabbitmq();
