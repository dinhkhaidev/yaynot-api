const Joi = require("joi");
const upsertVoteSchema = Joi.object({
  questionId: Joi.string().hex().length(24).required(),
  voteType: Joi.bool().required(),
});
module.exports = {
  upsertVoteSchema,
};
