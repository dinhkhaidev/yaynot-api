const { chatSocket } = require("./handlers/chat.handler");

module.exports = (io) => {
  const chatNameSpace = io.of("/chat");
  chatSocket(chatNameSpace);
};
