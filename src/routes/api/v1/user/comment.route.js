const express = require("express");
const router = express.Router();
const NestedCommentController = require("../../../../controllers/nestedComment/index");
const asyncHandle = require("../../../../helpers/asyncHandle");
const { validate } = require("../../../../middlewares/validate");
const { checkOwnership } = require("../../../../middlewares/checkOwnership");
const { nestedComment } = require("../../../../models/nestedComment.model");
const {
  createCommentSchema,
} = require("../../../../validations/Joi/comment.validation");

router.post(
  "/",
  validate(createCommentSchema),
  asyncHandle(NestedCommentController.createComment),
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
  asyncHandle(NestedCommentController.updateComment),
);

router.delete(
  "/",
  checkOwnership({
    model: nestedComment,
    param: "body",
    resultId: "commentId",
    ownerField: "userId",
  }),
  asyncHandle(NestedCommentController.deleteComment),
);

router.post(
  "/:commentId/like",
  asyncHandle(NestedCommentController.likeComment),
);
router.delete(
  "/:commentId/like",
  asyncHandle(NestedCommentController.unlikeComment),
);
router.get(
  "/:commentId/likes",
  asyncHandle(NestedCommentController.getListLikeComment),
);
router.patch(
  "/:commentId/pin",
  asyncHandle(NestedCommentController.pinnedComment),
);
module.exports = router;
