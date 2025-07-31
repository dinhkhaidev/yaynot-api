const { userNotificationModel } = require("../models/notification.model");
const {
  findListUserId,
  findUserById,
} = require("../models/repositories/access.repo");
const {
  createNotification,
  getListNotificationByUserIdInDB,
  findUserNotificationInDB,
  markedNotificationInDB,
  deleteNotification,
  deleteUserNotification,
} = require("../models/repositories/notification.repo");
const NotificationInterface = require("../interface/notifications");
const { BadRequestError, NotFoundError } = require("../core/error.response");
class SenderAll extends NotificationInterface {
  async pushNotification(newNotification) {
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
}
class SenderSingle extends NotificationInterface {
  async pushNotification(newNotification, receiveId) {
    const receiveRecord = await findUserById(receiveId);
    if (!receiveRecord) {
      await deleteNotification(newNotification._id);
      throw new BadRequestError("ReceiveId incorrect!");
    }
    await userNotificationModel.create({
      userId: receiveId,
      notificationId: newNotification._id,
    });
  }
}
class NotificationService {
  static async pushNotificationFactory({
    title,
    content,
    type,
    senderId,
    receiveId,
    options,
  }) {
    const newNotification = await createNotification({
      title,
      content,
      type,
      senderId,
      options,
    });
    switch (type) {
      case "ALL":
        await new SenderAll().pushNotification(newNotification);
        break;
      case "MESSAGE":
        await new SenderSingle().pushNotification(newNotification, receiveId);
        break;
      //case ...
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }
    return newNotification;
  }
  static async getListNotification({ userId, cursor }) {
    return getListNotificationByUserIdInDB({ userId, cursor });
  }
  static async markedNotification({ userId, notificationId }) {
    const notificationRecord = await findUserNotificationInDB({
      userId,
      notificationId,
    });
    if (!notificationRecord) {
      throw new NotFoundError("Notification not found!");
    }
    if (notificationRecord.isRead) {
      throw new BadRequestError("Notification already marked!");
    }
    return await markedNotificationInDB({ userId, notificationId });
  }
  static async deleteNotification({ userId, notificationId }) {
    const notificationRecord = await findUserNotificationInDB({
      userId,
      notificationId,
    });
    if (!notificationRecord) {
      throw new NotFoundError("Notification not found!");
    }
    return await deleteUserNotification({ userId, notificationId });
  }
}
module.exports = NotificationService;
