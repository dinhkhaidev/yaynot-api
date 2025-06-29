const Joi = require("joi");
const followUserSchema = Joi.object({
  followingId: Joi.string().hex().length(24).required(),
});
module.exports = { followUserSchema };
