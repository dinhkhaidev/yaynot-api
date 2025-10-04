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
    expireAt: {
      type: Date,
      default: () =>
        new Date(Date.now() + (process.env.TTL_BLACKLIST || 180) * 1000),
      expires: 0,
    },
  },
  {
    timestamps: true,
    collection: "blacklists",
  }
);
keyTokenSchema.index({ user_id: 1 }, { unique: true });
blackListSchema.index({ token: 1 });
module.exports = {
  keyTokenModel: mongoose.model(DOCUMENT_NAME, keyTokenSchema),
  blackListModel: mongoose.model("blackList", blackListSchema),
};
