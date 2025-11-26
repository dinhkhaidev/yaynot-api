const express = require("express");
const app = express();
const cors = require("cors");
const logger = require("./configs/loggerWinston.config");
const logCustom = require("./logger/logCustom");
const { v4: uuidv4 } = require("uuid");
const swaggerUi = require("swagger-ui-express");
const { sendEmailVerifyStateless } = require("./services/email.service");
const asyncViewCronjob = require("./cronjob/question/asyncView.cron");
const asyncDataCronjob = require("./cronjob/question/asyncData.cron");
const { keyFlushShareQuestion } = require("./utils/cacheRedis");
const { initRedis } = require("./databases/init.redis");
// const mongodb=require("./databases/mongodb.database")
require("./databases/mongodb.database");

// Detect deployment environment
// IS_SERVERLESS=true for Vercel (no cron jobs, no RabbitMQ consumers)
// IS_SERVERLESS=false for Render/Railway (API only, workers run separately)
const isServerless =
  process.env.IS_SERVERLESS === "true" || process.env.VERCEL === "1";

// Initialize Redis (required for all modes)
(async () => {
  try {
    await initRedis();
    console.log("Redis initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Redis:", error);
  }
})();

// Note: RabbitMQ consumers and cron jobs are handled by separate worker process
// See: src/workers/index.js (runs on Railway)
if (isServerless) {
  console.log("ℹ Mode: Serverless (Vercel) - API only");
} else {
  console.log("ℹ Mode: Long-running (Render) - API only");
  console.log("ℹ Workers (cron jobs + RabbitMQ) run separately on Railway");
}

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
const swaggerFileName =
  process.env.NODE_ENV === "developer"
    ? "swagger-output.local.json"
    : "swagger-output.json";
const swaggerDocument = require(`../swagger/${swaggerFileName}`);
app.get(`/${swaggerFileName}`, (req, res) => {
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
        url: '/${swaggerFileName}',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        requestInterceptor: (req) => {
          if (req.headers.Authorization && !req.headers.Authorization.startsWith('Bearer ')) {
            req.headers.Authorization = 'Bearer ' + req.headers.Authorization;
          }
          return req;
        }
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
