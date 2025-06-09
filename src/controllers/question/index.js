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
}
module.exports = new QuestionController();
