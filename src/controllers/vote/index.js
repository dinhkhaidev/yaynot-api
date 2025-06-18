const { CREATED } = require("../../core/success.response");
const VoteService = require("../../services/vote.service");

class VoteController {
  createVote = async (req, res, next) => {
    new CREATED({
      message: "Create vote successful!",
      metadata: await VoteService.createVote({
        ...req.body,
        userId: req.user.user_id,
      }),
    });
  };
}
module.exports = new VoteController();
