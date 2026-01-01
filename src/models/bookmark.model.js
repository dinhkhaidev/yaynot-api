const mongoose = require("mongoose");
const DOCUMENT_NAME = "bookmark";
const COLLECTION_NAME = "bookmarks";
const bookmarkSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Types.ObjectId, ref: "question" },
    userId: { type: mongoose.Types.ObjectId, ref: "user" },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
bookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true });
module.exports = mongoose.model(DOCUMENT_NAME, bookmarkSchema);
