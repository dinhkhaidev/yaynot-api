const mongoose = require("mongoose");
const DOCUMENT_NAME = "role";
const COLLECTION_NAME = "roles";
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "user",
      enum: ["admin", "user", "moderator"],
      required: true,
    },
    description: { type: String, default: "" },
    slug: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "pending", "inactive"],
      default: "active",
    },
    grants: [
      {
        resource: {
          type: mongoose.Types.ObjectId,
          ref: "resource",
          required: true,
        },
        action: [{ type: String, required: true }],
        attributes: { type: String, default: "*" },
      },
    ],
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
module.exports = mongoose.model(DOCUMENT_NAME, roleSchema);
