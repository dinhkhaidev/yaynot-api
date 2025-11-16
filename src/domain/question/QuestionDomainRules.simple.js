const QuestionEntity = require("./entities/question.entity");
const QuestionValidationRule = require("./rules/questionValidation.rule");
const QuestionStatusRule = require("./rules/questionStatus.rule");
const QuestionVisibilityRule = require("./rules/questionVisibility.rule");
const QuestionContent = require("./value-objects/questionContent.value");
const QuestionMetrics = require("./value-objects/questionMetrics.value");

class QuestionDomainService {
  static async validateQuestionCreation(data) {
    await QuestionValidationRule.validateUser({ userId: data.userId });

    const content = new QuestionContent(data.title, data.content);

    if (data.visibility) {
      QuestionVisibilityRule.validateVisibility(data.visibility);
    }

    return { content };
  }

  static async validateQuestionUpdate(questionId, userId, updateData) {
    QuestionValidationRule.validateQuestionId(questionId);

    const questionRecord = await QuestionValidationRule.validateQuestion({
      questionId,
    });

    const questionEntity = QuestionEntity.fromDatabase(questionRecord);

    questionEntity.validateOwnership(userId);

    questionEntity.validateNotDeleted();

    let content = null;
    if (updateData.title || updateData.content) {
      const title = updateData.title || questionEntity.title;
      const contentText = updateData.content || questionEntity.content;
      content = new QuestionContent(title, contentText);
    }

    if (updateData.visibility) {
      questionEntity.validateVisibilityChange(updateData.visibility);
    }

    return { questionEntity, content };
  }

  static async validateStatusChange(questionId, newStatus) {
    QuestionValidationRule.validateQuestionId(questionId);

    const questionRecord = await QuestionValidationRule.validateQuestion({
      questionId,
    });

    const questionEntity = QuestionEntity.fromDatabase(questionRecord);

    questionEntity.validateStatusTransition(newStatus);

    return questionEntity;
  }

  static async validateVisibilityChange(questionId, userId, newVisibility) {
    QuestionValidationRule.validateQuestionId(questionId);

    const questionRecord = await QuestionValidationRule.validateQuestion({
      questionId,
    });

    const questionEntity = QuestionEntity.fromDatabase(questionRecord);

    questionEntity.validateOwnership(userId);

    questionEntity.validateVisibilityChange(newVisibility);

    return questionEntity;
  }

  static async validateQuestionDeletion(questionId, userId) {
    QuestionValidationRule.validateQuestionId(questionId);

    const questionRecord = await QuestionValidationRule.validateQuestion({
      questionId,
    });

    const questionEntity = QuestionEntity.fromDatabase(questionRecord);
    console.log("userId", userId);
    questionEntity.validateOwnership(userId);

    questionEntity.validateNotDeleted();

    return questionEntity;
  }

  static async checkViewPermission(questionId, viewerId, isFollowing = false) {
    QuestionValidationRule.validateQuestionId(questionId);

    const questionRecord = await QuestionValidationRule.validateQuestion({
      questionId,
    });

    const questionEntity = QuestionEntity.fromDatabase(questionRecord);

    const canView = questionEntity.canBeViewedBy(viewerId, isFollowing);

    return { questionEntity, canView };
  }

  static createQuestionEntity(data) {
    return new QuestionEntity(data);
  }

  static createQuestionMetrics(data) {
    return new QuestionMetrics(data);
  }

  static createQuestionContent(title, content) {
    return new QuestionContent(title, content);
  }

  static enrichQuestionWithMetrics(questionData, metricsData) {
    const questionEntity = QuestionEntity.fromDatabase(questionData);
    const metrics = new QuestionMetrics(metricsData);

    return {
      ...questionEntity.toDTO(),
      metrics: metrics.toObject(),
    };
  }
}

module.exports = QuestionDomainService;
