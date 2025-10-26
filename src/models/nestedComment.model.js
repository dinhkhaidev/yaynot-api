const mongoose = require("mongoose");
const DOCUMENT_NAME = "comment";
const COLLECTION_NAME = "comments";
const commentSchema = new mongoose.Schema(
  {
    commentParentId: { type: String, default: null },
    content: { type: String, required: true },
    left: { type: Number, default: 0 },
    right: { type: Number, default: 0 },
    questionId: {
      type: mongoose.Types.ObjectId,
      ref: "question",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    userId: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    like: { type: Number, default: 0 },
    isAnonymous: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
const commentLikeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
    commentId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "comment",
    },
  },
  {
    timestamps: true,
    collection: "comment_likes",
  }
);
commentSchema.index({ userId: 1 });
commentSchema.index({ questionId: 1, commentParentId: 1 });
commentSchema.index({ questionId: 1, left: 1, right: 1 });
commentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });
module.exports = {
  nestedComment: mongoose.model(DOCUMENT_NAME, commentSchema),
  commentLike: mongoose.model("commentLike", commentLikeSchema),
};
