const Joi = require("joi");
const { gender } = require("../../constants/genderUser");
const createUserProfileSchema = Joi.object({
  name: Joi.string().min(3).max(255),
  birthday: Joi.date(),
  // location: Joi.string().min(3),
  avatar: Joi.link(),
  biography: Joi.string().min(1).max(300),
  link: Joi.link(),
  gender: Joi.string().valid(...Object.values(gender)),
});
module.exports = { createUserProfileSchema };
