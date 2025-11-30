//auth
const keyAuthPublicKey = (user_id) => {
  return `auth:publicKey:${user_id}`;
};

const keyAuthKeyToken = (user_id) => {
  return `auth:keyToken:${user_id}`;
};

const keyAuthBlacklist = (token) => {
  // Use first 16 chars of token as key (unique enough)
  return `auth:blacklist:${token.substring(-16)}`;
};

const keyAuthSession = (session_id) => {
  return `auth:session:${session_id}`;
};

const keyOtpToken = (email) => {
  return `otp:token:${email}`;
};

//profile
const keyProfile = (user_id) => {
  return `user:${user_id}`;
};
//handle with more information (watch when follow, friend,...)
const keyProfilePrivate = (userWatch, userProfile) => {
  return `user:${userWatch}:${userProfile}:private`;
};
//question
const keyViewQuestion = (question_id) => {
  return `question:${question_id}:view`;
};
const keyFlushViewQuestion = (question_id) => {
  return `flushed:${question_id}:view`;
};
const keyShareQuestion = (question_id) => {
  return `question:${question_id}:share`;
};
const keyFlushShareQuestion = (question_id) => {
  return `flushed:${question_id}:share`;
};
const keyQuestion = (question_id) => {
  return `question:${question_id}`;
};
//trending question
const keyTrendingQuestionShort = () => {
  return `trending:question:short`;
};
const keyTrendingQuestionLong = () => {
  return `trending:question:long`;
};
const keyTrendingUserSeen = (userId) => {
  return `trending:question:${userId}:seen`;
};
module.exports = {
  keyProfile,
  keyProfilePrivate,
  keyViewQuestion,
  keyFlushViewQuestion,
  keyShareQuestion,
  keyFlushShareQuestion,
  keyQuestion,
  keyAuthPublicKey,
  keyAuthKeyToken,
  keyAuthBlacklist,
  keyAuthSession,
  keyOtpToken,
  keyTrendingQuestionShort,
  keyTrendingQuestionLong,
  keyTrendingUserSeen,
};
