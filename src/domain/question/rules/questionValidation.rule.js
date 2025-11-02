const {
  NotFoundError,
  BadRequestError,
} = require("../../../core/error.response");
const { findUserById } = require("../../../models/repositories/access.repo");
const {
  findQuestionById,
} = require("../../../models/repositories/question.repo");
const { isObjectId } = require("../../../utils/validateType");

class QuestionValidationRule {
  static async validateUser({ userId }) {
    if (!userId) {
      throw new NotFoundError("User ID is required!");
    }

    const userRecord = await findUserById(userId);
    if (!userRecord) {
      throw new NotFoundError("User not found!");
    }

    return userRecord;
  }

  static async validateQuestion({ questionId }) {
    if (!questionId) {
      throw new NotFoundError("Question ID is required!");
    }

    const questionRecord = await findQuestionById(questionId);
    if (!questionRecord) {
      throw new NotFoundError("Question not found!");
    }

    return questionRecord;
  }

  static validateQuestionId(id) {
    if (!id || !isObjectId(id)) {
      throw new BadRequestError("Missing field id or id invalid!");
    }
  }

  static validateUpdatePayload(id, userId) {
    this.validateQuestionId(id);

    if (!userId) {
      throw new NotFoundError("User ID is required!");
    }
  }

  static validateNotDeleted(question) {
    if (question.isDeleted) {
      throw new BadRequestError("Cannot perform action on deleted question");
    }
  }

  static validateOwnership(question, userId) {
    if (question.userId.toString() !== userId.toString()) {
      throw new BadRequestError("You are not the owner of this question");
    }
  }
}

module.exports = QuestionValidationRule;
