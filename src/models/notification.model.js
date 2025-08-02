const mongoose = require("mongoose");
const DOCUMENT_NAME = "notification";
const COLLECTION_NAME = "notifications";
const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["ALL", "QUESTION001", "MESSAGE"],
      default: "QUESTION001",
    },
    senderId: { type: mongoose.Types.ObjectId, required: true },
    options: { type: Object, default: {} },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);
const userNotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, required: true },
    notificationId: { type: mongoose.Types.ObjectId, required: true },
    isRead: { type: Boolean, default: false },
  },
  {
    collection: "user_notifications",
    timestamps: true,
  }
);
userNotificationSchema.index({ userId: 1 });
userNotificationSchema.index({ notificationId: 1, userId: 1 });
module.exports = {
  notificationModel: mongoose.model(DOCUMENT_NAME, notificationSchema),
  userNotificationModel: mongoose.model(
    "userNotification",
    userNotificationSchema
  ),
};
