const { NotFoundError } = require("../../core/error.response");
const { nestedComment } = require("../../models/nestedComment.model");

const commentServiceValidate = async (
  commentId,
  options = { returnRecord: false },
) => {
  const commentRecord = await nestedComment.findById(commentId);
  if (!commentRecord) {throw new NotFoundError("Comment not found!");}
  if (options.returnRecord) {
    return commentRecord;
  }
};
module.exports = { commentServiceValidate };
