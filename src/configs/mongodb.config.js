const mongoose = require("mongoose");
require("dotenv").config();
const config = {
  db: {
    userMongodb: process.env.USER_MONGODB,
    passwordMongodb: process.env.PASS_MONGODB,
  },
};
module.exports = config;
