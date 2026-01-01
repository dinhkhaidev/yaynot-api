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
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { INotificationService } = require("../interface/notifications");
const { withTransaction } = require("../helpers/wrapperTransaction");
class SenderAll extends INotificationService {
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
class SenderSingle extends INotificationService {
  async pushNotification(newNotification, receiveId) {
    return withTransaction(async (session) => {
      const receiveRecord = await findUserById(receiveId, session);
      if (!receiveRecord) {
        await deleteNotification(newNotification._id, session);
        throw new BadRequestError("ReceiveId incorrect!");
      }
      await userNotificationModel.create(
        [
          {
            userId: receiveId,
            notificationId: newNotification._id,
          },
        ],
        { session }
      );
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
      case "all":
        await new SenderAll().pushNotification(newNotification);
        break;
      case "message":
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
