const { OK } = require("../../core/success.response");
const NotificationService = require("../../services/notification.service");

class NotificationController {
  pushNotification = async (req, res, next) => {
    new OK({
      message: "Push notification successful!",
      metadata: await NotificationService.pushNotificationFactory({}),
    }).send(res);
  };
  getListNotification = async (req, res, next) => {
    new OK({
      message: "Get list notification successful!",
      metadata: await NotificationService.getListNotification({}),
    }).send(res);
  };
  markedNotification = async (req, res, next) => {
    new OK({
      message: "Marked notification successful!",
      metadata: await NotificationService.markedNotification({}),
    }).send(res);
  };
  deleteUserNotification = async (req, res, next) => {
    new OK({
      message: "Delete notification successful!",
      metadata: await NotificationService.deleteNotification({}),
    }).send(res);
  };
}
