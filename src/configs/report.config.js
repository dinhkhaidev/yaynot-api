/**
 * Report System Configuration
 * Centralized config for report feature
 */

module.exports = {
  // Auto-moderation settings
  autoHideThreshold: parseInt(process.env.REPORT_AUTO_HIDE_THRESHOLD) || 5,

  // Duplicate prevention
  duplicateCheckHours: parseInt(process.env.REPORT_DUPLICATE_CHECK_HOURS) || 24,

  // Rate limiting
  rateLimitWindow: 60 * 1000, // 1 minute
  maxReportsPerWindow: parseInt(process.env.REPORT_MAX_PER_MINUTE) || 5,

  // Pagination
  defaultPageSize: 20,
  maxPageSize: 100,

  // Priorities
  priorityLevels: {
    low: 0,
    medium: 5,
    high: 10,
    critical: 20,
  },

  // Auto-escalation
  autoEscalateThreshold: 3, // Escalate to high priority after 3 reports

  // Notifications
  notifyReporterOnReview: process.env.REPORT_NOTIFY_REPORTER !== "false",
  notifyOwnerOnHide: process.env.REPORT_NOTIFY_OWNER !== "false",
};
