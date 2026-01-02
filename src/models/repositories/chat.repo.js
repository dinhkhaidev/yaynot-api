const {
  buildResultCursorBased,
} = require("../../helpers/buildResultCursorBased");
const conventionModel = require("../convention.model");
const messageModel = require("../message.model");

const createConventionInDB = async (payload) => {
  return conventionModel.create(payload);
};
const findConventionInDB = async (query) => {
  return conventionModel.findOne(query).lean();
};
const findConventionByIdInDB = async (conventionId) => {
  return conventionModel.findById(conventionId).lean();
};
const createMessageInDB = async (payload) => {
  return messageModel.create(payload);
};
const getListConventionsUserInDB = async ({ userId, limit = 10, cursor }) => {
  const query = {
    participants: { $in: userId },
  };
  if (cursor) {
    query._id = { $lt: cursor };
  }
  const conventionList = await conventionModel
    .find(query)
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select("-__v -createdAt -updatedAt")
    .lean();
  return buildResultCursorBased(conventionList, limit);
};
const getConventionMessagesInDB = async ({ convoId, limit = 15, cursor }) => {
  const query = {
    convoId,
  };
  if (cursor) {
    query._id = { $lt: cursor };
  }
  const messageList = await messageModel
    .find(query)
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select("-__v")
    .lean();
  return buildResultCursorBased(messageList, limit);
};
const updateLastMessage = async ({ convoId, content, senderId }) => {
  return conventionModel.findOneAndUpdate(
    { _id: convoId },
    { $set: { lastMessage: { content, senderId, createdAt: Date.now() } } }
  );
};
const deleteMessageInDB = async (messageId) => {
  return messageModel.deleteOne({ _id: messageId });
};
const findMessageInDB = async (messageId) => {
  return messageModel.findById(messageId).lean();
};
const searchMessageInDB = async ({ keyword, convoId, cursor, limit = 20 }) => {
  const query = {
    content: { $regex: keyword },
    convoId,
  };
  if (cursor) {
    query._id = { $lt: cursor };
  }
  const messageList = await messageModel
    .find(query)
    .limit(limit)
    .sort({ createdAt: -1 })
    .select("content senderId")
    .lean();
  return buildResultCursorBased(messageList, limit);
};
module.exports = {
  createConventionInDB,
  findConventionInDB,
  createMessageInDB,
  findConventionByIdInDB,
  getListConventionsUserInDB,
  updateLastMessage,
  getConventionMessagesInDB,
  deleteMessageInDB,
  findMessageInDB,
  searchMessageInDB,
};
