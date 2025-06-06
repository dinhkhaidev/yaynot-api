const mongoose = require("mongoose");
const DOCUMENT_NAME = "KeyToken";
const COLLECTION_NAME = "keytokens";
const keyTokenSchema = new mongoose.Schema(
  {
    refreshToken: { type: String },
    publicKey: { type: String, required: true },
    privateKey: { type: String, required: true },
    refreshTokenUsed: { type: [{ type: String }], default: [] },
    user_id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);
const blackListSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "blacklists",
  }
);
module.exports = {
  keyTokenModel: mongoose.model(DOCUMENT_NAME, keyTokenSchema),
  blackListModel: mongoose.model("blackList", blackListSchema),
};
