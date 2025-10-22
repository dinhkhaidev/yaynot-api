const express = require("express");
const router = express.Router();
const NotificationController = require("../../../../controllers/notification/index");
const asyncHandle = require("../../../../helpers/asyncHandle");
const { validate } = require("../../../../middlewares/validate");
const {
  markAndDeleteNotificationSchema,
} = require("../../../../validations/Joi/notification.validation");

router.get("/", asyncHandle(NotificationController.getListNotification));
router.patch(
  "/marked/:notificationId",
  validate(markAndDeleteNotificationSchema),
  asyncHandle(NotificationController.markedNotification)
);
router.delete(
  "/:notificationId",
  validate(markAndDeleteNotificationSchema),
  asyncHandle(NotificationController.deleteUserNotification)
);

module.exports = router;
