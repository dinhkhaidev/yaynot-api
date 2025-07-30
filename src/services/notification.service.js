const { default: mongoose } = require("mongoose");
const { userNotificationModel } = require("../models/notification.model");
const { findListUserId } = require("../models/repositories/access.repo");
const {
  createNotification,
} = require("../models/repositories/notification.repo");
class NotificationService {
  static async pushNotification({ title, content, type, senderId, options }) {
    const newNotification = await createNotification({
      title,
      content,
      type,
      senderId,
      options,
    });
    if (type === "ALL") {
      const batchSize = 1000;
      const userCursor = await findListUserId(batchSize);
      let batch = [];
      for await (const doc of userCursor) {
        batch.push({
          userId: doc._id,
          notificationId: newNotification._id,
        });
        if (batch.length >= batchSize) {
          await userNotificationModel.insertMany(batch);
          batch = [];
        }
      }
      if (batch.length > 0) {
        await userNotificationModel.insertMany(batch);
      }
    }
    return newNotification;
  }
}
module.exports = NotificationService;
// (async () => {
//   await NotificationService.pushNotification({
//     title: "title",
//     content: "title1",
//     type: "ALL",
//     senderId: "6862581564c4f74e37bed3a4",
//     // options,
//   });
// })();
