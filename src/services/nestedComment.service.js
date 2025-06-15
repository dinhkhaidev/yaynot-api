const { update } = require("lodash");
const { NotFoundError } = require("../core/error.response");
const { findById } = require("../models/question.model");
const {
  createCommentInDB,
} = require("../models/repositories/nestedComment.repo");
const {
  validateFindQuestionById,
} = require("../validations/service/questionService.validate");
const { nestedComment } = require("../models/nestedComment.model");
const nestedCommentModel = require("../models/nestedComment.model");

class CommentService {
  static async createComment({
    commentParentId = null,
    content,
    questionId,
    userId,
  }) {
    const createComment = new nestedCommentModel({
      commentParentId,
      content,
      questionId,
      userId,
    });
    await validateFindQuestionById(questionId);
    let rightValue;
    if (commentParentId) {
      const commentParentRecord = await findById(commentParentId);
      if (!commentParentRecord)
        throw new NotFoundError("Comment parent not found!");
      rightValue = commentParentRecord.right;
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
      createComment.left = rightValue;
      createComment.right = rightValue + 1;
    } else {
      const maxRightComment = await nestedComment.findOne(
        { questionId: questionId },
        "right",
        { sort: { right: -1 } }
      );
      rightValue = maxRightComment.right ? maxRightComment.right + 1 : 1;
      createComment.left = rightValue;
      createComment.right = rightValue + 1;
    }
    await createComment.save();
    return createComment;
  }
}
module.exports = CommentService;
