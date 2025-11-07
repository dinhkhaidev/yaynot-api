const mongoose = require("mongoose");
const { isObjectId } = require("../../utils/validateType");
const { findQuestionById } = require("../../models/repositories/question.repo");
const { BadRequestError, NotFoundError } = require("../../core/error.response");

const validateUpdateQuestionPayload = (id, userId) => {
  if (!id || !isObjectId(id))
  {throw new BadRequestError("Missing field id or id invalid!");}
  if (!userId) {throw new NotFoundError("User ID is required!");}
};
const validateIdQuestionPayload = (id) => {
  if (!id || !isObjectId(id))
  {throw new BadRequestError("Missing field id or id invalid!");}
};
const validateFindQuestionById = async (
  questionId,
  options = { returnRecord: false },
) => {
  const questionRecord = await findQuestionById(questionId);
  if (!questionRecord) {throw new NotFoundError("Question not found!");}
  if (options.returnRecord === true) {
    return questionRecord;
  }
};
module.exports = {
  validateUpdateQuestionPayload,
  validateIdQuestionPayload,
  validateFindQuestionById,
};
