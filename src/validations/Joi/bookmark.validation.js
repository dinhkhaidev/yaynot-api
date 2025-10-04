const Joi = require("joi");

const bookmarkSchema = Joi.object({
  questionId: Joi.string().hex().length(24).required(),
});
module.exports = {
  bookmarkSchema,
};
