const mongoose = require("mongoose");
const DOCUMENT_NAME = "questionHistory";
const COLLECTION_NAME = "question_histories";
const questionHistorySchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Types.ObjectId, required: true },
    userId: { type: mongoose.Types.ObjectId, required: true },
    action: { type: String, required: true, default: "update" },
    metadata: {
      title: {
        type: String,
      },
      content: { type: String },
      image: { type: Array },
      shortTag: { type: [String] },
    },
    version: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);
module.exports = mongoose.model(DOCUMENT_NAME, questionHistorySchema);
