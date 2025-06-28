const Joi = require("joi");
const { uploadType } = require("../../constants/uploadType");
const uploadImageParamSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(uploadType))
    .required(),
});
const uploadImageQuerySchema = Joi.object({
  w: Joi.number().required(),
  h: Joi.number().required(),
});
module.exports = { uploadImageParamSchema, uploadImageQuerySchema };
