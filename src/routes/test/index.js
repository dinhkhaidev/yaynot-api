const express = require("express");
const asyncHandle = require("../../helpers/asyncHandle");
const { OK } = require("../../core/success.response");
const { authentication } = require("../../auth/authUtil");
const { checkOwnership } = require("../../middlewares/checkOwnership");
const questionModel = require("../../models/question.model");
const TagService = require("../../services/tag.service");
const router = express.Router();
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
module.exports = router;
