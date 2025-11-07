const express = require("express");
const router = express.Router();
const { validate } = require("../../../../middlewares/validate.js");
const { reportRateLimit } = require("../../../../middlewares/reportRateLimit");
const {
  createReportSchema,
  getUserReportsSchema,
  reportIdParamSchema,
} = require("../../../../validations/report.validation");
const reportController = require("../../../../controllers/report/report.controller");
const asyncHandle = require("../../../../helpers/asyncHandle");

/**
 * User Report Routes
 * Base: /api/v1/reports
 */
router.post(
  "/",
  reportRateLimit,
  validate(createReportSchema, "body"),
  asyncHandle(reportController.createReport),
);
router.get(
  "/my-reports",
  validate(getUserReportsSchema, "query"),
  asyncHandle(reportController.getMyReports),
);
router.get(
  "/:id",
  validate(reportIdParamSchema, "params"),
  asyncHandle(reportController.getReportById),
);
router.delete(
  "/:id",
  validate(reportIdParamSchema, "params"),
  asyncHandle(reportController.cancelReport),
);

module.exports = router;
