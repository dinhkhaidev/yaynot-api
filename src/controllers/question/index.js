const { CREATED, OK } = require("../../core/success.response");
const QuestionService = require("../../services/question.service");
const BookmarkService = require("../../services/bookmark.service");
class QuestionController {
  //question methods
  createQuestion = async (req, res, next) => {
    new CREATED({
      message: "Create question successful!",
      metadata: await QuestionService.createQuestion({
        ...req.body,
        userId: req.user.user_id,
      }),
    }).send(res);
  };
  updateQuestion = async (req, res, next) => {
    new OK({
      message: "Update question successful!",
      metadata: await QuestionService.updateQuestion({
        ...req.body,
        id: req.params.id,
        userId: req.user.user_id,
      }),
    }).send(res);
  };
  getListQuestion = async (req, res, next) => {
    new OK({
      message: "Get list question successful!",
      metadata: await QuestionService.getListQuestion({
        ...req.query,
        id: req.user.user_id,
      }),
    }).send(res);
  };
  getQuestionById = async (req, res, next) => {
    new OK({
      message: "Get question by id successful!",
      metadata: await QuestionService.getQuestionById(req.params.questionId),
    }).send(res);
  };
  softDeleteQuestion = async (req, res, next) => {
    new OK({
      message: "Soft delete question successful!",
      metadata: await QuestionService.softDeleteQuestion(req.params.questionId),
    }).send(res);
  };
  hardDeleteQuestion = async (req, res, next) => {
    new OK({
      message: "Hard delete question successful!",
      metadata: await QuestionService.hardDeleteQuestion(req.params.questionId),
    }).send(res);
  };
  getAllDraftQuestion = async (req, res, next) => {
    new OK({
      message: "Get all draft question successful!",
      metadata: await QuestionService.getAllDraftQuestion({
        ...req.query,
        id: req.user.user_id,
      }),
    }).send(res);
  };
  getAllPublishQuestion = async (req, res, next) => {
    new OK({
      message: "Get all publish question successful!",
      metadata: await QuestionService.getAllPublishQuestion({
        ...req.query,
        id: req.params.questionId,
      }),
    }).send(res);
  };
  //pivacy control
  changeQuestionStatus = async (req, res, next) => {
    new OK({
      message: "Change status for question successful!",
      metadata: await QuestionService.changeQuestionStatusFactory({
        resource: req.resource,
        payload: {
          questionId: req.params.questionId,
          newStatus: req.body.newStatus,
        },
      }),
    }).send(res);
  };
  changeVisibilityQuestion = async (req, res, next) => {
    new OK({
      message: "Change visibility for question successful!",
      metadata: await QuestionService.changeVisibilityQuestion({
        resource: req.resource,
        payload: {
          questionId: req.params.questionId,
          visibility: req.body.visibility,
        },
      }),
    }).send(res);
  };

  // Bookmark methods
  bookmarkQuestion = async (req, res, next) => {
    new CREATED({
      message: "Bookmark question successful!",
      metadata: await BookmarkService.createBookmark({
        userId: req.user.user_id,
        questionId: req.params.questionId,
      }),
    }).send(res);
  };

  unbookmarkQuestion = async (req, res, next) => {
    new OK({
      message: "Unbookmark question successful!",
      metadata: await BookmarkService.deleteBookmark({
        userId: req.user.user_id,
        questionId: req.params.questionId,
      }),
    }).send(res);
  };

  getListBookmark = async (req, res, next) => {
    new OK({
      message: "Get list bookmark successful!",
      metadata: await BookmarkService.getListBookmark({
        userId: req.user.user_id,
      }),
    }).send(res);
  };
}
module.exports = new QuestionController();
