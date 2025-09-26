const {
  pushNotificationType,
} = require("../../constants/pushNotificationType");
const { NotFoundError } = require("../../core/error.response");
const {
  notificationProducer,
} = require("../../message-queue/rabbitmq/producers/notification.producer");
const {
  findConventionByIdInDB,
} = require("../../models/repositories/chat.repo");
const ChatService = require("../../services/chat.service");
const { createMessage } = require("../../services/chat.service");
const socketAuth = require("../middlewares/socketAuth");
const wrapAsync = require("../middlewares/wrapAsync");

/**
 * @param {import("socket.io").Namespace} io
 */
const chatSocket = (io) => {
  io.use(socketAuth);
  io.on("connection", (socket) => {
    console.log("user connect");
    //fe send userId and receiveId when send message
    socket.on("join_convention", async ({ convoId, userId }, callback) => {
      try {
        const conventionRecord = await findConventionByIdInDB(convoId);
        if (!conventionRecord) {
          return callback({
            success: false,
            message: "Convention does not exist!",
          });
        }
        if (!conventionRecord.participants.includes(userId)) {
          return callback({
            success: false,
            message: "You are not a participant in this conversation!",
          });
        }
        socket.join(convoId);
        return callback({
          success: true,
          message: "Joined successfully",
        });
      } catch (err) {
        console.error("Join convention error:", err.message);
        return callback({
          success: false,
          message: err.message || "Internal error",
        });
      }
    });

    socket.on("send_message", async (data, callback) => {
      try {
        const newMessage = await ChatService.createMessage(data);
        if (!newMessage) {
          return callback({
            success: false,
            message: "Can't create message!",
          });
        }
        io.to(newMessage.convoId).emit("receive_message", newMessage);
        //message queue notification
        const notification = {
          title: "Message",
          content: newMessage.content,
          type: pushNotificationType.MESSAGE,
          senderId: newMessage.senderId,
          //fe data must have receiveId
          receiveId: data.receiveId,
          message: `${newMessage.senderId} đã gửi cho bạn tin nhắn!`,
        };
        // notificationProducer(notification);
        if (callback) {
          callback({
            success: true,
            message: newMessage,
          });
        }
      } catch (err) {
        console.error("Socket send_message error:", err);
        if (callback) {
          callback({
            success: false,
            message: err.message || "Internal Server Error",
          });
        }
      }
    });
    //handle listen user typing,...
    socket.on("disconnect", () => {
      console.log("user disconnect");
    });
  });
};
module.exports = { chatSocket };
