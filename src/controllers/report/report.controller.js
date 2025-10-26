const { CREATED, OK } = require("../../core/success.response");
const ReportService = require("../../services/report.service");

/**
 * Report Controller - Handle user report requests
 */
class ReportController {
  /**
   * Tạo report mới
   * POST /api/v1/report
   */
  createReport = async (req, res, next) => {
    new CREATED({
      message: "Report created successfully",
      metadata: await ReportService.createReport({
        ...req.body,
        userId: req.user.user_id,
      }),
    }).send(res);
  };

  /**
   * Lấy danh sách reports của user
   * GET /api/v1/report/my-reports
   */
  getMyReports = async (req, res, next) => {
    new OK({
      message: "Get user reports successfully",
      metadata: await ReportService.getUserReports(req.user.user_id, req.query),
    }).send(res);
  };

  /**
   * Lấy chi tiết 1 report
   * GET /api/v1/report/:id
   */
  getReportById = async (req, res, next) => {
    new OK({
      message: "Get report details successfully",
      metadata: await ReportService.getReportById(
        req.params.id,
        req.user.user_id,
        false // isAdmin = false
      ),
    }).send(res);
  };

  /**
   * Cancel/Delete report
   * DELETE /api/v1/report/:id
   */
  cancelReport = async (req, res, next) => {
    new OK({
      message: "Report cancelled successfully",
      metadata: await ReportService.cancelReport(
        req.params.id,
        req.user.user_id
      ),
    }).send(res);
  };
}

module.exports = new ReportController();
