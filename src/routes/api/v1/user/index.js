const express = require("express");
const router = express.Router();
// const { authentication } = require("../../../../auth/authUtil");
const { authentication } = require("../../../../auth/authUtil.hybrid");

const questionRoute = require("./question.route");
const profileRoute = require("./profile.route");
const commentRoute = require("./comment.route");
const voteRoute = require("./vote.route");
const followRoute = require("./follow.route");
const chatRoute = require("./chat.route");
const notificationRoute = require("./notification.route");
const uploadRoute = require("./upload.route");
const reportRoute = require("./report.route");

router.use(authentication);

router.use("/questions", questionRoute);
router.use("/profile", profileRoute);
router.use("/comments", commentRoute);
router.use("/votes", voteRoute);
router.use("/follows", followRoute);
router.use("/chats", chatRoute);
router.use("/notifications", notificationRoute);
router.use("/uploads", uploadRoute);
router.use("/reports", reportRoute);

module.exports = router;
