const express = require("express");
const asyncHandle = require("../../helpers/asyncHandle");
const router = express.Router();
const VoteController = require("../../controllers/vote/index");
const { validate } = require("../../middlewares/validate");
const { upsertVoteSchema } = require("../../validations/Joi/vote.validation");
const checkVotedUser = require("../../middlewares/vote/checkVotedUser");
const { checkOwnership } = require("../../middlewares/checkOwnership");
const { voteModel } = require("../../models/vote.model");
const {
  checkPublishedQuestion,
} = require("../../middlewares/checkPublishedQuestion");
router.post(
  "/",
  validate(upsertVoteSchema),
  checkPublishedQuestion(),
  asyncHandle(VoteController.upsertVote)
);
router.delete(
  "/:voteId",
  checkOwnership({
    model: voteModel,
    param: "params",
    resultId: "voteId",
    ownerField: "userId",
  }),
  asyncHandle(VoteController.deleteVote)
);
router.get(
  "/:questionId",
  checkVotedUser,
  asyncHandle(VoteController.getDetailVote)
);
module.exports = router;
