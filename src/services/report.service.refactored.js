const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../core/error.response");
const ReportRepository = require("../models/repositories/report.repo");
const reportStatus = require("../constants/reportStatus");
const mongoose = require("mongoose");

const ReportEntity = require("../domain/report/entities/report.entity");
const TargetValidationRule = require("../domain/report/rules/targetValidation.rule");
const {
  ContentActionFactory,
} = require("../domain/report/actions/contentAction.factory");

class ReportServiceRefactored {
  static async createReport({
    targetType: type,
    targetId,
    reportType,
    description,
    userId,
  }) {
    await TargetValidationRule.validateAndGetTarget(type, targetId);

    const existingReport = await ReportRepository.checkDuplicateReport(
      userId,
      type,
      targetId,
      24
    );

    const reportEntity = new ReportEntity({
      targetType: type,
      targetId,
      reportType,
      description,
      reportedBy: userId,
    });

    reportEntity.validateNoDuplicate(existingReport);

    const report = await ReportRepository.createReport(reportEntity.toDTO());

    await ReportRepository.increasePriorityForTarget(type, targetId);

    const reportCount = await ReportRepository.countReportsByTarget(
      type,
      targetId,
      reportStatus.PENDING
    );

    reportEntity.reportCount = reportCount;

    let autoActionTaken = false;
    if (reportEntity.triggersAutoModeration()) {
      const action = reportEntity.getRecommendedAction();

      const actionStrategy = ContentActionFactory.getAction(action);
      await actionStrategy.execute(type, targetId);

      await ReportRepository.autoResolveReportsByTarget(type, targetId, action);

      autoActionTaken = true;
    }

    return {
      report,
      autoActionTaken,
      reportCount,
      severity: reportEntity.getSeverity(),
      message: reportEntity.getAutoModerationMessage(),
    };
  }

  static async getUserReports(userId, query) {
    return await ReportRepository.getUserReports(userId, query);
  }

  static async getReportById(reportId, userId, isAdmin = false) {
    const report = await ReportRepository.findReportById(reportId);

    if (!report) {
      throw new NotFoundError("Report not found");
    }

    if (!isAdmin && report.reportedBy._id.toString() !== userId.toString()) {
      throw new ForbiddenError("You don't have permission to view this report");
    }

    const targetContent = await TargetValidationRule.getTargetContent(
      report.targetType,
      report.targetId
    );

    return {
      ...report,
      targetContent,
    };
  }

  static async cancelReport(reportId, userId) {
    const report = await ReportRepository.findReportById(reportId);

    if (!report) {
      throw new NotFoundError("Report not found");
    }

    if (report.reportedBy._id.toString() !== userId.toString()) {
      throw new ForbiddenError("You can only cancel your own reports");
    }

    if (report.status !== reportStatus.PENDING) {
      throw new BadRequestError("Can only cancel pending reports");
    }

    await ReportRepository.deleteReport(reportId);
    return { message: "Report cancelled successfully" };
  }
  /**
   * [ADMIN]
   */
  static async getAllReports(filters) {
    return await ReportRepository.getAllReports(filters);
  }

  static async reviewReport(
    reportId,
    { status, actionTaken: action, reviewNote },
    adminId
  ) {
    const report = await ReportRepository.findReportById(reportId);

    if (!report) {
      throw new NotFoundError("Report not found");
    }

    if (
      report.status !== reportStatus.PENDING &&
      report.status !== reportStatus.REVIEWING
    ) {
      throw new BadRequestError("Report has already been reviewed");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const updatedReport = await ReportRepository.updateReportStatus(
        reportId,
        {
          status,
          actionTaken: action,
          reviewNote,
          reviewedBy: adminId,
        }
      );

      if (status === reportStatus.RESOLVED) {
        const actionStrategy = ContentActionFactory.getAction(action);
        await actionStrategy.execute(report.targetType, report.targetId);
      }

      await session.commitTransaction();

      return {
        ...updatedReport,
        message: "Report reviewed successfully",
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getReportStats() {
    return await ReportRepository.getReportStats();
  }

  static async getReportsByTarget(targetType, targetId) {
    await TargetValidationRule.validateAndGetTarget(targetType, targetId);

    return await ReportRepository.getReportsByTarget(targetType, targetId);
  }
}

module.exports = ReportServiceRefactored;
