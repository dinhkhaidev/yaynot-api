const questionTrendingScore = {
  TOTALVOTE: parseFloat(process.env.TRENDING_TOTALVOTE),
  COMMENT: parseFloat(process.env.TRENDING_COMMENT),
  VIEW: parseFloat(process.env.TRENDING_VIEW),
  SHARE: parseFloat(process.env.TRENDING_SHARE),
  BOOKMARK: parseFloat(process.env.TRENDING_BOOKMARK),
  CARE: parseFloat(process.env.TRENDING_CARE),
  GRAVITY: parseFloat(process.env.TRENDING_GRAVITY),
  OFFSET: parseFloat(process.env.TRENDING_OFFSET),
  THRESHOLD: parseFloat(process.env.TRENDING_THRESHOLD),
  THRESHOLD_LONG: parseFloat(process.env.TRENDING_THRESHOLD_LONG),
};
module.exports = {
  questionTrendingScore,
};
