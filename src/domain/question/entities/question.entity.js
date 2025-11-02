const QuestionValidationRule = require("../rules/questionValidation.rule");
const QuestionStatusRule = require("../rules/questionStatus.rule");
const QuestionVisibilityRule = require("../rules/questionVisibility.rule");

class QuestionEntity {
  constructor(data) {
    this.id = data.id || data._id;
    this.title = data.title;
    this.content = data.content;
    this.image = data.image || [];
    this.visibility = data.visibility || "public";
    this.status = data.status || "draft";
    this.moderationStatus = data.moderationStatus || "pending";
    this.isAnonymous = data.isAnonymous || false;
    this.isDeleted = data.isDeleted || false;
    this.userId = data.userId;
    this.topicId = data.topicId;
    this.shortTag = data.shortTag || [];
    this.viewCount = data.viewCount || 0;
    this.shareCount = data.shareCount || 0;
    this.voteCount = data.voteCount || 0;
    this.commentCount = data.commentCount || 0;
    this.bookmarkCount = data.bookmarkCount || 0;
    this.reportCount = data.reportCount || 0;

    this.validationRule = QuestionValidationRule;
    this.statusRule = QuestionStatusRule;
    this.visibilityRule = QuestionVisibilityRule;
  }

  canPublish() {
    return this.statusRule.canPublish(this);
  }

  canDraft() {
    return this.statusRule.canDraft(this);
  }

  canArchive() {
    return this.statusRule.canArchive(this);
  }

  isOwnedBy(userId) {
    return this.userId.toString() === userId.toString();
  }

  isPublic() {
    return this.visibilityRule.isPublic(this);
  }

  isPrivate() {
    return this.visibilityRule.isPrivate(this);
  }

  isFollowersOnly() {
    return this.visibilityRule.isFollowersOnly(this);
  }

  canBeViewedBy(viewerId, isFollowing = false) {
    return this.visibilityRule.canView(this, viewerId, isFollowing);
  }

  validateStatusTransition(newStatus) {
    this.statusRule.validateStatusTransition(this.status, newStatus);
    this.statusRule.validateCanTransition(this, newStatus);
  }

  validateVisibilityChange(newVisibility) {
    this.visibilityRule.validateVisibilityChange(this, newVisibility);
  }

  validateOwnership(userId) {
    this.validationRule.validateOwnership(this, userId);
  }

  validateNotDeleted() {
    this.validationRule.validateNotDeleted(this);
  }

  getAllowedStatusTransitions() {
    return this.statusRule.getAllowedTransitions(this.status);
  }

  hasRequiredFields() {
    return Boolean(this.title?.trim() && this.content?.trim() && this.userId);
  }

  isDraft() {
    return this.status === "draft";
  }

  isPublished() {
    return this.status === "publish";
  }

  isArchived() {
    return this.status === "archive";
  }

  isPending() {
    return this.moderationStatus === "pending";
  }

  isApproved() {
    return this.moderationStatus === "ok";
  }

  isRejected() {
    return this.moderationStatus === "rejected";
  }

  isFlagged() {
    return this.moderationStatus === "flagged";
  }

  needsModeration() {
    return this.moderationStatus === "pending" || this.reportCount >= 5;
  }

  isActive() {
    return !this.isDeleted && this.status === "publish" && this.isApproved();
  }

  hasImages() {
    return Array.isArray(this.image) && this.image.length > 0;
  }

  hasTags() {
    return Array.isArray(this.shortTag) && this.shortTag.length > 0;
  }

  getEngagementScore() {
    return (
      this.viewCount * 1 +
      this.shareCount * 5 +
      this.voteCount * 3 +
      this.commentCount * 4 +
      this.bookmarkCount * 6
    );
  }

  isPopular(threshold = 100) {
    return this.getEngagementScore() >= threshold;
  }

  isTrending(viewThreshold = 50) {
    return this.viewCount >= viewThreshold && this.isActive();
  }

  softDelete() {
    this.isDeleted = true;
    this.status = "archive";
  }

  restore() {
    if (this.isDeleted) {
      this.isDeleted = false;
    }
  }

  publish() {
    this.validateStatusTransition("publish");
    this.status = "publish";
  }

  draft() {
    this.validateStatusTransition("draft");
    this.status = "draft";
  }

  archive() {
    this.validateStatusTransition("archive");
    this.status = "archive";
  }

  makePublic() {
    this.validateVisibilityChange("public");
    this.visibility = "public";
  }

  makePrivate() {
    this.validateVisibilityChange("private");
    this.visibility = "private";
  }

  makeFollowersOnly() {
    this.validateVisibilityChange("followers");
    this.visibility = "followers";
  }

  incrementViews() {
    this.viewCount += 1;
  }

  incrementShares() {
    this.shareCount += 1;
  }

  incrementVotes() {
    this.voteCount += 1;
  }

  decrementVotes() {
    if (this.voteCount > 0) {
      this.voteCount -= 1;
    }
  }

  incrementComments() {
    this.commentCount += 1;
  }

  decrementComments() {
    if (this.commentCount > 0) {
      this.commentCount -= 1;
    }
  }

  incrementBookmarks() {
    this.bookmarkCount += 1;
  }

  decrementBookmarks() {
    if (this.bookmarkCount > 0) {
      this.bookmarkCount -= 1;
    }
  }

  incrementReports() {
    this.reportCount += 1;
  }

  addTag(tag) {
    if (!this.shortTag.includes(tag)) {
      this.shortTag.push(tag);
    }
  }

  removeTag(tag) {
    this.shortTag = this.shortTag.filter((t) => t !== tag);
  }

  addImage(imageUrl) {
    if (!this.image.includes(imageUrl)) {
      this.image.push(imageUrl);
    }
  }

  removeImage(imageUrl) {
    this.image = this.image.filter((img) => img !== imageUrl);
  }

  updateContent(title, content) {
    if (title) this.title = title.trim();
    if (content) this.content = content.trim();
    this.updatedAt = new Date();
  }

  setModerationStatus(status) {
    const validStatuses = ["pending", "ok", "rejected", "flagged"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid moderation status: ${status}`);
    }
    this.moderationStatus = status;
  }

  toggleAnonymous() {
    this.isAnonymous = !this.isAnonymous;
  }

  toDTO() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      image: this.image,
      visibility: this.visibility,
      status: this.status,
      moderationStatus: this.moderationStatus,
      isAnonymous: this.isAnonymous,
      isDeleted: this.isDeleted,
      userId: this.userId,
      topicId: this.topicId,
      shortTag: this.shortTag,
      viewCount: this.viewCount,
      shareCount: this.shareCount,
      voteCount: this.voteCount,
      commentCount: this.commentCount,
      bookmarkCount: this.bookmarkCount,
      reportCount: this.reportCount,
      engagementScore: this.getEngagementScore(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toPublicDTO() {
    const dto = this.toDTO();
    if (this.isAnonymous) {
      delete dto.userId;
    }
    delete dto.reportCount;
    delete dto.moderationStatus;
    return dto;
  }

  toDatabase() {
    return {
      title: this.title,
      content: this.content,
      image: this.image,
      visibility: this.visibility,
      status: this.status,
      moderationStatus: this.moderationStatus,
      isAnonymous: this.isAnonymous,
      isDeleted: this.isDeleted,
      userId: this.userId,
      topicId: this.topicId,
      shortTag: this.shortTag,
      viewCount: this.viewCount,
      shareCount: this.shareCount,
      voteCount: this.voteCount,
      commentCount: this.commentCount,
      bookmarkCount: this.bookmarkCount,
      reportCount: this.reportCount,
    };
  }

  static fromDatabase(dbRecord) {
    if (!dbRecord) return null;

    return new QuestionEntity({
      id: dbRecord._id,
      title: dbRecord.title,
      content: dbRecord.content,
      image: dbRecord.image,
      visibility: dbRecord.visibility,
      status: dbRecord.status,
      moderationStatus: dbRecord.moderationStatus,
      isAnonymous: dbRecord.isAnonymous,
      isDeleted: dbRecord.isDeleted,
      userId: dbRecord.userId,
      topicId: dbRecord.topicId,
      shortTag: dbRecord.shortTag,
      viewCount: dbRecord.viewCount,
      shareCount: dbRecord.shareCount,
      voteCount: dbRecord.voteCount,
      commentCount: dbRecord.commentCount,
      bookmarkCount: dbRecord.bookmarkCount,
      reportCount: dbRecord.reportCount,
      createdAt: dbRecord.createdAt,
      updatedAt: dbRecord.updatedAt,
    });
  }

  static fromDatabaseArray(dbRecords) {
    if (!Array.isArray(dbRecords)) return [];
    return dbRecords.map((record) => QuestionEntity.fromDatabase(record));
  }

  static createNew(data) {
    return new QuestionEntity({
      ...data,
      status: data.status || "draft",
      visibility: data.visibility || "public",
      moderationStatus: "pending",
      isAnonymous: data.isAnonymous || false,
      isDeleted: false,
      viewCount: 0,
      shareCount: 0,
      voteCount: 0,
      commentCount: 0,
      bookmarkCount: 0,
      reportCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

module.exports = QuestionEntity;
