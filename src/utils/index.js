const _ = require("lodash");
const mongoose = require("mongoose");
const convertToObjectId = (id) => {
  return new mongoose.Types.ObjectId(id);
};
const getInfoData = ({ object = {}, field = [] }) => {
  return _.pick(object, field);
};
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((item) => [item, 1]));
};
const getUnselectData = (unselect = []) => {
  return Object.fromEntries(unselect.map((item) => [item, 0]));
};
const getIdSlice = (string, number = -6) => {
  return string.slice(number);
};
module.exports = {
  convertToObjectId,
  getInfoData,
  getSelectData,
  getUnselectData,
  getIdSlice,
};
