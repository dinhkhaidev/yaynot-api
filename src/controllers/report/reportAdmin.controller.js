const { OK } = require("../../core/success.response");
const ReportService = require("../../services/report.service");
class ReportAdminController {
  getAllReports = async (req, res, next) => {
    new OK({
      message: "Get all reports successfully",
      metadata: await ReportService.getAllReports(req.query),
    }).send(res);
  };
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
  getReportStats = async (req, res, next) => {
    new OK({
      message: "Get report statistics successfully",
      metadata: await ReportService.getReportStats(),
    }).send(res);
  };
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
