const { chatSocket } = require("./handlers/chat.handler");
const socketAuth = require("./middlewares/socketAuth");

module.exports = (io) => {
  const chatNameSpace = io.of("/chat");
  chatSocket(chatNameSpace);
};
