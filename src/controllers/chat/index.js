const { OK } = require("../../core/success.response");
const ChatService = require("../../services/chat.service");

class ChatController {
  getListConventionsUser = async (req, res, next) => {
    new OK({
      message: "Get list convention sucessful!",
      metadata: await ChatService.getListConventionsUser({
        userId: req.user.user_id,
        cursor: req.query.cursor,
      }),
    }).send(res);
  };
  getConventionMessages = async (req, res, next) => {
    new OK({
      message: "Get convention messages sucessful!",
      metadata: await ChatService.getConventionMessages({
        ...req.query,
        convoId: req.params.convoId,
        userId: req.user.user_id,
      }),
    }).send(res);
  };
}
module.exports = new ChatController();
