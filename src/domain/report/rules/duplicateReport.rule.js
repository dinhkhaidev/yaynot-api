const { BadRequestError } = require("../../../core/error.response");
const reportConfig = require("../../../configs/report.config");

class DuplicateReportRule {
  constructor(config = reportConfig) {
    this.duplicateCheckHours = config.duplicateCheckHours;
  }

  validateNoDuplicate(existingReport) {
    if (existingReport) {
      throw new BadRequestError(
        `You have already reported this content within the last ${this.duplicateCheckHours} hours`,
      );
    }
  }

  getDuplicateCheckWindow() {
    return this.duplicateCheckHours;
  }

  canReportAgain(lastReportDate) {
    const hoursSinceLastReport =
      (Date.now() - new Date(lastReportDate).getTime()) / (1000 * 60 * 60);

    return hoursSinceLastReport >= this.duplicateCheckHours;
  }
}

module.exports = DuplicateReportRule;
