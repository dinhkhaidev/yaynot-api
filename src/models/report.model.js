const mongoose = require("mongoose");
const reportType = require("../constants/reportType");
const reportStatus = require("../constants/reportStatus");
const targetType = require("../constants/targetType");
const actionTaken = require("../constants/actionTaken");

const DOCUMENT_NAME = "report";
const COLLECTION_NAME = "reports";

const reportSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: Object.values(targetType),
      required: true,
    },
    targetId: {
      type: mongoose.Types.ObjectId,
      required: true,
      refPath: "targetType", //Dynamic reference
    },
    reportType: {
      type: String,
      enum: Object.values(reportType),
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: Object.values(reportStatus),
      default: reportStatus.PENDING,
    },
    reportedBy: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
    //(admin/moderator)
    reviewedBy: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      default: null,
    },
    reviewNote: {
      type: String,
      maxlength: 500,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    actionTaken: {
      type: String,
      enum: Object.values(actionTaken),
      default: actionTaken.NONE,
    },
    // Metadata
    priority: {
      type: Number,
      default: 0, //Increase if have many report
    },
    isAutoResolved: {
      type: Boolean,
      default: false, //True if auto handle by system
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });
reportSchema.index({ reportedBy: 1, createdAt: -1 });
reportSchema.index({ reviewedBy: 1 });
reportSchema.index({ targetType: 1, targetId: 1, reportedBy: 1 });
// Virtual for populate target content
reportSchema.virtual("target", {
  refPath: "targetType",
  localField: "targetId",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtuals are included in JSON
reportSchema.set("toJSON", { virtuals: true });
reportSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model(DOCUMENT_NAME, reportSchema);
