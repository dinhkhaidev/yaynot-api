const mongoose = require("mongoose");
const statusQuestion = require("../constants/statusQuestion");
const DOCUMENT_NAME = "question";
const COLLECTION_NAME = "questions";
const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: [String] },
    status: {
      type: String,
      enum: Object.values(statusQuestion),
      default: "draft",
    },
    moderationStatus: {
      type: String,
      enum: ["ok", "warn", "ban"],
      default: "ok",
    },
    isAnonymous: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "user",
    },
    topicId: {
      type: mongoose.Types.ObjectId,
      // required: true,
      ref: "topic",
    },
    tags: { type: [String] },
    //fast for queue
    // voteYesCount: { type: Number, default: 0 },
    // voteNoCount: { type: Number, default: 0 },
    // commentCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(DOCUMENT_NAME, questionSchema);
