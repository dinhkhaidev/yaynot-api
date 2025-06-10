const { CREATED, OK } = require("../../core/success.response");
const QuestionService = require("../../services/question.service");

class QuestionController {
  createQuestion = async (req, res, next) => {
    new CREATED({
      message: "Create question successful!",
      metadata: await QuestionService.createQuestion({
        ...req.body,
        userId: req.user.user_id,
      }),
    }).send(res);
  };
  updateQuestion = async (req, res, next) => {
    new OK({
      message: "Update question successful!",
      metadata: await QuestionService.updateQuestion({
        ...req.body,
        id: req.params.id,
        userId: req.user.user_id,
      }),
    }).send(res);
  };
  getListQuestion = async (req, res, next) => {
    new OK({
      message: "Get list question successful!",
      metadata: await QuestionService.getListQuestion({
        ...req.query,
        id: req.user.user_id,
      }),
    }).send(res);
  };
  getQuestionById = async (req, res, next) => {
    new OK({
      message: "Get question by id successful!",
      metadata: await QuestionService.getQuestionById(req.params.questionId),
    }).send(res);
  };
  softDeleteQuestion = async (req, res, next) => {
    new OK({
      message: "Soft delete question successful!",
      metadata: await QuestionService.softDeleteQuestion(req.params.questionId),
    }).send(res);
  };
  hardDeleteQuestion = async (req, res, next) => {
    new OK({
      message: "Hard delete question successful!",
      metadata: await QuestionService.hardDeleteQuestion(req.params.questionId),
    }).send(res);
  };
}
module.exports = new QuestionController();
