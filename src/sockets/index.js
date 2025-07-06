const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: "http://localhost:8888/",
});
const socketConfig = require("./config");
const PORT = 8889;
require("../databases/mongodb.database");
socketConfig(io);

server.listen(PORT, () => {
  console.log(`Connect success to port ${PORT}`);
});
