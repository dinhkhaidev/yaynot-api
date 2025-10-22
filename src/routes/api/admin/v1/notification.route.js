const express = require("express");
const router = express.Router();
const NotificationController = require("../../../../controllers/notification/index");
const asyncHandle = require("../../../../helpers/asyncHandle");
const { validate } = require("../../../../middlewares/validate");
const {
  pushNotificationSchema,
} = require("../../../../validations/Joi/notification.validation");

router.post(
  "/",
  validate(pushNotificationSchema),
  asyncHandle(NotificationController.pushNotification)
);
router.get("/", asyncHandle(NotificationController.getListNotification));

module.exports = router;
