const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../core/error.response");
const ReportRepository = require("../models/repositories/report.repo");
const Question = require("../models/question.model");
const { nestedComment } = require("../models/nestedComment.model");
const targetType = require("../constants/targetType");
const reportStatus = require("../constants/reportStatus");
const actionTaken = require("../constants/actionTaken");
const mongoose = require("mongoose");
const reportConfig = require("../configs/report.config");

/**
 * Report Service - Business logic for report system
 */

class ReportService {
  static async createReport({
    targetType: type,
    targetId,
    reportType,
    description,
    userId,
  }) {
    const target = await this._validateTargetExists(type, targetId);
    const existingReport = await ReportRepository.checkDuplicateReport(
      userId,
      type,
      targetId,
      reportConfig.duplicateCheckHours
    );
    if (existingReport) {
      throw new BadRequestError(
        `You have already reported this content within the last ${reportConfig.duplicateCheckHours} hours`
      );
    }
    const report = await ReportRepository.createReport({
      targetType: type,
      targetId,
      reportType,
      description,
      reportedBy: userId,
    });
    await ReportRepository.increasePriorityForTarget(type, targetId);
    const reportCount = await ReportRepository.countReportsByTarget(
      type,
      targetId,
      reportStatus.PENDING
    );

    let autoActionTaken = false;
    if (reportCount >= reportConfig.autoHideThreshold) {
      await this._autoHideContent(type, targetId);
      await ReportRepository.autoResolveReportsByTarget(
        type,
        targetId,
        actionTaken.HIDE_CONTENT
      );
      autoActionTaken = true;
      // TODO: Notify content owner
      // await NotificationService.notifyContentHidden(target.userId, type, targetId);
    }
    return {
      report,
      autoActionTaken,
      reportCount,
      message: autoActionTaken
        ? `Report created. Content has been automatically hidden due to ${reportConfig.autoHideThreshold} reports.`
        : "Report created successfully",
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
    const targetContent = await this._getTargetContent(
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
    // Start transaction protect data consistency
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Update report status
      const updatedReport = await ReportRepository.updateReportStatus(
        reportId,
        {
          status,
          actionTaken: action,
          reviewNote,
          reviewedBy: adminId,
        }
      );
      if (status === reportStatus.RESOLVED && action !== actionTaken.NONE) {
        await this._executeAction(report.targetType, report.targetId, action);
      }
      await session.commitTransaction();
      // Send notification to reporter (outside transaction)
      // await NotificationService.notifyReportReviewed(report.reportedBy._id, updatedReport);
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
    await this._validateTargetExists(targetType, targetId);
    return await ReportRepository.getReportsByTarget(targetType, targetId);
  }
  // ============ PRIVATE METHODS ============

  static async _validateTargetExists(type, targetId) {
    let target;
    switch (type) {
      case targetType.QUESTION:
        target = await Question.findById(targetId).lean();
        if (!target) throw new NotFoundError("Question not found");
        if (target.isDeleted)
          throw new BadRequestError("Question has been deleted");
        break;
      case targetType.COMMENT:
        target = await nestedComment.findById(targetId).lean();
        if (!target) throw new NotFoundError("Comment not found");
        break;
      default:
        throw new BadRequestError("Invalid target type");
    }
    return target;
  }
  static async _getTargetContent(type, targetId) {
    switch (type) {
      case targetType.QUESTION:
        return await Question.findById(targetId)
          .select("title content image status visibility userId createdAt")
          .populate("userId", "username avatar")
          .lean();

      case targetType.COMMENT:
        return await nestedComment
          .findById(targetId)
          .select("content questionId userId createdAt")
          .populate("userId", "username avatar")
          .populate("questionId", "title")
          .lean();

      default:
        return null;
    }
  }
  static async _autoHideContent(type, targetId) {
    switch (type) {
      case targetType.QUESTION:
        await Question.findByIdAndUpdate(targetId, {
          moderationStatus: "warn",
          visibility: "private",
        });
        break;
      case targetType.COMMENT:
        await nestedComment.findByIdAndUpdate(targetId, {
          content: "[Content has been hidden due to multiple reports]",
        });
        break;
    }
  }
  static async _executeAction(type, targetId, action) {
    switch (action) {
      case actionTaken.HIDE_CONTENT:
        await this._hideContent(type, targetId);
        break;
      case actionTaken.DELETE_CONTENT:
        await this._deleteContent(type, targetId);
        break;
      case actionTaken.WARN_USER:
        // TODO: Implement warn user functionality
        // await UserService.warnUser(userId);
        break;
      case actionTaken.BAN_USER:
        // TODO: Implement ban user functionality
        // await UserService.banUser(userId);
        break;
      case actionTaken.RESTRICT_USER:
        // TODO: Implement restrict user functionality
        // await UserService.restrictUser(userId);
        break;
      case actionTaken.NONE:
      default:
        // Do nothing
        break;
    }
  }
  static async _hideContent(type, targetId) {
    switch (type) {
      case targetType.QUESTION:
        await Question.findByIdAndUpdate(targetId, {
          visibility: "private",
          moderationStatus: "warn",
        });
        break;

      case targetType.COMMENT:
        await nestedComment.findByIdAndUpdate(targetId, {
          content: "[This content has been hidden by moderators]",
        });
        break;
    }
  }

  /**
   * Delete content (soft delete for questions, hard delete for comments)
   * @param {string} type - targetType (question/comment)
   * @param {string} targetId - ID of content
   * @private
   */
  static async _deleteContent(type, targetId) {
    switch (type) {
      case targetType.QUESTION:
        await Question.findByIdAndUpdate(targetId, {
          isDeleted: true,
          moderationStatus: "ban",
        });
        break;

      case targetType.COMMENT:
        await nestedComment.findByIdAndDelete(targetId);
        break;
    }
  }
}

module.exports = ReportService;
