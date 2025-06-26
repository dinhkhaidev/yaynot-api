const mongoose = require("mongoose");
const userRole = require("../constants/userRole");
const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "users";
const userSchema = new mongoose.Schema(
  {
    user_name: { type: String, required: true },
    user_email: { type: String, required: true },
    user_password: { type: String, required: true },
    user_role: { type: String, enum: Object.values(userRole), default: "001" },
    user_isVerify: { type: Boolean, default: false },
    user_phone: { type: String },
    user_status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
module.exports = mongoose.model(DOCUMENT_NAME, userSchema);
