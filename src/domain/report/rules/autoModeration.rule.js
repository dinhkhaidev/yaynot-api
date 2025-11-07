const reportConfig = require("../../../configs/report.config");
const actionTaken = require("../../../constants/actionTaken");

class AutoModerationRule {
  constructor(config = reportConfig) {
    this.config = config;
  }

  shouldAutoHide(reportCount) {
    return reportCount >= this.config.autoHideThreshold;
  }

  determineAutoAction(reportCount) {
    if (reportCount >= this.config.autoHideThreshold) {
      return actionTaken.HIDE_CONTENT;
    }
    return actionTaken.NONE;
  }

  getAutoHideThreshold() {
    return this.config.autoHideThreshold;
  }

  calculateSeverity(reportCount) {
    const threshold = this.config.autoHideThreshold;

    if (reportCount >= threshold * 2) {return "critical";}
    if (reportCount >= threshold) {return "high";}
    if (reportCount >= threshold * 0.7) {return "medium";}
    return "low";
  }

  needsManualReview(reportCount) {
    return reportCount >= this.config.autoHideThreshold * 0.5;
  }
}

module.exports = AutoModerationRule;
