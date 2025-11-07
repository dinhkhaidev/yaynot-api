const express = require("express");
const router = express.Router();
const { validate } = require("../../../../middlewares/validate.js");
const {
  getAdminReportsSchema,
  reviewReportSchema,
  reportIdParamSchema,
} = require("../../../../validations/report.validation");
const reportAdminController = require("../../../../controllers/report/reportAdmin.controller");
const asyncHandle = require("../../../../helpers/asyncHandle");

/**
 * Admin Report Routes
 * Base: /api/admin/v1/reports
 */

// Lấy thống kê - ĐẶT TRƯỚC /reports/:id
router.get("/stats", asyncHandle(reportAdminController.getReportStats));

// Lấy reports của một target
router.get(
  "/target/:targetType/:targetId",
  asyncHandle(reportAdminController.getReportsByTarget),
);

// Lấy tất cả reports với filters
router.get(
  "/",
  validate(getAdminReportsSchema, "query"),
  asyncHandle(reportAdminController.getAllReports),
);

// Lấy chi tiết 1 report
router.get(
  "/:id",
  validate(reportIdParamSchema, "params"),
  asyncHandle(reportAdminController.getReportById),
);

// Review report
router.put(
  "/:id/review",
  validate(reportIdParamSchema, "params"),
  validate(reviewReportSchema, "body"),
  asyncHandle(reportAdminController.reviewReport),
);

module.exports = router;
