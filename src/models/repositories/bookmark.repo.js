const bookmarkModel = require("../bookmark.model");

const createBookmarkInDB = async ({ userId, questionId }) => {
  return bookmarkModel.create({ userId, questionId });
};
const deleteBookmarkInDB = async ({ userId, questionId }) => {
  return bookmarkModel.findOneAndDelete({ userId, questionId });
};
const getListBookmarkInDB = async (userId) => {
  return await bookmarkModel.find({ userId }).populate("questionId").lean();
};
const findBookmarkInDB = async ({ userId, questionId }) => {
  return await bookmarkModel.findOne({ userId, questionId });
};
module.exports = {
  createBookmarkInDB,
  deleteBookmarkInDB,
  getListBookmarkInDB,
  findBookmarkInDB,
};
