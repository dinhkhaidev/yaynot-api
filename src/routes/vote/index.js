const express = require("express");
const asyncHandle = require("../../helpers/asyncHandle");
const router = express.Router();
const VoteController = require("../../controllers/vote/index");
const { validate } = require("../../middlewares/validate");
const { upsertVoteSchema } = require("../../validations/Joi/vote.validation");
router.post(
  "/",
  validate(upsertVoteSchema),
  asyncHandle(VoteController.upsertVote)
);
router.delete(
  "/:voteId",
  // validate(upsertVoteSchema),
  asyncHandle(VoteController.deleteVote)
);
module.exports = router;
