const express = require("express");
const asyncHandle = require("../../helpers/asyncHandle");
const router = express.Router();
const NotificationController = require("../../controllers/notification/index");
const { validate } = require("../../middlewares/validate");
const {
  markAndDeleteNotificationSchema,
  pushNotificationSchema,
} = require("../../validations/Joi/notification.validation");
router.post(
  "/",
  validate(pushNotificationSchema),
  asyncHandle(NotificationController.pushNotification)
); //check rbac (Admin send ALL)
router.get("/", asyncHandle(NotificationController.getListNotification));
router.patch(
  "/marked/:notificationId",
  validate(markAndDeleteNotificationSchema),
  asyncHandle(NotificationController.markedNotification)
);
router.delete(
  "/:notificationId",
  validate(markAndDeleteNotificationSchema),
  asyncHandle(NotificationController.getListNotification)
);
module.exports = router;
