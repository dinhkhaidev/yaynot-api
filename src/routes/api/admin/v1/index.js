const express = require("express");
const router = express.Router();
const { authentication } = require("../../../../auth/authUtil");
const userRole = require("../../../../constants/userRole");

const checkAdminRole = (req, res, next) => {
  if (req.user.role !== userRole.ADMIN) {
    return res
      .status(403)
      .json({ message: "Access denied. Admin role required." });
  }
  next();
};

const questionRoute = require("./question.route");
const commentRoute = require("./comment.route");
const voteRoute = require("./vote.route");
const rbacRoute = require("./rbac.route");
const notificationRoute = require("./notification.route");
const emailRoute = require("./email.route");
const reportRoute = require("./report.route");

router.use(authentication);
router.use(checkAdminRole);

router.use("/questions", questionRoute);
router.use("/comments", commentRoute);
router.use("/votes", voteRoute);
router.use("/rbac", rbacRoute);
router.use("/notifications", notificationRoute);
router.use("/emails", emailRoute);
router.use("/reports", reportRoute);

module.exports = router;
