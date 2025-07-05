const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const io = new Server(server, {});
const socketConfig = require("./config");
const PORT = 8889;

socketConfig(io);

server.listen(PORT, () => {
  console.log(`Connect success to port ${PORT}`);
});
