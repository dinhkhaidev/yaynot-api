const { ForbiddenError } = require("../core/error.response");
const QuestionValidationRule = require("../domain/question/rules/questionValidation.rule");
const {
  validateFindQuestionById,
} = require("../validations/service/questionService.validate");

const checkPublishedQuestion = (param = "body") => {
  return async (req, res, next) => {
    try {
      const questionId = req[param]?.questionId;
      const { status } = await QuestionValidationRule.validateQuestion({
        questionId,
      });
      if (status !== "publish")
      {throw new ForbiddenError("Question is not published!");}
      next();
    } catch (error) {
      next(error);
    }
  };
};
module.exports = { checkPublishedQuestion };
