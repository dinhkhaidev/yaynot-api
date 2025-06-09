const Joi = require("joi");
const createQuestionSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  content: Joi.string().min(2).max(200).required(),
  topicId: Joi.string().hex().length(24),
  image: Joi.array().items(Joi.string()),
  tags: Joi.array().items(Joi.string()),
});
const updateQuestionSchema = Joi.object({
  title: Joi.string().min(2).max(200),
  content: Joi.string().min(2).max(200).required(),
  image: Joi.array().items(Joi.string()),
  tags: Joi.array().items(Joi.string()),
});
module.exports = { createQuestionSchema, updateQuestionSchema };
