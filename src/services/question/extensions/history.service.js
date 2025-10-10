const {
  findHistoryQuestionByQuestionId,
  createHistoryQuestionInDB,
} = require("../../../models/repositories/question.repo");
const {
  validateFindQuestionById,
} = require("../../../validations/service/questionService.validate");

class HistoryQuestionService {
  static async upsertHistoryQuestion({ questionId, userId, metadata }) {
    await validateFindQuestionById(questionId);
    const historyRecord = await findHistoryQuestionByQuestionId(questionId);
    if (!historyRecord.length) {
      await createHistoryQuestionInDB({
        questionId,
        userId,
        metadata,
        version: 1,
      });
    } else {
      await createHistoryQuestionInDB({
        questionId,
        userId,
        metadata,
        version: historyRecord[historyRecord.length - 1].version + 1,
      });
    }
  }
  static async getHistoryQuestion({ questionId }) {
    await validateFindQuestionById(questionId);
    const historyRecord = await findHistoryQuestionByQuestionId(questionId);
    if (!historyRecord) {
      return null;
    }
    return historyRecord;
  }
}
module.exports = HistoryQuestionService;
