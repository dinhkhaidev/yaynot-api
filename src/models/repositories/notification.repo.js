const { notificationModel } = require("../notification.model");

const createNotification = async (payload) => {
  return await notificationModel.create(payload);
};
module.exports = { createNotification };
