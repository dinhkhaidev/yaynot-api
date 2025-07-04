const { required } = require("joi");
const mongoose = require("mongoose");
const DOCUMENT_NAME = "convention";
const COLLECTION_NAME = "conventions";
const conventionSchema = new mongoose.Schema(
  {
    name: { type: String },
    type: { type: String, enum: ["private", "group"], required: true },
    participants: {
      type: [mongoose.Types.ObjectId],
      required: true,
      ref: "user",
    },
    lastMessage: {
      content: { type: String },
      senderId: { type: mongoose.Types.ObjectId, ref: "user" },
      createdAt: { type: Date },
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
module.exports = mongoose.model(DOCUMENT_NAME, conventionSchema);
