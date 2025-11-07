const { default: mongoose } = require("mongoose");
const { BadRequestError, NotFoundError } = require("../../core/error.response");
const { findUserById } = require("../../models/repositories/access.repo");
const {
  createQuestionInDB,
  findQuestionById,
  updateQuestionInDB,
  getListQuestionInDB,
  softDeleteQuestionInDB,
  hardDeleteQuestionInDB,
  getAllDraftQuestionInDB,
  getAllPublishQuestionInDB,
  changeQuestionStatus,
  publishForQuestionInDB,
  draftForQuestionInDB,
  archiveForQuestionInDB,
  getAllStatusQuestionInDB,
  changeVisibilityQuestionInDB,
} = require("../../models/repositories/question.repo");
const {
  validateUpdateQuestionPayload,
  validateIdQuestionPayload,
  validateFindQuestionById,
} = require("../../validations/service/questionService.validate");
const { getInfoData } = require("../../utils");
const { isObjectId } = require("../../utils/validateType");
const statusQuestion = require("../../constants/statusQuestion");
const TagService = require("../tag.service");
const {
  keyFlushViewQuestion,
  keyViewQuestion,
  keyShareQuestion,
  keyFlushShareQuestion,
} = require("../../utils/cacheRedis");
const { get, setnx, incr } = require("../../models/repositories/cache.repo");
const HistoryQuestionService = require("./extensions/history.service");

const {
  QuestionEntity,
  QuestionValidationRule,
  QuestionStatusRule,
  QuestionVisibilityRule,
  QuestionContent,
  QuestionMetrics,
} = require("../../domain/question");
const QuestionDomainService = require("../../domain/question/QuestionDomainRules.simple");

const statusMapping = {
  private: "archive",
  public: "publish",
};
class QuestionService {
  static async createQuestion({ title, content, topicId, userId, tags }) {
    const { content: validatedContent } =
      await QuestionDomainService.validateQuestionCreation({
        title,
        content,
        userId,
      });

    const questionEntity = QuestionEntity.createNew({
      title: validatedContent.title,
      content: validatedContent.content,
      topicId,
      userId,
      shortTag: tags,
    });

    const newQuestion = await createQuestionInDB(questionEntity.toDatabase());
    if (!newQuestion) {throw new BadRequestError("Can't create question!");}

    if (tags && Array.isArray(tags)) {
      await Promise.all(
        tags.map(async (tag) => {
          await TagService.upsertTag({
            name: tag.trim().toLowerCase(),
            questionId: newQuestion._id,
          });
        }),
      );
    }

    return QuestionEntity.fromDatabase(newQuestion).toDTO();
  }

  static async updateQuestion(payload) {
    const { id, userId } = payload;

    const { questionEntity, content } =
      await QuestionDomainService.validateQuestionUpdate(id, userId, payload);

    const oldData = {
      title: questionEntity.title,
      content: questionEntity.content,
      topicId: questionEntity.topicId,
      shortTag: questionEntity.shortTag,
    };

    const updateData = {
      ...payload,
      ...(content && { title: content.title, content: content.content }),
    };

    const questionData = await updateQuestionInDB(id, updateData);

    await HistoryQuestionService.upsertHistoryQuestion({
      questionId: id,
      userId,
      metadata: oldData,
    });

    return QuestionEntity.fromDatabase(questionData).toDTO();
  }

  static async getListQuestion({
    id,
    sort,
    limit = 10,
    cursor,
    select = ["userId", "isAnonymous", "isDeleted", "__v"],
  }) {
    const listQuestion = await getListQuestionInDB({
      id,
      sort,
      limit,
      cursor,
      select,
    });
    if (!listQuestion) {throw new BadRequestError("Can not get list question!");}
    //enrich data from view redis
    if (listQuestion.data && Array.isArray(listQuestion.data)) {
      listQuestion.data = await this.enrichQuestionsWithViewCount(
        listQuestion.data,
      );
    }
    return listQuestion;
  }

  static async getQuestionById(questionId) {
    const questionRecord = await QuestionValidationRule.validateQuestion({
      questionId,
    });

    const questionEntity = QuestionEntity.fromDatabase(questionRecord);

    return await this.enrichQuestionsWithViewCount(questionEntity.toDTO());
  }

  static async softDeleteQuestion(questionId, userId) {
    const questionEntity = await QuestionDomainService.validateQuestionDeletion(
      questionId,
      userId,
    );

    questionEntity.softDelete();
    const deleteQuestion = await softDeleteQuestionInDB(questionId);

    return QuestionEntity.fromDatabase(deleteQuestion).toDTO();
  }

  static async hardDeleteQuestion(questionId, userId) {
    await QuestionDomainService.validateQuestionDeletion(questionId, userId);

    const deleteQuestion = await hardDeleteQuestionInDB(questionId);
    return deleteQuestion;
  }

  static async getAllDraftQuestion({
    id,
    sort,
    limit = 10,
    cursor,
    select = ["userId", "topicId", "isAnonymous", "isDeleted", "__v"],
  }) {
    QuestionValidationRule.validateQuestionId(id);

    const filter = {
      userId: id,
      status: "draft",
      moderationStatus: "ok",
      isDeleted: false,
    };
    const result = await getAllStatusQuestionInDB({
      filter,
      limit,
      sort,
      cursor,
      select,
    });

    if (result.data && Array.isArray(result.data)) {
      const entities = QuestionEntity.fromDatabaseArray(result.data);
      const dtos = entities.map((entity) => entity.toDTO());
      result.data = await this.enrichQuestionsWithViewCount(dtos);
    }
    return result;
  }

  static async getAllPublishQuestion({
    id,
    sort,
    limit = 10,
    cursor,
    select = ["userId", "topicId", "isAnonymous", "isDeleted", "__v"],
  }) {
    QuestionValidationRule.validateQuestionId(id);

    const filter = {
      userId: id,
      status: "publish",
      moderationStatus: "ok",
      isDeleted: false,
    };
    const result = await getAllStatusQuestionInDB({
      filter,
      limit,
      sort,
      cursor,
      select,
    });

    if (result.data && Array.isArray(result.data)) {
      const entities = QuestionEntity.fromDatabaseArray(result.data);
      const dtos = entities.map((entity) => entity.toDTO());
      result.data = await this.enrichQuestionsWithViewCount(dtos);
    }
    return result;
  }

  static async changeQuestionStatusFactory({ resource, payload }) {
    const { questionId, newStatus } = payload;

    const questionEntity = await QuestionDomainService.validateStatusChange(
      questionId,
      newStatus,
    );

    const questionStatusMap = {
      publish: QuestionService.publishQuestionStatus,
      draft: QuestionService.draftQuestionStatus,
      archive: QuestionService.archiveStatus,
    };
    const handle = questionStatusMap[newStatus];
    if (!handle) {throw new BadRequestError("Incorrect status question!");}

    return await handle(questionId);
  }

  static async publishQuestionStatus(questionId) {
    //handle publish tag when public question
    await TagService.publicTagStatus({ questionId, type: true });
    return await publishForQuestionInDB(questionId);
  }

  static async draftQuestionStatus(questionId) {
    await TagService.publicTagStatus({ questionId, type: false });
    return await draftForQuestionInDB(questionId);
  }

  static async archiveStatus(questionId) {
    await TagService.publicTagStatus({ questionId, type: false });
    return await archiveForQuestionInDB(questionId);
  }
  static async changeVisibilityQuestion({ resource, payload, userId }) {
    const { questionId, visibility } = payload;

    const questionEntity = await QuestionDomainService.validateVisibilityChange(
      questionId,
      userId,
      visibility,
    );

    if (questionEntity.isDraft()) {
      throw new BadRequestError(
        "You must publish this question before changing visibility.",
      );
    }

    if (visibility === "private") {
      await this.changeQuestionStatusFactory({
        resource,
        payload: { questionId, newStatus: statusMapping.private },
      });
      return await changeVisibilityQuestionInDB(questionId, visibility);
    } else if (questionEntity.isArchived()) {
      await this.changeQuestionStatusFactory({
        resource,
        payload: { questionId, newStatus: statusMapping.public },
      });
    }

    const result = await changeVisibilityQuestionInDB(questionId, visibility);
    return QuestionEntity.fromDatabase(result).toDTO();
  }
  static async countViewQuestion({ questionId }) {
    const questionRecord = await QuestionValidationRule.validateQuestion({
      questionId,
    });

    const questionEntity = QuestionEntity.fromDatabase(questionRecord);

    if (!questionEntity.isActive()) {
      throw new BadRequestError("Question not valid!");
    }

    const keyQuestion = keyViewQuestion(questionId);
    const keyFlush = keyFlushViewQuestion(questionId);
    const cached = await get(keyQuestion);

    if (!cached) {
      const questionFound = await findQuestionById(questionId);
      await setnx(keyQuestion, questionFound.view, 1800);
      await setnx(keyFlush, questionFound.view, 3600);
    }

    const newCount = await incr(keyQuestion);
    return newCount;
  }
  static async countShareQuestion({ questionId }) {
    const questionRecord = await QuestionValidationRule.validateQuestion({
      questionId,
    });

    const questionEntity = QuestionEntity.fromDatabase(questionRecord);

    if (!questionEntity.isActive()) {
      throw new BadRequestError("Question not valid!");
    }

    const keyQuestion = keyShareQuestion(questionId);
    const keyFlush = keyFlushShareQuestion(questionId);
    const cached = await get(keyQuestion);

    if (!cached) {
      const questionFound = await findQuestionById(questionId);
      await setnx(keyQuestion, questionFound.shareCount, 1800);
      await setnx(keyFlush, questionFound.shareCount, 3600);
    }

    const newCount = await incr(keyQuestion);
    return newCount;
  }

  /**
   * Get view count from redis, fallback to db if not cached
   * @param {string} questionId - the question ID
   * @param {number} dbViewCount - (fallback)
   * @returns {Promise<number>} the view count
   */
  static async getViewCount(questionId, dbViewCount = 0) {
    try {
      const keyQuestion = keyViewQuestion(questionId);
      const cachedView = await get(keyQuestion);
      if (cachedView !== null && cachedView !== undefined) {
        return parseInt(cachedView, 10);
      }
      if (dbViewCount > 0) {
        await setnx(keyQuestion, dbViewCount, 1800);
      }
      return dbViewCount;
    } catch (error) {
      return dbViewCount;
    }
  }
  /**
   * Enrich question view count from redis
   * @param {Object|Array} questions - single question or array of questions
   * @returns {Promise<Object|Array>} question with updated view count
   */
  static async enrichQuestionsWithViewCount(questions) {
    if (!questions) {return questions;}
    const isArray = Array.isArray(questions);
    const questionArray = isArray ? questions : [questions];

    const enrichedQuestions = await Promise.all(
      questionArray.map(async (question) => {
        if (!question) {return question;}
        const questionObj = question.toObject ? question.toObject() : question;
        const viewCount = await this.getViewCount(
          questionObj._id?.toString() || questionObj.id?.toString(),
          questionObj.view || questionObj.viewCount || 0,
        );
        return {
          ...questionObj,
          view: viewCount,
          viewCount: viewCount,
        };
      }),
    );

    return isArray ? enrichedQuestions : enrichedQuestions[0];
  }
}

module.exports = QuestionService;
