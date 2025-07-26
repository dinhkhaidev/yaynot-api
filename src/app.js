const express = require("express");
const app = express();
const cors = require("cors");
// const swaggerUi = require("swagger-ui-express");
// const swaggerDocument = require("./swagger.json");
// const mongodb=require("./databases/mongodb.database")
require("./databases/mongodb.database");
require("./configs/redis.config");
app.use(
  cors({
    origin: "*", //* for dev
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", require("./routes/index"));
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use((req, res, next) => {
  const error = new Error("Route not found!");
  error.status = 404;
  next(error);
});
app.use((err, req, res, next) => {
  const messageError = err.message || "Internal Server Error!";
  const statusError = err.status || 500;
  res.status(statusError).json({
    status: "Error",
    code: statusError,
    messageError,
    err: err.stack,
  });
});
module.exports = app;
