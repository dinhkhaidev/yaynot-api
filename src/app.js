const express = require("express");
const app = express();
// const mongodb=require("./databases/mongodb.database")
require("./databases/mongodb.database");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", require("./routes/index"));
app.use((req, res, next) => {
  const error = new Error("Route not found!");
  error.status = 404;
  next(error);
});
app.use((err, req, res, next) => {
  console.log("err", err.message);
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
