const { BadRequestError } = require("../../../core/error.response");

class QuestionContent {
  constructor(title, content) {
    this.validate(title, content);
    this._title = title.trim();
    this._content = content.trim();
  }

  validate(title, content) {
    if (!title || typeof title !== "string") {
      throw new BadRequestError("Title is required and must be a string");
    }

    if (!content || typeof content !== "string") {
      throw new BadRequestError("Content is required and must be a string");
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (trimmedTitle.length === 0) {
      throw new BadRequestError("Title cannot be empty");
    }

    if (trimmedContent.length === 0) {
      throw new BadRequestError("Content cannot be empty");
    }

    if (trimmedTitle.length < 10) {
      throw new BadRequestError("Title must be at least 10 characters long");
    }

    if (trimmedTitle.length > 300) {
      throw new BadRequestError("Title must not exceed 300 characters");
    }

    if (trimmedContent.length < 20) {
      throw new BadRequestError("Content must be at least 20 characters long");
    }

    if (trimmedContent.length > 10000) {
      throw new BadRequestError("Content must not exceed 10000 characters");
    }
  }

  get title() {
    return this._title;
  }

  get content() {
    return this._content;
  }

  getTitleLength() {
    return this._title.length;
  }

  getContentLength() {
    return this._content.length;
  }

  getTitlePreview(length = 50) {
    if (this._title.length <= length) {
      return this._title;
    }
    return this._title.substring(0, length) + "...";
  }

  getContentPreview(length = 150) {
    if (this._content.length <= length) {
      return this._content;
    }
    return this._content.substring(0, length) + "...";
  }

  containsKeyword(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    return (
      this._title.toLowerCase().includes(lowerKeyword) ||
      this._content.toLowerCase().includes(lowerKeyword)
    );
  }

  toObject() {
    return {
      title: this._title,
      content: this._content,
    };
  }

  static fromObject(obj) {
    return new QuestionContent(obj.title, obj.content);
  }
}

module.exports = QuestionContent;
