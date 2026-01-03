const {
  buildResultCursorBased,
} = require("../../helpers/buildResultCursorBased");
const { nestedComment, commentLike } = require("../nestedComment.model");

const createCommentInDB = async (payload, options = {}) => {
  return nestedComment.create([{ payload }], options); // Fixed: commentModel → nestedComment
};
const findCommentInDB = async (commentId, options = {}) => {
  return nestedComment.findById(commentId, null, options);
};
const findCommentParentInDB = async (commentParentId, options = {}) => {
  return nestedComment
    .findOne(
      {
        _id: commentParentId,
      },
      null,
      options
    )
    .lean();
};
const updateLeftRightNested = async (questionId, rightValue, options = {}) => {
  await nestedComment.updateMany(
    { questionId: questionId, right: { $gte: rightValue } },
    {
      $inc: { right: 2 },
    },
    options
  );
  await nestedComment.updateMany(
    { questionId: questionId, left: { $gte: rightValue } },
    {
      $inc: { left: 2 },
    },
    options
  );
};
const getListNestedCommentInDB = async (
  questionId,
  leftValue,
  rightValue,
  options = {}
) => {
  const { session } = options;
  //using lazy evaluation
  let query = nestedComment.find({
    questionId: questionId,
    left: { $gte: leftValue },
    right: { $lte: rightValue },
  });

  if (session) {
    query = query.session(session);
  }
  return query.exec();
};
const getListParentNestedCommentInDB = async (questionId, options = {}) => {
  const { session } = options;
  //using lazy evaluation
  let query = nestedComment.find({
    questionId: questionId,
    commentParentId: null,
  });

  if (session) {
    query = query.session(session);
  }
  return query.exec();
};
const updateCommentInDB = async (commentId, data, options = {}) => {
  return nestedComment.updateOne(
    {
      _id: commentId,
    },
    { data },
    options
  );
};
const deleteCommentInDB = async (questionId, left, right, options = {}) => {
  return nestedComment.deleteMany(
    {
      questionId: questionId,
      left: { $gte: left },
      right: { $lte: right },
    },
    options
  );
};
const findCommentLikeByUserCommentId = async (
  { userId, commentId },
  options = {}
) => {
  return commentLike.findOne({ userId, commentId }, null, options).lean();
};
const getListCommentLikeInDB = async (
  cursor,
  commentId,
  sort,
  options = {}
) => {
  const filter = { commentId };
  if (cursor) {
    filter._id = { $lt: cursor };
  }
  const sortBy = sort ? sort : { _id: -1 };
  const limit = 20;
  const { session } = options;
  //using lazy evaluation
  let query = await commentLike
    .find(filter)
    .limit(limit)
    .sort(sortBy)
    .select("userId -_id")
    .lean();

  if (session) {
    query = query.session(session);
  }
  const commentLikeList = await query.exec();
  // return query.exec();
  return buildResultCursorBased(commentLikeList, limit);
};
const likeCommentInDB = async ({ userId, commentId }, options = {}) => {
  const likeData = await nestedComment.updateOne(
    { _id: commentId },
    { $inc: { like: 1 } },
    options
  );
  const commentLikeData = await commentLike.create(
    [{ userId, commentId }],
    options
  );
  return {
    likeData,
    commentLikeData,
  };
};
const unlikeCommentInDB = async ({ userId, commentId }, options = {}) => {
  const unlikeData = await nestedComment.updateOne(
    { _id: commentId },
    { $inc: { like: -1 } },
    options
  );
  const deleteCommentLikeData = await commentLike
    .deleteOne({ userId, commentId }, options)
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
