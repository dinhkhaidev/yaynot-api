const keyProfile = (user_id) => {
  return `user:${user_id}`;
};
//handle with more information (watch when follow, friend,...)
const keyProfilePrivate = (userWatch, userProfile) => {
  return `user:${userWatch}:${userProfile}:private`;
};
const keyViewQuestion = (question_id) => {
  return `question:${question_id}:view`;
};
const keyFlushViewQuestion = (question_id) => {
  return `flushed:${question_id}:view`;
};
module.exports = {
  keyProfile,
  keyProfilePrivate,
  keyViewQuestion,
  keyFlushViewQuestion,
};
