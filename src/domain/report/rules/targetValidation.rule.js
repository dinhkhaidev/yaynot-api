const {
  NotFoundError,
  BadRequestError,
} = require("../../../core/error.response");
const Question = require("../../../models/question.model");
const { nestedComment } = require("../../../models/nestedComment.model");
const targetType = require("../../../constants/targetType");

class TargetValidationRule {
  static async validateAndGetTarget(type, targetId) {
    if (!Object.values(targetType).includes(type)) {
      throw new BadRequestError(`Invalid target type: ${type}`);
    }

    const validators = {
      [targetType.QUESTION]: this._validateQuestion.bind(this),
      [targetType.COMMENT]: this._validateComment.bind(this),
    };

    const validator = validators[type];
    if (!validator) {
      throw new BadRequestError(`Unsupported target type: ${type}`);
    }

    return await validator(targetId);
  }

  static async _validateQuestion(targetId) {
    const question = await Question.findById(targetId).lean();

    if (!question) {
      throw new NotFoundError("Question not found");
    }

    if (question.isDeleted) {
      throw new BadRequestError("Cannot report a deleted question");
    }

    return question;
  }

  static async _validateComment(targetId) {
    const comment = await nestedComment.findById(targetId).lean();

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    return comment;
  }

  static async getTargetContent(type, targetId) {
    const contentGetters = {
      [targetType.QUESTION]: this._getQuestionContent.bind(this),
      [targetType.COMMENT]: this._getCommentContent.bind(this),
    };

    const getter = contentGetters[type];
    return getter ? await getter(targetId) : null;
  }

  static async _getQuestionContent(targetId) {
    return await Question.findById(targetId)
      .select("title content image status visibility userId createdAt")
      .populate("userId", "username avatar")
      .lean();
  }

  static async _getCommentContent(targetId) {
    return await nestedComment
      .findById(targetId)
      .select("content questionId userId createdAt")
      .populate("userId", "username avatar")
      .populate("questionId", "title")
      .lean();
  }
}

module.exports = TargetValidationRule;
