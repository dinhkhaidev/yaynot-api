const mongoose = require("mongoose");
const DOCUMENT_NAME = "otp";
const COLLECTION_NAME = "otps";
const otpModel = new mongoose.Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    status: { type: Boolean, default: false },
    expiredAt: { type: Date, expires: 3600 * 12, default: Date.now },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);
otpModel.index({ email: 1 }, { unique: true });
otpModel.index({ otp: -1 }, { unique: true });
module.exports = mongoose.model(DOCUMENT_NAME, otpModel);
