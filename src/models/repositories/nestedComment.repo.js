const {
  buildResultCursorBased,
} = require("../../helpers/buildResultCursorBased");
const { nestedComment, commentLike } = require("../nestedComment.model");

const createCommentInDB = async (payload) => {
  return await commentModel.create({ payload });
};
const findCommentInDB = async (commentId) => {
  return await nestedComment.findById(commentId);
};
const findCommentParentInDB = async (commentParentId) => {
  return await nestedComment
    .findOne({
      _id: commentParentId,
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
const updateCommentInDB = async (commentId, data) => {
  return await nestedComment.updateOne(
    {
      _id: commentId,
    },
    { data }
  );
};
const deleteCommentInDB = async (questionId, left, right) => {
  return await nestedComment.deleteMany({
    questionId: questionId,
    left: { $gte: left },
    right: { $lte: right },
  });
};
const findCommentLikeByUserCommentId = async ({ userId, commentId }) => {
  return await commentLike.findOne({ userId, commentId }).lean();
};
const getListCommentLikeInDB = async (cursor, commentId, sort) => {
  const query = { commentId };
  if (cursor) query._id = { $lt: cursor };
  const sortBy = sort ? sort : { _id: -1 };
  const limit = 20;
  const commentLikeList = await commentLike
    .find(query)
    .limit(limit)
    .sort(sortBy)
    .select("userId -_id")
    .lean();
  return buildResultCursorBased(commentLikeList, limit);
};
const likeCommentInDB = async ({ userId, commentId }) => {
  const likeData = await nestedComment.updateOne(
    { _id: commentId },
    { $inc: { like: 1 } }
  );
  const commentLikeData = await commentLike.create({ userId, commentId });
  return {
    likeData,
    commentLikeData,
  };
};
const unlikeCommentInDB = async ({ userId, commentId }) => {
  const unlikeData = await nestedComment.updateOne(
    { _id: commentId },
    { $inc: { like: -1 } }
  );
  const deleteCommentLikeData = await commentLike
    .deleteOne({ userId, commentId })
    .lean();
  return {
    unlikeData,
    deleteCommentLikeData,
  };
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
  findCommentLikeByUserCommentId,
  likeCommentInDB,
  unlikeCommentInDB,
  getListCommentLikeInDB,
};
