const { BadRequestError } = require("../../core/error.response");

class INotificationService {
  async pushNotification() {
    throw new BadRequestError("Not implement!");
  }
}
module.exports = {
  INotificationService,
};
