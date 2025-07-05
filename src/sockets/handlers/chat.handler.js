const { NotFoundError } = require("../../core/error.response");
const {
  findConventionByIdInDB,
} = require("../../models/repositories/chat.repo");
const wrapAsync = require("../middlewares/wrapAsync");

/**
 * @param {import("socket.io").Namespace} io
 */
const chatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("user connect");
    //fe send userId and receiveId when send message
    socket.on("joinConvention", async ({ convoId, userId }, callback) => {
      try {
        const conventionRecord = await findConventionByIdInDB(convoId);
        console.log("conventionRecord", conventionRecord);
        console.log("convoId", convoId);
        if (!conventionRecord) {
          return callback({
            success: false,
            message: "Convention does not exist!",
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

    socket.on("sendMessage", ({ convoId, userId, receiveId }) => {
      //save dtb, handle conventions
    });

    socket.on("disconnect", () => {
      console.log("user disconnect");
    });
  });
};
module.exports = { chatSocket };
