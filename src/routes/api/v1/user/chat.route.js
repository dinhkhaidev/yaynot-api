const express = require("express");
const router = express.Router();
const ChatController = require("../../../../controllers/chat/index");
const asyncHandle = require("../../../../helpers/asyncHandle");

router.get("/conventions", asyncHandle(ChatController.getListConventionsUser));
router.get(
  "/:convoId/messages",
  asyncHandle(ChatController.getConventionMessages),
);
router.get("/:convoId/find", asyncHandle(ChatController.searchMessage));

module.exports = router;
