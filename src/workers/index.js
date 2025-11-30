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
    const setupRabbitmq = require("../message-queue/rabbitmq/setupRabbitmq");
    await setupRabbitmq();
    console.log("RabbitMQ queues ready");

    // Start RabbitMQ consumers
    console.log("Starting RabbitMQ consumers...");
    const {
      notificationConsumer,
    } = require("../message-queue/rabbitmq/consumers/notification.consumer");
    const {
      emailConsumer,
    } = require("../message-queue/rabbitmq/consumers/email.consumer");
    const {
      notificationRetry,
    } = require("../message-queue/rabbitmq/retry-policy/notification.retry");
    const {
      emailRetry,
    } = require("../message-queue/rabbitmq/retry-policy/email.retry");
    const {
      notificationDlx,
    } = require("../message-queue/rabbitmq/dlx/notification.dlx");
    const { emailDlx } = require("../message-queue/rabbitmq/dlx/email.dlx");

    await notificationConsumer();
    console.log("Notification consumer started");

    await emailConsumer();
    console.log("Email consumer started");

    await notificationRetry();
    console.log("Notification retry handler started");

    await emailRetry();
    console.log("Email retry handler started");

    await notificationDlx();
    console.log("Notification DLX handler started");

    await emailDlx();
    console.log("Email DLX handler started");

    // Start cron jobs
    console.log("Starting cron jobs...");
    const asyncViewCronjob = require("../cronjob/question/asyncView.cron");
    const asyncDataCronjob = require("../cronjob/question/asyncData.cron");
    const { keyFlushShareQuestion } = require("../utils/cacheRedis");
    const TrendingQuestionCronjob = require("../cronjob/question/updateTrending.cron");

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

    TrendingQuestionCronjob.start();
    console.log("Worker process started successfully!");
    console.log("Active services:");
    console.log("  - RabbitMQ Notification Consumer");
    console.log("  - RabbitMQ Email Consumer");
    console.log("  - RabbitMQ Notification Retry Handler");
    console.log("  - RabbitMQ Email Retry Handler");
    console.log("  - RabbitMQ Notification DLX Handler");
    console.log("  - RabbitMQ Email DLX Handler");
    console.log("  - Cron: View Counter");
    console.log("  - Cron: Share Counter");
    console.log("  - Cron: Trending Short Question");
    console.log("  - Cron: Trending Long Question");
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
