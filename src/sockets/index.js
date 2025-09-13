const socketConfig = require("./config");
const { io, server } = require("../configs/socketio.config");
const PORT = 8889;
require("../databases/mongodb.database");
socketConfig(io);

server.listen(PORT, () => {
  console.log(`Connect success to port ${PORT}`);
});
