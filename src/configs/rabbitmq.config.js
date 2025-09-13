require("dotenv").config();
const rabbitmqConfig = {
  queue: {
    notification: "notification",
  },
};
module.exports = rabbitmqConfig;
