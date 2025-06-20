const { CREATED, OK } = require("../../core/success.response");
const VoteService = require("../../services/vote.service");

class VoteController {
  upsertVote = async (req, res, next) => {
    new OK({
      message: "Vote successful!",
      metadata: await VoteService.upsertVote({
        ...req.body,
        userId: req.user.user_id,
      }),
    }).send(res);
  };
  deleteVote = async (req, res, next) => {
    new OK({
      message: "Unvote successful!",
      metadata: await VoteService.deleteVote(req.params.voteId),
    }).send(res);
  };
  getDetailVote = async (req, res, next) => {
    new OK({
      message: "Get detail vote successful!",
      metadata: await VoteService.getDetailVote({
        questionId: req.params.questionId,
        myVote: req.voteUser.voteType,
      }),
    }).send(res);
  };
}
module.exports = new VoteController();
