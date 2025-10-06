const express = require("express");
const router = express.Router();
const QuestionController = require("../../controllers/question/index");
const asyncHandle = require("../../helpers/asyncHandle");
const {
  createQuestionSchema,
  updateQuestionSchema,
  visibilitySchema,
} = require("../../validations/Joi/question.validation");
const { validate } = require("../../middlewares/validate");
const { checkOwnership } = require("../../middlewares/checkOwnership");
const questionModel = require("../../models/question.model");
const { bookmarkSchema } = require("../../validations/Joi/bookmark.validation");
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
    param: "params",
    resultId: "questionId",
    ownerField: "userId",
  }),
  asyncHandle(QuestionController.changeQuestionStatus)
);
router.post(
  "/visibility/:questionId",
  validate(visibilitySchema),
  checkOwnership({
    model: questionModel,
    param: "params",
    resultId: "questionId",
    ownerField: "userId",
  }),
  asyncHandle(QuestionController.changeVisibilityQuestion)
);
router.post(
  "/:questionId/bookmark",
  validate(bookmarkSchema, "params"),
  asyncHandle(QuestionController.bookmarkQuestion)
);
router.delete(
  "/:questionId/bookmark",
  validate(bookmarkSchema, "params"),
  asyncHandle(QuestionController.unbookmarkQuestion)
);
router.get("/me/bookmarks", asyncHandle(QuestionController.getListBookmark));
router.post(
  "/:questionId/view",
  asyncHandle(QuestionController.countViewQuestion)
);
//care question
router.post("/:questionId/care", asyncHandle(QuestionController.careQuestion));
router.delete(
  "/:questionId/uncare",
  asyncHandle(QuestionController.uncareQuestion)
);
router.get(
  "/me/care-questions",
  asyncHandle(QuestionController.getListCareQuestionByUser)
);
module.exports = router;
