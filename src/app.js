const express = require("express");
const app = express();
const cors = require("cors");
const logger = require("./configs/loggerWinston.config");
const logCustom = require("./logger/logCustom");
const { v4: uuidv4 } = require("uuid");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger/swagger-output.json");
const { sendEmailVerify } = require("./services/email.service");
const asyncViewCronjob = require("./cronjob/question/asyncView.cron");
const asyncDataCronjob = require("./cronjob/question/asyncData.cron");
const { keyFlushShareQuestion } = require("./utils/cacheRedis");
const { initRedis } = require("./databases/init.redis");
// const mongodb=require("./databases/mongodb.database")
require("./databases/mongodb.database");

// Detect deployment environment
// IS_SERVERLESS=true for Vercel (no cron jobs, no RabbitMQ consumers)
// IS_SERVERLESS=false or undefined for Railway/VPS (full features)

const isServerless =
  process.env.IS_SERVERLESS === "true" || process.env.VERCEL === "1";

// Conditionally load RabbitMQ and cron jobs (NOT for Vercel serverless)
if (!isServerless) {
  require("./message-queue/rabbitmq/setupRabbitmq");
  console.log("RabbitMQ: Consumers enabled (Railway/VPS mode)");
} else {
  console.log(
    "RabbitMQ: Producers only (Serverless mode - consumers disabled)"
  );
}

// Initialize Redis and start cron jobs
(async () => {
  try {
    await initRedis();
    console.log("Redis initialized successfully");

    // Only start cron jobs in non-serverless environments
    if (!isServerless) {
      console.log("Starting cron jobs... (Railway/VPS mode)");
      //cronjob async data
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
      console.log("Cron jobs started");
    } else {
      console.log("ℹCron jobs disabled (Serverless mode)");
    }
  } catch (error) {
    console.error("Failed to initialize Redis:", error);
    // Don't exit - API can still work without Redis cache
  }
})();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  next();
});

//swagger
app.get("/swagger-output.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDocument);
});

// Swagger UI - Serve HTML with CDN for Vercel compatibility
app.get("/api-docs", (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>YayNot API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/swagger-output.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
      });
    };
  </script>
</body>
</html>
  `;
  res.send(html);
});

//routes
app.get("/health", (req, res) => res.json({ status: "ok", gateway: true }));
app.use("/", require("./routes/index"));
app.use((req, res, next) => {
  const error = new Error("Route not found!");
  error.status = 404;
  next(error);
});
app.use((err, req, res, next) => {
  const messageError = err.message || "Internal Server Error!";
  const statusError = err.status || 500;
  // logger.error({
  //   messageError,
  //   url: req.originalUrl,
  //   method: req.method,
  //   status: statusError,
  //   err: err.stack,
  // });
  //v2
  // logCustom.error({
  //   message: messageError,
  //   context: req.originalUrl,
  //   requestId: 123,
  //   metadata: {},
  // });
  res.status(statusError).json({
    status: "Error",
    code: statusError,
    messageError,
    err: err.stack,
  });
});
module.exports = app;
