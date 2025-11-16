//migrate to infra
const socketioInfra = require("../infrastructures/socket/socketio");
// const express = require("express");
// const app = express();
// const { createServer } = require("http");
// const { Server } = require("socket.io");
// const server = createServer(app);
// const io = new Server(server, {
//   cors: "http://localhost:5174/",
// });
module.exports = { io: socketioInfra.io, server: socketioInfra.server };
