const express = require("express");
const asyncHandle = require("../../helpers/asyncHandle");
const router = express.Router();
const ChatController = require("../../controllers/chat/index");
router.get("/conventions", asyncHandle(ChatController.getListConventionsUser));
router.get(
  "/messages/:convoId",
  asyncHandle(ChatController.getConventionMessages)
);
module.exports = router;
