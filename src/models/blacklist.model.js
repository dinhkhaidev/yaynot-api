const { Schema, model } = require("mongoose");

const blacklistSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "token_blacklist",
  }
);

// TTL index - auto delete expired tokens
blacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = model("tokenBlacklist", blacklistSchema);
