const { OK } = require("../../core/success.response");
const NotificationService = require("../../services/notification.service");

class NotificationController {
  pushNotification = async (req, res, next) => {
    new OK({
      message: "Push notification successful!",
      metadata: await NotificationService.pushNotificationFactory({
        ...req.body,
        senderId: req.user.user_id,
      }),
    }).send(res);
  };
  getListNotification = async (req, res, next) => {
    new OK({
      message: "Get list notification successful!",
      metadata: await NotificationService.getListNotification({
        userId: req.user.user_id,
        cursor: req.query.cursor,
      }),
    }).send(res);
  };
  markedNotification = async (req, res, next) => {
    new OK({
      message: "Marked notification successful!",
      metadata: await NotificationService.markedNotification({
        userId: req.user.user_id,
        notificationId: req.params.notificationId,
      }),
    }).send(res);
  };
  deleteUserNotification = async (req, res, next) => {
    new OK({
      message: "Delete notification successful!",
      metadata: await NotificationService.deleteNotification({
        userId: req.user.user_id,
        notificationId: req.params.notificationId,
      }),
    }).send(res);
  };
}
module.exports = new NotificationController();
