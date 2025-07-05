const express = require("express");
const asyncHandle = require("../../helpers/asyncHandle");
const { OK } = require("../../core/success.response");
const { authentication } = require("../../auth/authUtil");
const { checkOwnership } = require("../../middlewares/checkOwnership");
const questionModel = require("../../models/question.model");
const TagService = require("../../services/tag.service");
const { likeCommentByAction } = require("../../services/nestedComment.service");
const CommentService = require("../../services/nestedComment.service");
const { validate } = require("../../middlewares/validate");
const {
  createUserProfileSchema,
} = require("../../validations/Joi/userProfile.validation");
const UserProfileService = require("../../services/userProfile.service");
const { convertToObjectId } = require("../../utils");
const ChatService = require("../../services/chat.service");
const router = express.Router();
const {
  createMessageSchema,
} = require("../../validations/Joi/chat.validation");
router.get(
  "/",
  authentication,
  checkOwnership({
    model: questionModel,
    param: "body",
    resultId: "userId",
    ownerField: "userId",
  }),
  asyncHandle((req, res) => {
    // console.log("req", req);
    // console.log("reqheader", req.header("test123"));
    // console.log("req.keyToken", req.keyToken);
    // console.log("req.user", req.user);
    // console.log("req.refreshToken", req.refreshToken);
    // console.log("process.env.TTL_BLACKLIST", process.env.TTL_BLACKLIST);
    new OK({ message: "Test successful!" }).send(res);
  })
);
router.get("/tag", async (req, res, next) => {
  const data = await TagService.getTagByName("test");
  res.json(data);
});
router.use(authentication);
router.post("/like", async (req, res, next) => {
  const data = await CommentService.likeCommentByAction({
    commentId: "68501e32dfd2c0c391226469",
    action: "like",
    userId: "684258356ae030f2261dea1c",
  });
  res.json(data);
});
router.delete("/like", async (req, res, next) => {
  const data = await CommentService.likeCommentByAction({
    commentId: "68501e32dfd2c0c391226469",
    action: "unlike",
    userId: "684258356ae030f2261dea1c",
  });
  res.json(data);
});
router.post(
  "/user-profile",
  validate(createUserProfileSchema),
  async (req, res, next) => {
    // res.json(req.body);
    const data = await UserProfileService.upsertUserProfile({
      ...req.body,
      userId: convertToObjectId(req.user.user_id),
    });
    res.json(data);
  }
);
router.post(
  "/messages",
  validate(createMessageSchema),
  asyncHandle(async (req, res, next) => {
    res.json(
      await ChatService.createMessage({
        content: "Xin chao1",
        convoId: "68688e5f06666e4532544605",
        senderId: "6862581564c4f74e37bed3a5",
        receiveId: "6862581564c4f74e37bed3a4",
      })
    );
  })
);
router.get(
  "/conventions",
  // validate(createMessageSchema),
  asyncHandle(async (req, res, next) => {
    res.json(
      await ChatService.getListConventionsUser({
        userId: "6862581564c4f74e37bed3a4",
      })
    );
  })
);
router.get(
  "/messages",
  // validate(createMessageSchema),
  asyncHandle(async (req, res, next) => {
    res.json(
      await ChatService.getConventionMessages({
        convoId: "68688e5f06666e4532544605",
      })
    );
  })
);
router.delete(
  "/messages",
  // validate(createMessageSchema),
  asyncHandle(async (req, res, next) => {
    res.json(
      await ChatService.deleteMessage({ messageId: "68677f6d963999c3f807f259" })
    );
  })
);
module.exports = router;
