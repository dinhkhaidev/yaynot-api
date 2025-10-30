const Question = require("../../../models/question.model");
const { nestedComment } = require("../../../models/nestedComment.model");
const targetType = require("../../../constants/targetType");
const actionTaken = require("../../../constants/actionTaken");

class ContentAction {
  async execute(targetType, targetId) {
    throw new Error("execute() must be implemented");
  }
}

class HideContentAction extends ContentAction {
  async execute(type, targetId) {
    const handlers = {
      [targetType.QUESTION]: this._hideQuestion.bind(this),
      [targetType.COMMENT]: this._hideComment.bind(this),
    };

    const handler = handlers[type];
    if (handler) {
      await handler(targetId);
    }
  }

  async _hideQuestion(targetId) {
    await Question.findByIdAndUpdate(targetId, {
      visibility: "private",
      moderationStatus: "warn",
    });
  }

  async _hideComment(targetId) {
    await nestedComment.findByIdAndUpdate(targetId, {
      content: "[This content has been hidden by moderators]",
    });
  }
}

class DeleteContentAction extends ContentAction {
  async execute(type, targetId) {
    const handlers = {
      [targetType.QUESTION]: this._deleteQuestion.bind(this),
      [targetType.COMMENT]: this._deleteComment.bind(this),
    };

    const handler = handlers[type];
    if (handler) {
      await handler(targetId);
    }
  }

  async _deleteQuestion(targetId) {
    await Question.findByIdAndUpdate(targetId, {
      isDeleted: true,
      moderationStatus: "ban",
    });
  }

  async _deleteComment(targetId) {
    await nestedComment.findByIdAndDelete(targetId);
  }
}

class WarnUserAction extends ContentAction {
  async execute(type, targetId) {
    console.log(`[TODO] Warn user for ${type}:${targetId}`);
  }
}

class BanUserAction extends ContentAction {
  async execute(type, targetId) {
    console.log(`[TODO] Ban user for ${type}:${targetId}`);
  }
}

class RestrictUserAction extends ContentAction {
  async execute(type, targetId) {
    console.log(`[TODO] Restrict user for ${type}:${targetId}`);
  }
}

class NoAction extends ContentAction {
  async execute() {}
}

class ContentActionFactory {
  static getAction(actionType) {
    const actions = {
      [actionTaken.HIDE_CONTENT]: new HideContentAction(),
      [actionTaken.DELETE_CONTENT]: new DeleteContentAction(),
      [actionTaken.WARN_USER]: new WarnUserAction(),
      [actionTaken.BAN_USER]: new BanUserAction(),
      [actionTaken.RESTRICT_USER]: new RestrictUserAction(),
      [actionTaken.NONE]: new NoAction(),
    };

    return actions[actionType] || new NoAction();
  }
}

module.exports = {
  ContentAction,
  HideContentAction,
  DeleteContentAction,
  WarnUserAction,
  BanUserAction,
  RestrictUserAction,
  NoAction,
  ContentActionFactory,
};
