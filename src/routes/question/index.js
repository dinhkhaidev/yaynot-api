const express = require("express");
const router = express.Router();
const QuestionController = require("../../controllers/question/index");
const asyncHandle = require("../../helpers/asyncHandle");
const {
  createQuestionSchema,
  updateQuestionSchema,
} = require("../../validations/Joi/question.validation");
const { validate } = require("../../middlewares/validate");
const { checkOwnership } = require("../../middlewares/checkOwnership");
const questionModel = require("../../models/question.model");
router.post(
  "/",
  validate(createQuestionSchema),
  asyncHandle(QuestionController.createQuestion)
);
router.post(
  "/:id",
  validate(updateQuestionSchema),
  checkOwnership({
    model: questionModel,
    param: "params",
    resultId: "id",
    ownerField: "userId",
  }),
  asyncHandle(QuestionController.updateQuestion)
);
module.exports = router;
