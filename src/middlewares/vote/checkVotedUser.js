const {
  ForbiddenError,
  BadRequestError,
} = require("../../core/error.response");
const {
  findVoteByUserAndQuestionInDB,
} = require("../../models/repositories/vote.repo");

const checkVotedUser = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;
    const questionId = req.params.questionId || req.body.questionId;
    const safeUserId = mongoose.Types.ObjectId(userId);
    const safeQuestionId = mongoose.Types.ObjectId(questionId);
    if (!safeUserId || !safeQuestionId) {
      throw new BadRequestError("Missing userId or questionId!");
    }
    const voteRecord = await findVoteByUserAndQuestionInDB(
      safeUserId,
      safeQuestionId
    );
    if (!voteRecord) {
      throw new ForbiddenError("You haven't voted on this question!");
    }
    req.voteUser = voteRecord;
    next();
  } catch (error) {
    next(error);
  }
};
module.exports = checkVotedUser;
