// Worker process - runs RabbitMQ consumers and cron jobs
// This runs on Railway/Render/VPS - NOT on Vercel
require("dotenv").config();
const { initRedis } = require("../databases/init.redis");

// Connect to databases
require("../databases/mongodb.database");

console.log("🚀 Starting worker process...");

// Main worker startup function
async function startWorker() {
  try {
    // Initialize Redis
    await initRedis();
    console.log("Redis connected");

    // Setup RabbitMQ infrastructure (queues/exchanges/bindings)
    // This needs to run BEFORE consumers can start
    console.log("Setting up RabbitMQ infrastructure...");
    require("../message-queue/rabbitmq/setupRabbitmq");

    // Wait for setup to complete
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("RabbitMQ queues ready");

    // Start RabbitMQ consumers
    console.log("Starting RabbitMQ consumers...");
    const {
      notificationConsumer,
    } = require("../message-queue/rabbitmq/consumers/notification.consumer");
    await notificationConsumer();
    console.log("Notification consumer started");

    // Start cron jobs
    console.log("Starting cron jobs...");
    const asyncViewCronjob = require("../cronjob/question/asyncView.cron");
    const asyncDataCronjob = require("../cronjob/question/asyncData.cron");
    const { keyFlushShareQuestion } = require("../utils/cacheRedis");

    asyncViewCronjob({
      patternKeyViewQuestion: "question:*:view",
      mode: "start",
    });

    asyncDataCronjob({
      patternKey: "question:*:share",
      mode: "start",
      keyFlushFunc: keyFlushShareQuestion,
      fieldData: "shareCount",
    });

    console.log("Worker process started successfully!");
    console.log("Active services:");
    console.log("  - RabbitMQ Notification Consumer");
    console.log("  - Cron: View Counter");
    console.log("  - Cron: Share Counter");
  } catch (error) {
    console.error("Failed to start worker:", error);
    process.exit(1);
  }
}

startWorker();

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Worker shutting down...");
  // Close connections
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Worker shutting down...");
  process.exit(0);
});

// Keep process alive
setInterval(() => {
  console.log("Worker heartbeat - " + new Date().toISOString());
}, 60000); // Every minute
