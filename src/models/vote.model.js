const mongoose = require("mongoose");
const DOCUMENT_NAME = "vote";
const COLLECTION_NAME = "votes";
const voteSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Types.ObjectId,
      ref: "question",
      required: true,
    },
    userId: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    voteType: { type: Boolean, required: true },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
module.exports = mongoose.model(DOCUMENT_NAME, voteSchema);
