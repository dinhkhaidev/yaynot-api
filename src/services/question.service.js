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
    return await getAllStatusQuestionInDB({
      filter,
      limit,
      sort,
      cursor,
      select,
    });
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
    return await getAllStatusQuestionInDB({
      filter,
      limit,
      sort,
      cursor,
      select,
    });
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
}

module.exports = QuestionService;
