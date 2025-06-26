const { CREATED, OK } = require("../../core/success.response");
const CommentService = require("../../services/nestedComment.service");

class NestedCommentController {
  createComment = async (req, res, next) => {
    new CREATED({
      message: "Create comment successful!",
      metadata: await CommentService.createComment({
        ...req.body,
        userId: req.user.user_id,
      }),
    }).send(res);
  };
  getListComment = async (req, res, next) => {
    new OK({
      message: "Get list comment successful!",
      metadata: await CommentService.getListComment(req.query),
    }).send(res);
  };
  updateComment = async (req, res, next) => {
    new OK({
      message: "Update comment content successful!",
      metadata: await CommentService.updateComment(req.body),
    }).send(res);
  };
  deleteComment = async (req, res, next) => {
    new OK({
      message: "Delete comment successful!",
      metadata: await CommentService.deleteComment(req.body),
    }).send(res);
  };
  likeComment = async (req, res, next) => {
    new OK({
      message: "Like comment successful!",
      metadata: await CommentService.likeCommentByAction({
        commentId: req.params.commentId,
        action: "like",
        userId: req.user.user_id,
      }),
    }).send(res);
  };
  unlikeComment = async (req, res, next) => {
    new OK({
      message: "Delete comment successful!",
      metadata: await CommentService.likeCommentByAction({
        commentId: req.params.commentId,
        action: "unlike",
        userId: req.user.user_id,
      }),
    }).send(res);
  };
  getListLikeComment = async (req, res, next) => {
    new OK({
      message: "Get list like comment successful!",
      metadata: await CommentService.getListLikeComment({
        ...req.query,
        commentId: req.params.commentId,
      }),
    }).send(res);
  };
}
module.exports = new NestedCommentController();
