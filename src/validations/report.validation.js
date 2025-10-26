const Joi = require("joi");
const reportType = require("../constants/reportType");
const reportStatus = require("../constants/reportStatus");
const targetType = require("../constants/targetType");
const actionTaken = require("../constants/actionTaken");

/**
 * Validation schemas for Report API
 */

// Tạo report mới
const createReportSchema = Joi.object({
  targetType: Joi.string()
    .valid(...Object.values(targetType))
    .required()
    .messages({
      "any.required": "Target type is required",
      "any.only": "Invalid target type",
    }),

  targetId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "Target ID is required",
      "string.pattern.base": "Invalid target ID format",
    }),

  reportType: Joi.string()
    .valid(...Object.values(reportType))
    .required()
    .messages({
      "any.required": "Report type is required",
      "any.only": "Invalid report type",
    }),

  description: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .trim()
    .regex(/^[^<>]*$/) // Prevent HTML/script injection
    .messages({
      "any.required": "Description is required",
      "string.min": "Description must be at least 10 characters",
      "string.max": "Description must not exceed 1000 characters",
      "string.pattern.base": "Description contains invalid characters",
    }),
});

// Query params cho danh sách reports của user
const getUserReportsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string()
    .valid(...Object.values(reportStatus))
    .optional(),
});

// Query params cho admin lấy tất cả reports
const getAdminReportsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string()
    .valid(...Object.values(reportStatus))
    .optional(),
  targetType: Joi.string()
    .valid(...Object.values(targetType))
    .optional(),
  reportType: Joi.string()
    .valid(...Object.values(reportType))
    .optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).optional(),
});

// Review report (admin)
const reviewReportSchema = Joi.object({
  status: Joi.string()
    .valid(reportStatus.RESOLVED, reportStatus.REJECTED)
    .required()
    .messages({
      "any.required": "Status is required",
      "any.only": "Status must be either 'resolved' or 'rejected'",
    }),

  actionTaken: Joi.string()
    .valid(...Object.values(actionTaken))
    .required()
    .messages({
      "any.required": "Action taken is required",
      "any.only": "Invalid action",
    }),

  reviewNote: Joi.string()
    .max(500)
    .optional()
    .trim()
    .regex(/^[^<>]*$/)
    .messages({
      "string.max": "Review note must not exceed 500 characters",
      "string.pattern.base": "Review note contains invalid characters",
    }),
});

// Param validation
const reportIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid report ID format",
    }),
});

module.exports = {
  createReportSchema,
  getUserReportsSchema,
  getAdminReportsSchema,
  reviewReportSchema,
  reportIdParamSchema,
};
