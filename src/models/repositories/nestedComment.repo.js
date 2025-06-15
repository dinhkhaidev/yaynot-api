const { nestedComment } = require("../nestedComment.model");

const createCommentInDB = async (payload) => {
  return await commentModel.create({ payload });
};
const findCommentInDB = async (commentId) => {
  return await nestedComment.findById(commentId);
};
module.exports = {
  createCommentInDB,
};
