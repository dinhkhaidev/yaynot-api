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
router.get("/", asyncHandle(QuestionController.getListQuestion));
router.get("/drafts", asyncHandle(QuestionController.getAllDraftQuestion));
router.get("/:questionId", asyncHandle(QuestionController.getQuestionById));
router.patch(
  "/:questionId",
  checkOwnership({
    model: questionModel,
    param: "params",
    resultId: "questionId",
    ownerField: "userId",
  }),
  asyncHandle(QuestionController.softDeleteQuestion)
);
router.delete(
  "/:questionId",
  checkOwnership({
    model: questionModel,
    param: "params",
    resultId: "questionId",
    ownerField: "userId",
  }),
  asyncHandle(QuestionController.hardDeleteQuestion)
);
router.get(
  "/publish/:questionId",
  asyncHandle(QuestionController.getAllPublishQuestion)
);
router.post(
  "/status/:questionId",
  checkOwnership({
    model: questionModel,
    param: "body",
    resultId: "questionId",
    ownerField: "userId",
  }),
  asyncHandle(QuestionController.changeQuestionStatus)
);
module.exports = router;
