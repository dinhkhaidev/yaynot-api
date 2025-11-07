const mongoose = require("mongoose");
const DOCUMENT_NAME = "careQuestion";
const COLLECTION_NAME = "care_questions";
const careQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "question",
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "user",
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);
module.exports = mongoose.model(DOCUMENT_NAME, careQuestionSchema);
