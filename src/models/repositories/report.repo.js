const Report = require("../report.model");
const reportStatus = require("../../constants/reportStatus");

/**
 * Repository layer for Report operations
 */
class ReportRepository {
  static async createReport(reportData) {
    return await Report.create(reportData);
  }
  static async findReportById(reportId) {
    return await Report.findById(reportId)
      .populate("reportedBy", "username email avatar")
      .populate("reviewedBy", "username email")
      .lean();
  }
  static async checkDuplicateReport(
    userId,
    targetType,
    targetId,
    hoursAgo = 24
  ) {
    const timeThreshold = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    return await Report.findOne({
      reportedBy: userId,
      targetType,
      targetId,
      createdAt: { $gte: timeThreshold },
    }).lean();
  }
  static async countReportsByTarget(targetType, targetId, status = null) {
    const query = { targetType, targetId };
    if (status) {
      query.status = status;
    }
    return await Report.countDocuments(query);
  }
  static async getUserReports(userId, { page = 1, limit = 20, status = null }) {
    const query = { reportedBy: userId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      Report.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Report.countDocuments(query),
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * get all reports (Admin)
   */
  static async getAllReports(filters = {}) {
    const {
      page = 1,
      limit = 20,
      status = null,
      targetType = null,
      reportType = null,
      startDate = null,
      endDate = null,
    } = filters;

    const query = {};

    if (status) query.status = status;
    if (targetType) query.targetType = targetType;
    if (reportType) query.reportType = reportType;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      Report.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("reportedBy", "username email avatar")
        .populate("reviewedBy", "username email")
        .lean(),
      Report.countDocuments(query),
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  static async updateReportStatus(reportId, updateData) {
    return await Report.findByIdAndUpdate(
      reportId,
      {
        ...updateData,
        reviewedAt: new Date(),
      },
      { new: true }
    ).lean();
  }
  static async deleteReport(reportId) {
    return await Report.findByIdAndDelete(reportId);
  }
  static async getReportStats() {
    const [statusStats, typeStats, totalPending] = await Promise.all([
      Report.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Report.aggregate([
        {
          $group: {
            _id: "$reportType",
            count: { $sum: 1 },
          },
        },
      ]),
      Report.countDocuments({ status: reportStatus.PENDING }),
    ]);

    return {
      //{ _id: "PENDING", count: _ },
      byStatus: statusStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byType: typeStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      totalPending,
    };
  }
  static async getReportsByTarget(targetType, targetId) {
    return await Report.find({ targetType, targetId })
      .sort({ createdAt: -1 })
      .populate("reportedBy", "username email avatar")
      .lean();
  }
  static async increasePriorityForTarget(targetType, targetId) {
    return await Report.updateMany(
      { targetType, targetId, status: reportStatus.PENDING },
      { $inc: { priority: 1 } }
    );
  }
  /**
   * Auto-resolve
   */
  static async autoResolveReportsByTarget(targetType, targetId, actionTaken) {
    return await Report.updateMany(
      { targetType, targetId, status: reportStatus.PENDING },
      {
        status: reportStatus.RESOLVED,
        actionTaken,
        isAutoResolved: true,
        reviewedAt: new Date(),
      }
    );
  }
}

module.exports = ReportRepository;
