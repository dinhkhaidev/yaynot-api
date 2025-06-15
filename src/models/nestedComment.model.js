const mongoose = require("mongoose");
const DOCUMENT_NAME = "comment";
const COLLECTION_NAME = "comments";
const commentSchema = new mongoose.Schema(
  {
    commentParentId: { type: string, default: null },
    content: { type: String, required: true },
    left: { type: Number, default: 0 },
    right: { type: Number, default: 0 },
    questionId: {
      type: mongoose.Types.ObjectId,
      ref: "question",
      required: true,
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
module.exports = {
  nestedComment: mongoose.model(DOCUMENT_NAME, commentSchema),
};
