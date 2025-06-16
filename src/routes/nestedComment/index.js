const express = require("express");
const router = express.Router();
const NestedCommentController = require("../../controllers/nestedComment/index");
const asyncHandle = require("../../helpers/asyncHandle");
const { validate } = require("../../middlewares/validate");
const {
  createCommentSchema,
} = require("../../validations/Joi/comment.validation");
const { checkOwnership } = require("../../middlewares/checkOwnership");
const { nestedComment } = require("../../models/nestedComment.model");
router.post(
  "/",
  validate(createCommentSchema),
  asyncHandle(NestedCommentController.createComment)
);
router.get("/", asyncHandle(NestedCommentController.getListComment));
router.patch(
  "/",
  checkOwnership({
    model: nestedComment,
    param: "body",
    resultId: "commentId",
    ownerField: "userId",
  }),
  asyncHandle(NestedCommentController.updateComment)
);
router.delete(
  "/",
  checkOwnership({
    model: nestedComment,
    param: "body",
    resultId: "commentId",
    ownerField: "userId",
  }),
  asyncHandle(NestedCommentController.deleteComment)
);
module.exports = router;
