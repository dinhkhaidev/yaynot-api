const questionTrendingScore = {
  TOTALVOTE: process.env.TRENDING_TOTALVOTE,
  COMMENT: process.env.TRENDING_COMMENT,
  VIEW: process.env.TRENDING_VIEW,
  SHARE: process.env.TRENDING_SHARE,
  BOOKMARK: process.env.TRENDING_BOOKMARK,
  CARE: process.env.TRENDING_CARE,
  GRAVITY: process.env.TRENDING_GRAVITY,
  OFFSET: process.env.TRENDING_OFFSET,
  THRESHOLD: process.env.TRENDING_THRESHOLD,
};
module.exports = {
  questionTrendingScore,
};
