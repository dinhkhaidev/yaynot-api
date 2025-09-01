const { default: mongoose } = require("mongoose");
const DOCUMENT_NAME = "resource";
const COLLECTION_NAME = "resources";
const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: { type: String, default: "" },
    slug: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
module.exports = mongoose.model(DOCUMENT_NAME, resourceSchema);
