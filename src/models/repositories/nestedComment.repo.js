const { nestedComment } = require("../nestedComment.model");

const createCommentInDB = async (payload) => {
  return await commentModel.create({ payload });
};
const findCommentInDB = async (commentId) => {
  return await nestedComment.findById(commentId);
};
const findCommentParentInDB = async (questionId) => {
  return await nestedComment
    .findOne({
      questionId: questionId,
    })
    .lean();
};
const updateLeftRightNested = async (questionId, rightValue) => {
  await nestedComment.updateMany(
    { questionId: questionId, right: { $gte: rightValue } },
    {
      $inc: { right: 2 },
    }
  );
  await nestedComment.updateMany(
    { questionId: questionId, left: { $gte: rightValue } },
    {
      $inc: { left: 2 },
    }
  );
};
const getListNestedCommentInDB = async (questionId, leftValue, rightValue) => {
  return await nestedComment.find({
    questionId: questionId,
    left: { $gte: leftValue },
    right: { $lte: rightValue },
  });
};
const getListParentNestedCommentInDB = async (questionId) => {
  return await nestedComment.find({
    questionId: questionId,
    commentParentId: null,
  });
};
const updateCommentInDB = async (commentId, content) => {
  return await nestedComment.updateOne({
    _id: commentId,
    content: content,
  });
};
const deleteCommentInDB = async (questionId, left, right) => {
  return await nestedComment.deleteMany({
    questionId: questionId,
    left: { $gte: left },
    right: { $lte: right },
  });
};
module.exports = {
  createCommentInDB,
  findCommentInDB,
  deleteCommentInDB,
  findCommentParentInDB,
  updateLeftRightNested,
  getListNestedCommentInDB,
  getListParentNestedCommentInDB,
  updateCommentInDB,
};
