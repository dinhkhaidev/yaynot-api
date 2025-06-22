const { ForbiddenError } = require("../core/error.response");
const {
  validateFindQuestionById,
} = require("../validations/service/questionService.validate");

const checkPublishedQuestion = (param = "body") => {
  return async (req, res, next) => {
    try {
      const questionId = req[param]?.questionId;
      const { status } = await validateFindQuestionById(questionId, {
        returnRecord: true,
      });
      if (status !== "publish")
        throw new ForbiddenError("Question is not published!");
      next();
    } catch (error) {
      next(error);
    }
  };
};
module.exports = { checkPublishedQuestion };
