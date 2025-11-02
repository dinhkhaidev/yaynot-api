const { BadRequestError } = require("../../../core/error.response");

class QuestionMetrics {
  constructor(data = {}) {
    this._viewCount = data.viewCount || 0;
    this._shareCount = data.shareCount || 0;
    this._voteCount = data.voteCount || 0;
    this._commentCount = data.commentCount || 0;
    this._bookmarkCount = data.bookmarkCount || 0;
    this._reportCount = data.reportCount || 0;

    this.validate();
  }

  validate() {
    const metrics = [
      this._viewCount,
      this._shareCount,
      this._voteCount,
      this._commentCount,
      this._bookmarkCount,
      this._reportCount,
    ];

    for (const metric of metrics) {
      if (typeof metric !== "number" || metric < 0) {
        throw new BadRequestError("All metrics must be non-negative numbers");
      }
    }
  }

  get viewCount() {
    return this._viewCount;
  }

  get shareCount() {
    return this._shareCount;
  }

  get voteCount() {
    return this._voteCount;
  }

  get commentCount() {
    return this._commentCount;
  }

  get bookmarkCount() {
    return this._bookmarkCount;
  }

  get reportCount() {
    return this._reportCount;
  }

  getEngagementScore() {
    return (
      this._viewCount * 1 +
      this._shareCount * 5 +
      this._voteCount * 3 +
      this._commentCount * 4 +
      this._bookmarkCount * 6
    );
  }

  isPopular(threshold = 100) {
    return this.getEngagementScore() >= threshold;
  }

  isTrending(recentViewThreshold = 50) {
    return this._viewCount >= recentViewThreshold;
  }

  needsModerationReview(reportThreshold = 5) {
    return this._reportCount >= reportThreshold;
  }

  incrementViews() {
    return new QuestionMetrics({
      viewCount: this._viewCount + 1,
      shareCount: this._shareCount,
      voteCount: this._voteCount,
      commentCount: this._commentCount,
      bookmarkCount: this._bookmarkCount,
      reportCount: this._reportCount,
    });
  }

  incrementShares() {
    return new QuestionMetrics({
      viewCount: this._viewCount,
      shareCount: this._shareCount + 1,
      voteCount: this._voteCount,
      commentCount: this._commentCount,
      bookmarkCount: this._bookmarkCount,
      reportCount: this._reportCount,
    });
  }

  toObject() {
    return {
      viewCount: this._viewCount,
      shareCount: this._shareCount,
      voteCount: this._voteCount,
      commentCount: this._commentCount,
      bookmarkCount: this._bookmarkCount,
      reportCount: this._reportCount,
      engagementScore: this.getEngagementScore(),
    };
  }

  static fromObject(obj) {
    return new QuestionMetrics(obj);
  }

  static empty() {
    return new QuestionMetrics({
      viewCount: 0,
      shareCount: 0,
      voteCount: 0,
      commentCount: 0,
      bookmarkCount: 0,
      reportCount: 0,
    });
  }
}

module.exports = QuestionMetrics;
