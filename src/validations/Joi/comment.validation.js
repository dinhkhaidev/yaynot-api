const Joi = require("joi");

const createCommentSchema = Joi.object({
  commentParentId: Joi.string().hex().length(24),
  content: Joi.string().min(2).max(300).required(),
  questionId: Joi.string().hex().length(24),
});
module.exports = { createCommentSchema };
