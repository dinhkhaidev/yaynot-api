const {
  careQuestionInDB,
  unCareQuestionInDB,
  getListCareQuestionByUserInDB,
} = require("../../../models/repositories/question.repo");
const {
  validateFindQuestionById,
} = require("../../../validations/service/questionService.validate");

class CareQuestionService {
  static async careQuestion({ userId, questionId }) {
    await validateFindQuestionById(questionId);
    return await careQuestionInDB({ userId, questionId });
  }
  static async uncareQuestion({ userId, questionId }) {
    await validateFindQuestionById(questionId);
    return await unCareQuestionInDB({ userId, questionId });
  }
  static async getListCareQuestionByUser({ userId, limit, cursor, sort }) {
    return await getListCareQuestionByUserInDB({ userId, limit, cursor, sort });
  }
}
module.exports = CareQuestionService;
