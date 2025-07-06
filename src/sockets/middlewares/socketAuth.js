const { decodeToken } = require("../../auth/authUtil");

const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    //fe handle publickey, maybe save on file local and transfer from db
    const publicKey = socket.handshake.auth.publicKey;
    const payload = decodeToken(token, publicKey);
    if (!payload)
      //   return next(new Error("Access token expired or invalid!"));
      return next(new Error("Unauthorized"));
    console.log("Socket JWT success!");
    socket.user = payload;
    next();
  } catch (error) {
    next(new Error("Unauthorized"));
  }
};
module.exports = socketAuth;
