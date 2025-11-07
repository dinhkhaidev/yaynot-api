const Joi = require("joi");
const createConventionSchema = Joi.object({
  name: Joi.string(),
  type: Joi.string().valid("private", "group"),
  participants: Joi.array()
    .items(Joi.string())
    .required()
    .custom((value, helpers) => {
      const type = helpers.state.ancestors[0]?.type;
      if (type === "private") {
        if (value[0] === value[1]) {
          return helpers.message(
            "Participal must contain exactly 2 members another.",
          );
        }

        if (value.length !== 2) {
          return helpers.message(
            "Participal must contain exactly 2 members for private type.",
          );
        }
      }
      return value;
    }, "Custom validation for participal"),
  lastMessage: Joi.object(),
});
const createMessageSchema = Joi.object({
  content: Joi.string().required(),
  attachment: Joi.string().uri(),
  convoId: Joi.string().hex().length(24),
  senderId: Joi.string().hex().length(24).required(),
  receiveId: Joi.string().hex().length(24),
});
module.exports = { createConventionSchema, createMessageSchema };
