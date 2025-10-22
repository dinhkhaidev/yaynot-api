const express = require("express");
const router = express.Router();
const VoteController = require("../../../../controllers/vote/index");
const asyncHandle = require("../../../../helpers/asyncHandle");
const checkVotedUser = require("../../../../middlewares/vote/checkVotedUser");

router.get(
  "/:questionId",
  checkVotedUser,
  asyncHandle(VoteController.getDetailVote)
);
router.delete("/:voteId", asyncHandle(VoteController.deleteVote));

module.exports = router;
