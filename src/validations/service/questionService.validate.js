const mongoose = require("mongoose");
const { isObjectId } = require("../../utils/validateType");

const validateUpdateQuestionPayload = (id, userId) => {
  if (!id || !isObjectId(id))
    throw new BadRequestError("Missing field id or id invalid!");
  if (!userId) throw new NotFoundError("User ID is required!");
};
module.exports = validateUpdateQuestionPayload;
