const mongoose = require("mongoose");
const DOCUMENT_NAME = "template";
const COLLECTION_NAME = "templates";
const templateModel = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ["active"], default: "active" },
    html: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);

module.exports = mongoose.model(DOCUMENT_NAME, templateModel);
