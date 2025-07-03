const conventionModel = require("../convention.model");

const createConventionInDB = (payload) => {
  return conventionModel.create(payload);
};
module.exports = { createConventionInDB };
