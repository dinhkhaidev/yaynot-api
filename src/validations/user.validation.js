const Joi = require("joi");
const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(30).required(),
  password: Joi.string().min(6).required(),
});
module.exports = { createUserSchema };
