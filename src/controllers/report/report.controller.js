const { CREATED, OK } = require("../../core/success.response");
const ReportService = require("../../services/report.service");
class ReportController {
  createReport = async (req, res, next) => {
    new CREATED({
      message: "Report created successfully",
      metadata: await ReportService.createReport({
        ...req.body,
        userId: req.user.user_id,
      }),
    }).send(res);
  };
  getMyReports = async (req, res, next) => {
    new OK({
      message: "Get user reports successfully",
      metadata: await ReportService.getUserReports(req.user.user_id, req.query),
    }).send(res);
  };
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
