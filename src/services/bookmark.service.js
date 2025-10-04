const { BadRequestError, NotFoundError } = require("../core/error.response");
const {
  createBookmarkInDB,
  deleteBookmarkInDB,
  getListBookmarkInDB,
  findBookmarkInDB,
} = require("../models/repositories/bookmark.repo");
const { findQuestionById } = require("../models/repositories/question.repo");

class BookmarkService {
  static async createBookmark({ userId, questionId }) {
    const foundQuestion = await findQuestionById(questionId);
    if (!foundQuestion) {
      throw new NotFoundError("Question not found!");
    }
    const foundBookmark = await findBookmarkInDB({ userId, questionId });
    if (foundBookmark) {
      throw new BadRequestError("Bookmark already exists");
    }
    const bookmark = await createBookmarkInDB({ userId, questionId });
    return bookmark;
  }
  static async deleteBookmark({ userId, questionId }) {
    const foundBookmark = await findBookmarkInDB({ userId, questionId });
    if (!foundBookmark) {
      throw new NotFoundError("You didn't bookmark this question!");
    }
    return await deleteBookmarkInDB({ userId, questionId });
  }
  static async getListBookmark({ userId }) {
    const bookmarks = await getListBookmarkInDB(userId);
    return bookmarks;
  }
}
module.exports = BookmarkService;
