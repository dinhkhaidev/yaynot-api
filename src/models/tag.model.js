const mongoose = require("mongoose");
const DOCUMENT_NAME = "tag";
const COLLECTION_NAME = "tags";
const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    questionCount: { type: Number, default: 0 },
    isFlag: { type: Boolean, default: false },
    isPublish: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
const tagQuestionMapSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "question",
      index: true,
    },
    tagId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "vote",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "tags_questions",
  }
);
// tagSchema.pre("save", function (next) {
//   if (this.isModified("name")) {
//     console.log("run1");
//     this.name = this.name.toLowerCase();
//     this.displayName = `#${this.name}`;
//   }
//   console.log("run2");
//   next();
// });
module.exports = {
  tagModel: mongoose.model(DOCUMENT_NAME, tagSchema),
  tagQuestionModel: mongoose.model("tagQuestion", tagQuestionMapSchema),
};
