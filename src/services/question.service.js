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
} = require("../models/repositories/question.repo");
const {
  validateUpdateQuestionPayload,
  validateIdQuestionPayload,
  validateFindQuestionById,
} = require("../validations/service/questionService.validate");
const { getInfoData } = require("../utils");
const { isObjectId } = require("../utils/validateType");
const statusQuestion = require("../constants/statusQuestion");

class QuestionService {
  static async createQuestion({ title, content, topicId, userId }) {
    if (!userId) throw new NotFoundError("User ID is required!");
    const userRecord = await findUserById(userId);
    if (!userRecord) throw new NotFoundError("User not found!");
    const newQuestion = await createQuestionInDB({
      title,
      content,
      topicId,
      userId,
    });
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
    sort = "ctime",
    page = 0,
    select = ["userId", "topicId", "isAnonymous", "isDeleted", "__v"],
  }) {
    const listQuestion = await getListQuestionInDB({
      id,
      sort,
      page,
      select,
    });
    if (!listQuestion) throw new BadRequestError("Can not get list question!");
    return listQuestion;
  }

  static async getQuestionById(questionId) {
    validateIdQuestionPayload(questionId);
    const questionRecord = await findQuestionById(questionId);
    if (!questionRecord) throw new NotFoundError("Question not found!");
    return questionRecord;
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
    sort = "ctime",
    page = 0,
    select = ["userId", "topicId", "isAnonymous", "isDeleted", "__v"],
  }) {
    validateIdQuestionPayload(id);
    const filter = {
      userId: id,
      status: "draft",
      moderationStatus: "ok",
      isDeleted: false,
    };
    return await getAllDraftQuestionInDB({ filter, sort, page, select });
  }

  static async getAllPublishQuestion({
    id,
    sort = "ctime",
    page = 0,
    select = ["userId", "topicId", "isAnonymous", "isDeleted", "__v"],
  }) {
    validateIdQuestionPayload(id);
    const filter = {
      userId: id,
      status: "publish",
      moderationStatus: "ok",
      isDeleted: false,
    };
    return await getAllPublishQuestionInDB({ filter, sort, page, select });
  }

  static async changeQuestionStatusFactory({ resource, payload }) {
    const { questionId, newStatus } = payload;
    if (resource && resource.status === newStatus)
      throw new BadRequestError(
        `Don't any change because status is ${newStatus}!`
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
    return await publishForQuestionInDB(questionId);
  }

  static async draftQuestionStatus(questionId) {
    return await draftForQuestionInDB(questionId);
  }

  static async archiveStatus(questionId) {
    return await archiveForQuestionInDB(questionId);
  }
}

module.exports = QuestionService;
