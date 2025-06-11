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
} = require("../models/repositories/question.repo");
const {
  validateUpdateQuestionPayload,
  validateIdQuestionPayload,
  validateFindQuestionById,
} = require("../validations/service/questionService.validate");
const { getInfoData } = require("../utils");
const { isObjectId } = require("../utils/validateType");

class QuestionService {
  static createQuestion = async ({ title, content, topicId, userId }) => {
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
  };
  static updateQuestion = async (payload) => {
    const { id, userId } = payload;
    validateUpdateQuestionPayload(id, userId);
    // const [questionRecord, userRecord] = await Promise.all([
    //   findQuestionById(id),
    //   findUserById(userId),
    // ]);
    // if (!questionRecord) throw new NotFoundError("Id question not found!");
    const userRecord = await findUserById(userId);
    if (!userRecord) throw new NotFoundError("User not found!");
    const questionData = await updateQuestionInDB(id, payload);
    return questionData;
  };
  static getListQuestion = async ({
    id,
    sort = "ctime",
    page = 0,
    select = ["userId", "topicId", "isAnonymous", "isDeleted", "__v"],
  }) => {
    const listQuestion = await getListQuestionInDB({
      id,
      sort,
      page,
      select,
    });
    if (!listQuestion) throw new BadRequestError("Can not get list question!");
    return listQuestion;
  };
  static getQuestionById = async (questionId) => {
    validateIdQuestionPayload(questionId);
    const questionRecord = await findQuestionById(questionId);
    if (!questionRecord) throw new NotFoundError("Question not found!");
    return questionRecord;
  };
  static softDeleteQuestion = async (questionId) => {
    validateIdQuestionPayload(questionId);
    await validateFindQuestionById(questionId);
    const deleteQuestion = await softDeleteQuestionInDB(questionId);
    return deleteQuestion;
  };
  static hardDeleteQuestion = async (questionId) => {
    validateIdQuestionPayload(questionId);
    await validateFindQuestionById(questionId);
    const deleteQuestion = await hardDeleteQuestionInDB(questionId);
    return deleteQuestion;
  };
  //get publish or draft, achive list
  static getAllDraftQuestion = async ({
    id,
    sort = "ctime",
    page = 0,
    select = ["userId", "topicId", "isAnonymous", "isDeleted", "__v"],
  }) => {
    validateIdQuestionPayload(id);
    const filter = {
      userId: id,
      status: "draft",
      moderationStatus: "ok",
      isDeleted: false,
    };
    return await getAllDraftQuestionInDB({ filter, sort, page, select });
  };
  static getAllPublishQuestion = async ({
    id,
    sort = "ctime",
    page = 0,
    select = ["userId", "topicId", "isAnonymous", "isDeleted", "__v"],
  }) => {
    validateIdQuestionPayload(id);
    const filter = {
      userId: id,
      status: "publish",
      moderationStatus: "ok",
      isDeleted: false,
    };
    return await getAllPublishQuestionInDB({ filter, sort, page, select });
  };
}
module.exports = QuestionService;
