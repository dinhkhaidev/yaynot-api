const { BadRequestError } = require("../../../core/error.response");

class QuestionVisibilityRule {
  static validateVisibility(visibility) {
    const validVisibilities = ["public", "private", "followers"];

    if (!validVisibilities.includes(visibility)) {
      throw new BadRequestError(
        `Invalid visibility: ${visibility}. Must be one of: ${validVisibilities.join(
          ", "
        )}`
      );
    }
  }

  static canChangeVisibility(question, newVisibility) {
    if (question.isDeleted) {
      return false;
    }

    if (question.visibility === newVisibility) {
      return false;
    }

    return true;
  }

  static validateVisibilityChange(question, newVisibility) {
    this.validateVisibility(newVisibility);

    if (!this.canChangeVisibility(question, newVisibility)) {
      throw new BadRequestError(
        `Cannot change visibility from ${question.visibility} to ${newVisibility}`
      );
    }
  }

  static isPublic(question) {
    return question.visibility === "public" && !question.isDeleted;
  }

  static isPrivate(question) {
    return question.visibility === "private";
  }

  static isFollowersOnly(question) {
    return question.visibility === "followers";
  }

  static canView(question, viewerId, isFollowing = false) {
    if (question.userId.toString() === viewerId?.toString()) {
      return true;
    }

    if (question.isDeleted) {
      return false;
    }

    if (this.isPublic(question)) {
      return true;
    }

    if (this.isFollowersOnly(question)) {
      return isFollowing;
    }

    return false;
  }
}

module.exports = QuestionVisibilityRule;
