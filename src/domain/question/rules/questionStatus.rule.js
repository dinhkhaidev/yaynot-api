const { BadRequestError } = require("../../../core/error.response");
const statusQuestion = require("../../../constants/statusQuestion");

class QuestionStatusRule {
  static validateStatusTransition(currentStatus, newStatus) {
    if (!Object.values(statusQuestion).includes(newStatus)) {
      throw new BadRequestError(`Invalid status: ${newStatus}`);
    }

    if (currentStatus === newStatus) {
      throw new BadRequestError(
        `No changes applied. Status is already ${newStatus}!`
      );
    }
  }

  static canPublish(question) {
    return (
      question.moderationStatus === "ok" &&
      !question.isDeleted &&
      question.title?.trim().length > 0 &&
      question.content?.trim().length > 0
    );
  }

  static canDraft(question) {
    return !question.isDeleted;
  }

  static canArchive(question) {
    return !question.isDeleted;
  }

  static getAllowedTransitions(currentStatus) {
    const transitions = {
      [statusQuestion.DRAFT]: [statusQuestion.PUBLISH, statusQuestion.ARCHIVE],
      [statusQuestion.PUBLISH]: [statusQuestion.DRAFT, statusQuestion.ARCHIVE],
      [statusQuestion.ARCHIVE]: [statusQuestion.DRAFT, statusQuestion.PUBLISH],
    };

    return transitions[currentStatus] || [];
  }

  static validateCanTransition(question, newStatus) {
    const validationMap = {
      [statusQuestion.PUBLISH]: this.canPublish(question),
      [statusQuestion.DRAFT]: this.canDraft(question),
      [statusQuestion.ARCHIVE]: this.canArchive(question),
    };

    if (!validationMap[newStatus]) {
      throw new BadRequestError(
        `Question cannot be transitioned to ${newStatus} status`
      );
    }
  }
}

module.exports = QuestionStatusRule;
