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
  },
);
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
followSchema.index({ followerId: 1, _id: -1 });
followSchema.index({ followingId: 1, _id: -1 });
module.exports = mongoose.model(DOCUMENT_NAME, followSchema);
