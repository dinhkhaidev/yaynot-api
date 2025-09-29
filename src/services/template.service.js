const { NotFoundError, BadRequestError } = require("../core/error.response");
const {
  findTemplateByName,
  createTemplateInDB,
} = require("../models/repositories/email.repo");
const templateModel = require("../models/template.model");

const getTemplate = async (name) => {
  const foundTemplate = await findTemplateByName(name);
  if (!foundTemplate) {
    throw new NotFoundError("Template not found!");
  }
  return foundTemplate;
};
const createTemplate = async ({ name, html }) => {
  const foundTemplate = await findTemplateByName(name);
  if (foundTemplate) {
    throw new BadRequestError("Template existed!");
  }
  return await createTemplateInDB({ name, html });
};
module.exports = { getTemplate, createTemplate };
