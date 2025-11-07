const mongoose = require("mongoose");
const DOCUMENT_NAME = "message";
const COLLECTION_NAME = "messages";
const messageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    attachment: { type: [String], default: [] },
    convoId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "convention",
    },
    // type: { type: String, required: true },
    // react:{type},
    senderId: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
    seenBy: { type: [mongoose.Types.ObjectId], ref: "user" },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);
messageSchema.index({ convoId: 1, createdAt: -1 });
messageSchema.index({ convoId: 1, updatedAt: -1 });
module.exports = mongoose.model(DOCUMENT_NAME, messageSchema);
