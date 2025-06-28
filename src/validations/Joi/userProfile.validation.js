const Joi = require("joi");
const { gender } = require("../../constants/genderUser");
const createUserProfileSchema = Joi.object({
  name: Joi.string().min(3).max(255),
  birthday: Joi.date(),
  // location: Joi.string().min(3),
  avatar: Joi.string().uri(),
  biography: Joi.string().min(1).max(300),
  link: Joi.string().uri(),
  gender: Joi.string().valid(...Object.values(gender)),
});
const updateAvatarSchema = Joi.object({
  url: Joi.string().uri().required(),
});
module.exports = { createUserProfileSchema, updateAvatarSchema };
