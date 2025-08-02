const Joi = require("joi");
const {
  pushNotificationType,
} = require("../../constants/pushNotificationType");
const pushNotificationSchema = Joi.object({
  title: Joi.string().min(2).max(150).required(),
  content: Joi.string().max(300).required(),
  type: Joi.string()
    .valid(...Object.values(pushNotificationType))
    .required(),
  title: Joi.string().min(2).max(150).required(),
});
const markAndDeleteNotificationSchema = Joi.object({
  notificationId: Joi.string().hex().length(24).required(),
});
module.exports = {
  pushNotificationSchema,
  markAndDeleteNotificationSchema,
};
