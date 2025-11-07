const {
  buildResultCursorBased,
} = require("../../helpers/buildResultCursorBased");
const {
  notificationModel,
  userNotificationModel,
} = require("../notification.model");

const createNotification = async (payload) => {
  return await notificationModel.create(payload);
};
const getListNotificationByUserIdInDB = async ({ userId, cursor }) => {
  const query = { userId };
  if (cursor) {
    query._id = { $lt: cursor };
  }
  const sortBy = { createdAt: -1 }; // Fixed: removed undefined 'sort' variable
  const limit = 20;
  const listNoti = await userNotificationModel
    .find({ userId })
    .limit(limit)
    .sort(sortBy)
    .lean();
  return buildResultCursorBased(listNoti, 10);
};
const findUserNotificationInDB = async ({ userId, notificationId }) => {
  return await userNotificationModel.findOne({ userId, notificationId });
};
const markedNotificationInDB = async ({ userId, notificationId }) => {
  return await userNotificationModel.updateOne(
    { userId, notificationId },
    { $set: { isRead: true } }
  );
};
const deleteNotification = async (notificationId) => {
  return await notificationModel.deleteOne({ _id: notificationId }).lean();
};
const deleteUserNotification = async ({ userId, notificationId }) => {
  return await userNotificationModel
    .deleteOne({ userId, notificationId })
    .lean();
};
module.exports = {
  createNotification,
  getListNotificationByUserIdInDB,
  findUserNotificationInDB,
  markedNotificationInDB,
  deleteNotification,
  deleteUserNotification,
};
