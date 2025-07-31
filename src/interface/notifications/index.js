const { BadRequestError } = require("../../core/error.response");

class NotificationInterface {
  async pushNotification() {
    throw new Error("Not implement!");
  }
}
module.exports = NotificationInterface;
