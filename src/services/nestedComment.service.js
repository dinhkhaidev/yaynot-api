const { update } = require("lodash");
const {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} = require("../core/error.response");
const { findById } = require("../models/question.model");
const {
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
} = require("../models/repositories/nestedComment.repo");
const {
  validateFindQuestionById,
} = require("../validations/service/questionService.validate");
const { nestedComment } = require("../models/nestedComment.model");
const {
  commentServiceValidate,
} = require("../validations/service/commentService.validate");
const { voteSummaryModel } = require("../models/vote.model");

class CommentService {
  static async createComment({
    commentParentId = null,
    content,
    questionId,
    userId,
  }) {
    const createComment = new nestedComment({
      commentParentId,
      content,
      questionId,
      userId,
    });
    const { status } = await validateFindQuestionById(questionId, {
      returnRecord: true,
    });
    if (status !== "publish")
      throw new ForbiddenError("Can't access to this question!");
    let rightValue;
    if (commentParentId) {
      const commentParentRecord = await findCommentParentInDB(commentParentId);
      if (!commentParentRecord)
        throw new NotFoundError("Comment parent not found!");
      rightValue = commentParentRecord.right;
      await updateLeftRightNested(questionId, rightValue);
      createComment.left = rightValue;
      createComment.right = rightValue + 1;
    } else {
      const maxRightComment = await nestedComment.findOne(
        { questionId: questionId },
        "right",
        { sort: { right: -1 } }
      );
      rightValue = maxRightComment?.right ? maxRightComment.right + 1 : 1;
      createComment.left = rightValue;
      createComment.right = rightValue + 1;
    }
    await createComment.save();
    await voteSummaryModel.findOneAndUpdate(
      { questionId: questionId },
      {
        $inc: {
          commentCount: 1,
        },
      },
      {
        upsert: true,
      }
    );
    return createComment;
  }
  //get all comment and get replies of comment
  static async getListComment({
    questionId,
    commentParentId = null,
    limit = 50,
    page = 0,
  }) {
    await validateFindQuestionById(questionId);
    let rightValue, leftValue;
    if (commentParentId) {
      const commentParentRecord = await findCommentParentInDB(commentParentId);
      leftValue = commentParentRecord.left;
      rightValue = commentParentRecord.right;
      const listComment = await getListNestedCommentInDB(
        questionId,
        leftValue,
        rightValue
      );
      return listComment;
    } else {
      const listComment = await getListParentNestedCommentInDB(questionId);
      return listComment;
    }
  }
  static async updateComment({ questionId, commentId, content }) {
    await validateFindQuestionById(questionId);
    const commentRecord = await findCommentInDB(commentId);
    if (!commentRecord) throw new NotFoundError("Comment not found!");
    if (content === commentRecord.content)
      throw new BadRequestError("Content is existed!");
    return await updateCommentInDB(commentId, { content });
  }
  static async deleteComment({ questionId, commentId }) {
    await validateFindQuestionById(questionId);
    const commentRecord = await findCommentInDB(commentId);
    if (!commentRecord) throw new NotFoundError("Comment not found!");
    const { left, right } = commentRecord;
    const deleteComment = await deleteCommentInDB(questionId, left, right);
    await nestedComment.updateMany(
      { questionId: questionId, right: { $gte: right } },
      {
        $inc: { right: -right },
      }
    );
    await nestedComment.updateMany(
      { questionId: questionId, left: { $gte: right } },
      {
        $inc: { left: -right },
      }
    );
    await voteSummaryModel.findOneAndUpdate(
      { questionId: questionId },
      {
        $inc: {
          commentCount: -1,
        },
      },
      {
        upsert: true,
      }
    );
    return deleteComment;
  }
  static async likeCommentByAction({ commentId, action, userId }) {
    await commentServiceValidate(commentId);
    const commentLikeRecord = await findCommentLikeByUserCommentId({
      userId,
      commentId,
    });
    if (action === "like") {
      if (commentLikeRecord)
        throw new BadRequestError("You already liked this comment!");
      const likeCommentData = await likeCommentInDB({ userId, commentId });
      return likeCommentData;
    }
    if (action === "unlike") {
      if (!commentLikeRecord)
        throw new BadRequestError("You haven't liked this comment yet!");
      const unlikeCommentData = await unlikeCommentInDB({ userId, commentId });
      return unlikeCommentData;
    }
    throw new BadRequestError("Action must be like or unlike!");
  }
  static async getListLikeComment({ cursor, commentId, sort }) {
    await commentServiceValidate(commentId);
    const listCommentLike = await getListCommentLikeInDB(
      cursor,
      commentId,
      sort
    );
    return listCommentLike;
  }
  static async changeStatusPinnedComment({ commentId, status }) {
    await commentServiceValidate(commentId);
    const commentRecord = await findCommentInDB(commentId);
    if (!commentRecord) throw new NotFoundError("Comment not found!");
    if (!status) {
      throw new BadRequestError("Status is required!");
    }
    if (commentRecord.isPinned === status)
      throw new BadRequestError("Status is existed!");
    return await updateCommentInDB(commentId, { isPinned: status });
  }
}
module.exports = CommentService;
