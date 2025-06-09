const Joi = require("joi");
const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(30).required(),
  password: Joi.string().min(6).required(),
});
const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
const logoutUserSchema = Joi.object({
  id: Joi.string().id().required(),
  token: Joi.string()
    .pattern(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/)
    .required(),
});
module.exports = { createUserSchema, loginUserSchema, logoutUserSchema };
