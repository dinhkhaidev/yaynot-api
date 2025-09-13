const { chatSocket } = require("./handlers/chat.handler");
const socketAuth = require("./middlewares/socketAuth");

module.exports = (io) => {
  const chatNameSpace = io.of("/chat");
  const notificationNameSpace = io.of("/notification");
  chatSocket(chatNameSpace);
};
