const { OK } = require("../../core/success.response");
const ReportService = require("../../services/report.service");

/**
 * Report Admin Controller - Handle admin report management
 */
class ReportAdminController {
  /**
   * Lấy tất cả reports với filters
   * GET /api/admin/v1/report
   */
  getAllReports = async (req, res, next) => {
    new OK({
      message: "Get all reports successfully",
      metadata: await ReportService.getAllReports(req.query),
    }).send(res);
  };

  /**
   * Lấy chi tiết 1 report (admin view)
   * GET /api/admin/v1/report/:id
   */
  getReportById = async (req, res, next) => {
    new OK({
      message: "Get report details successfully",
      metadata: await ReportService.getReportById(
        req.params.id,
        req.user.user_id,
        true // isAdmin = true
      ),
    }).send(res);
  };

  /**
   * Review và action cho report
   * PUT /api/admin/v1/report/:id/review
   */
  reviewReport = async (req, res, next) => {
    new OK({
      message: "Report reviewed successfully",
      metadata: await ReportService.reviewReport(
        req.params.id,
        req.body,
        req.user.user_id
      ),
    }).send(res);
  };

  /**
   * Lấy thống kê reports
   * GET /api/admin/v1/report/stats
   */
  getReportStats = async (req, res, next) => {
    new OK({
      message: "Get report statistics successfully",
      metadata: await ReportService.getReportStats(),
    }).send(res);
  };

  /**
   * Lấy tất cả reports của một target
   * GET /api/admin/v1/report/target/:targetType/:targetId
   */
  getReportsByTarget = async (req, res, next) => {
    new OK({
      message: "Get reports by target successfully",
      metadata: await ReportService.getReportsByTarget(
        req.params.targetType,
        req.params.targetId
      ),
    }).send(res);
  };
}

module.exports = new ReportAdminController();
