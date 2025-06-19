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
const voteSummarySchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Types.ObjectId,
      ref: "question",
      required: true,
    },
    voteYesCount: { type: Number, default: 0 },
    voteNoCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: "vote_summaries",
  }
);
module.exports = {
  voteModel: mongoose.model(DOCUMENT_NAME, voteSchema),
  voteSummaryModel: mongoose.model("voteSummary", voteSummarySchema),
};
