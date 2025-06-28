const mongoose = require("mongoose");
const DOCUMENT_NAME = "follow";
const COLLECTION_NAME = "follows";
const followSchema = new mongoose.Schema(
  {
    followerId: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
    followingId: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
module.exports = mongoose.model(DOCUMENT_NAME, followSchema);
