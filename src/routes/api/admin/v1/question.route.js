const express = require("express");
const router = express.Router();
const QuestionController = require("../../../../controllers/question/index");
const asyncHandle = require("../../../../helpers/asyncHandle");
const { validate } = require("../../../../middlewares/validate");
const {
  visibilitySchema,
} = require("../../../../validations/Joi/question.validation");

router.get("/", asyncHandle(QuestionController.getListQuestion));
router.get("/:questionId", asyncHandle(QuestionController.getQuestionById));
router.patch(
  "/:questionId/soft-delete",
  asyncHandle(QuestionController.softDeleteQuestion),
);
router.delete(
  "/:questionId",
  asyncHandle(QuestionController.hardDeleteQuestion),
);
router.post(
  "/:questionId/status",
  asyncHandle(QuestionController.changeQuestionStatus),
);
router.post(
  "/:questionId/visibility",
  validate(visibilitySchema),
  asyncHandle(QuestionController.changeVisibilityQuestion),
);
router.get(
  "/:questionId/history",
  asyncHandle(QuestionController.getHistoryQuestion),
);

module.exports = router;
