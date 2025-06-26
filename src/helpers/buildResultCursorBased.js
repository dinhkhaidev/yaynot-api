const buildResultCursorBased = (listData, limit) => {
  let cursorBased = {};
  cursorBased.data = listData;
  const lengthQuestionList = listData.length;
  cursorBased.nextCursor = listData[lengthQuestionList - 1]?._id;
  cursorBased.total = lengthQuestionList || 0;
  cursorBased.hasMore = lengthQuestionList === limit;
  return cursorBased;
};
module.exports = { buildResultCursorBased };
