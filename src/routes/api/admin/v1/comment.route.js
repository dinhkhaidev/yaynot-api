const express = require("express");
const router = express.Router();
const NestedCommentController = require("../../../../controllers/nestedComment/index");
const asyncHandle = require("../../../../helpers/asyncHandle");

router.get("/", asyncHandle(NestedCommentController.getListComment));
router.delete("/", asyncHandle(NestedCommentController.deleteComment));
router.get(
  "/:commentId/likes",
  asyncHandle(NestedCommentController.getListLikeComment),
);

module.exports = router;
