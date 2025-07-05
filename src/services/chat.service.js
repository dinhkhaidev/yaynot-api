const { NotFoundError, BadRequestError } = require("../core/error.response");
const {
  createConventionInDB,
  findConventionInDB,
  createMessageInDB,
  findConventionByIdInDB,
  getListConventionsUserInDB,
  updateLastMessage,
  getConventionMessagesInDB,
  deleteMessageInDB,
  findMessageInDB,
} = require("../models/repositories/chat.repo");
const { findUserProfileById } = require("../models/repositories/user.repo");
const { getIdSlice } = require("../utils");

class ChatService {
  static async createConvention({ name, type = "private", participants }) {
    const query = {
      type: type,
      participants: { $all: participants, $size: 2 },
    };
    const chatRecord = await findConventionInDB(query);
    if (chatRecord) throw new BadRequestError("Convention existed!");
    return createConventionInDB({ name, type, participants });
  }
  static async createMessage({
    content,
    attachment,
    convoId,
    senderId,
    receiveId,
  }) {
    const userRecord = await findUserProfileById(receiveId);
    if (!userRecord) throw new BadRequestError("Receive id invalid!");
    if (!convoId) {
      const payload = { type: "private", participants: [senderId, receiveId] };
      const { _id } = await ChatService.createConvention(payload);
      const newMessage = await createMessageInDB({
        content,
        attachment,
        convoId: _id,
        senderId,
      });
      await updateLastMessage({ convoId: _id, content, senderId });
      return newMessage;
    } else {
      const conventionRecord = await findConventionByIdInDB(convoId);
      if (!conventionRecord) throw new NotFoundError("Convention not existed!");
      const newMessage = await createMessageInDB({
        content,
        attachment,
        convoId,
        senderId,
      });
      await updateLastMessage({ convoId, content, senderId });
      return newMessage;
    }
  }
  static async getListConventionsUser({ userId, cursor }) {
    return await getListConventionsUserInDB({ userId, cursor });
  }
  static async getConventionMessages({ convoId, cursor }) {
    const conventionRecord = await findConventionByIdInDB(convoId);
    if (!conventionRecord) throw new NotFoundError("Convention not existed!");
    return await getConventionMessagesInDB({ convoId, cursor });
  }
  static async deleteMessage({ messageId }) {
    const messageRecord = await findMessageInDB(messageId);
    if (!messageRecord) throw new NotFoundError("Message not existed!");
    return await deleteMessageInDB(messageId);
  }
}
module.exports = ChatService;
