const mongoose = require("mongoose");
const DOCUMENT_NAME = "userProfile";
const COLLECTION_NAME = "user_profiles";
const userProfileSchema = new mongoose.Schema(
  {
    // userId: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
    name: { type: String },
    birthday: { type: Date },
    location: { type: String, default: "VietNam" },
    avatar: {
      type: String,
      default: "https://www.svgrepo.com/show/452030/avatar-default.svg",
    },
    biography: { type: String },
    link: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
module.exports = mongoose.model(DOCUMENT_NAME, userProfileSchema);
