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
});
const markAndDeleteNotificationSchema = Joi.object({
  notificationId: Joi.string().hex().length(24).required(),
});
//notification message queue
const notificationMQSchema = Joi.object({
  title: Joi.string().min(2).max(150).required(),
  content: Joi.string().max(300).required(),
  type: Joi.string()
    .valid(...Object.values(pushNotificationType))
    .required(),
  senderId: Joi.string().hex().length(24).required(),
  receiveId: Joi.string().hex().length(24).required(),
  message: Joi.string().min(5).max(200).required(),
});
module.exports = {
  pushNotificationSchema,
  notificationMQSchema,
  markAndDeleteNotificationSchema,
};
