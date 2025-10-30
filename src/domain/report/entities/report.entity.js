const AutoModerationRule = require("../rules/autoModeration.rule");
const DuplicateReportRule = require("../rules/duplicateReport.rule");

class ReportEntity {
  constructor(data) {
    this.targetType = data.targetType;
    this.targetId = data.targetId;
    this.reportType = data.reportType;
    this.description = data.description;
    this.reportedBy = data.reportedBy;
    this.status = data.status || "pending";
    this.reportCount = data.reportCount || 0;

    this.autoModerationRule = new AutoModerationRule(data.config);
    this.duplicateRule = new DuplicateReportRule(data.config);
  }

  triggersAutoModeration() {
    return this.autoModerationRule.shouldAutoHide(this.reportCount);
  }

  getRecommendedAction() {
    return this.autoModerationRule.determineAutoAction(this.reportCount);
  }

  getSeverity() {
    return this.autoModerationRule.calculateSeverity(this.reportCount);
  }

  needsManualReview() {
    return this.autoModerationRule.needsManualReview(this.reportCount);
  }

  validateNoDuplicate(existingReport) {
    this.duplicateRule.validateNoDuplicate(existingReport);
  }

  getAutoModerationMessage() {
    const threshold = this.autoModerationRule.getAutoHideThreshold();

    if (this.triggersAutoModeration()) {
      return `Report created. Content has been automatically hidden due to ${threshold} reports.`;
    }

    return "Report created successfully";
  }

  //[temp], will update to interface dto
  toDTO() {
    return {
      targetType: this.targetType,
      targetId: this.targetId,
      reportType: this.reportType,
      description: this.description,
      reportedBy: this.reportedBy,
      status: this.status,
    };
  }

  static fromDatabase(dbRecord) {
    return new ReportEntity({
      targetType: dbRecord.targetType,
      targetId: dbRecord.targetId,
      reportType: dbRecord.reportType,
      description: dbRecord.description,
      reportedBy: dbRecord.reportedBy,
      status: dbRecord.status,
      reportCount: dbRecord.reportCount || 0,
    });
  }
}

module.exports = ReportEntity;
