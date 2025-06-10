const mongoose = require("mongoose");
const { isObjectId } = require("../../utils/validateType");
const { findQuestionById } = require("../../models/repositories/question.repo");

const validateUpdateQuestionPayload = (id, userId) => {
  if (!id || !isObjectId(id))
    throw new BadRequestError("Missing field id or id invalid!");
  if (!userId) throw new NotFoundError("User ID is required!");
};
const validateIdQuestionPayload = (id) => {
  if (!id || !isObjectId(id))
    throw new BadRequestError("Missing field id or id invalid!");
};
const validateFindQuestionById = async (questionId) => {
  const questionRecord = await findQuestionById(questionId);
  if (!questionRecord) throw new NotFoundError("Question not found!");
};
module.exports = {
  validateUpdateQuestionPayload,
  validateIdQuestionPayload,
  validateFindQuestionById,
};
