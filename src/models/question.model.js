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
    visibility: {
      type: String,
      enum: ["public", "friend", "follower", "private"],
      default: "private",
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
    view: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    shortTag: { type: [String], default: [] },
    //fast for query
    // voteYesCount: { type: Number, default: 0 },
    // voteNoCount: { type: Number, default: 0 },
    // commentCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);
questionSchema.index({ userId: 1 });
module.exports = mongoose.model(DOCUMENT_NAME, questionSchema);
