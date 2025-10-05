const { default: mongoose } = require("mongoose");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { findUserById } = require("../models/repositories/access.repo");
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
} = require("../models/repositories/question.repo");
const {
  validateUpdateQuestionPayload,
  validateIdQuestionPayload,
  validateFindQuestionById,
} = require("../validations/service/questionService.validate");
const { getInfoData } = require("../utils");
const { isObjectId } = require("../utils/validateType");
const statusQuestion = require("../constants/statusQuestion");
const TagService = require("./tag.service");
const {
  keyFlushViewQuestion,
  keyViewQuestion,
} = require("../utils/cacheRedis");
const { get, setnx, incr } = require("../models/repositories/cache.repo");
const statusMapping = {
  private: "archive",
  public: "publish",
};
class QuestionService {
  static async createQuestion({ title, content, topicId, userId, tags }) {
    if (!userId) throw new NotFoundError("User ID is required!");
    const userRecord = await findUserById(userId);
    if (!userRecord) throw new NotFoundError("User not found!");
    const newQuestion = await createQuestionInDB({
      title,
      content,
      topicId,
      userId,
      shortTag: tags,
    });
    if (!newQuestion) throw new BadRequestError("Can't create question!");
    if (tags && Array.isArray(tags)) {
      await Promise.all(
        tags.map(async (tag) => {
          await TagService.upsertTag({
            name: tag.trim().toLowerCase(),
            questionId: newQuestion._id,
          });
        })
      );
    }
    return newQuestion;
  }

  static async updateQuestion(payload) {
    const { id, userId } = payload;
    validateUpdateQuestionPayload(id, userId);
    const userRecord = await findUserById(userId);
    if (!userRecord) throw new NotFoundError("User not found!");
    const questionData = await updateQuestionInDB(id, payload);
    return questionData;
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
    if (!listQuestion) throw new BadRequestError("Can not get list question!");
    //enrich data from view redis
    if (listQuestion.data && Array.isArray(listQuestion.data)) {
      listQuestion.data = await this.enrichQuestionsWithViewCount(
        listQuestion.data
      );
    }
    return listQuestion;
  }

  static async getQuestionById(questionId) {
    validateIdQuestionPayload(questionId);
    const questionRecord = await findQuestionById(questionId);
    if (!questionRecord) throw new NotFoundError("Question not found!");
    //enrich data from view redis
    return await this.enrichQuestionsWithViewCount(questionRecord);
  }

  static async softDeleteQuestion(questionId) {
    validateIdQuestionPayload(questionId);
    await validateFindQuestionById(questionId);
    const deleteQuestion = await softDeleteQuestionInDB(questionId);
    return deleteQuestion;
  }

  static async hardDeleteQuestion(questionId) {
    validateIdQuestionPayload(questionId);
    await validateFindQuestionById(questionId);
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
    validateIdQuestionPayload(id);
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
      result.data = await this.enrichQuestionsWithViewCount(result.data);
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
    validateIdQuestionPayload(id);
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
      result.data = await this.enrichQuestionsWithViewCount(result.data);
    }
    return result;
  }

  static async changeQuestionStatusFactory({ resource, payload }) {
    const { questionId, newStatus } = payload;
    if (resource && resource.status === newStatus)
      throw new BadRequestError(
        `No changes applied. Visibility is already ${newStatus}!`
      );
    if (!Object.values(statusQuestion).includes(newStatus))
      throw new NotFoundError(`Type question ${newStatus} not exist!`);

    const questionStatusMap = {
      publish: QuestionService.publishQuestionStatus,
      draft: QuestionService.draftQuestionStatus,
      archive: QuestionService.archiveStatus,
    };
    const handle = questionStatusMap[newStatus];
    if (!handle) throw new BadRequestError("Incorrect status question!");
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
  static async changeVisibilityQuestion({ resource, payload }) {
    const { questionId, visibility } = payload;
    if (resource.status === "draft") {
      throw new BadRequestError(
        "You must publish this question before changing visibility."
      );
    }
    if (resource.visibility === visibility)
      throw new BadRequestError(
        `No changes applied. Visibility is already ${visibility}!`
      );

    if (visibility === "private") {
      await this.changeQuestionStatusFactory({
        resource,
        payload: { questionId, newStatus: statusMapping.private },
      });
      return await changeVisibilityQuestionInDB(questionId, visibility);
    } else if (resource.status === "archive") {
      await this.changeQuestionStatusFactory({
        resource,
        payload: { questionId, newStatus: statusMapping.public },
      });
    }
    return await changeVisibilityQuestionInDB(questionId, visibility);
  }
  static async countViewQuestion({ questionId }) {
    const foundQuestion = await validateFindQuestionById(questionId, {
      returnRecord: true,
    });
    if (
      foundQuestion.status === "draft" ||
      foundQuestion.visibility === "private" ||
      foundQuestion.moderationStatus === "ban" ||
      foundQuestion.isDeleted
    ) {
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
    if (!questions) return questions;
    const isArray = Array.isArray(questions);
    const questionArray = isArray ? questions : [questions];
    const enrichedQuestions = await Promise.all(
      questionArray.map(async (question) => {
        if (!question) return question;
        const questionObj = question.toObject ? question.toObject() : question;
        const viewCount = await this.getViewCount(
          questionObj._id.toString(),
          questionObj.view || 0
        );
        return {
          ...questionObj,
          view: viewCount,
        };
      })
    );
    return isArray ? enrichedQuestions : enrichedQuestions[0];
  }
}

module.exports = QuestionService;
