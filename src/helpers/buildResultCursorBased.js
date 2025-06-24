const buildResultCursorBased = ({ questonList, limit }) => {
  let cursorBased = {};
  cursorBased.data = questonList;
  const lengthQuestionList = questonList.length;
  cursorBased.nextCursor = questonList[lengthQuestionList - 1]?._id;
  cursorBased.total = lengthQuestionList || 0;
  cursorBased.hasMore = lengthQuestionList === limit;
  return cursorBased;
};
module.exports = { buildResultCursorBased };
