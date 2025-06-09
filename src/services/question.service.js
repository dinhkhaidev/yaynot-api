const { default: mongoose } = require("mongoose");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { findUserById } = require("../models/repositories/access.repo");
const {
  createQuestionInDB,
  findQuestionById,
  updateQuestionInDB,
} = require("../models/repositories/question.repo");
const validateUpdateQuestionPayload = require("../validations/service/questionService.validate");

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
    const questionData = await updateQuestionInDB(payload);
    return questionData;
  };
}
module.exports = QuestionService;
