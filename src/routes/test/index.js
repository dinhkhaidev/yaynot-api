const express = require("express");
const asyncHandle = require("../../helpers/asyncHandle");
const { OK } = require("../../core/success.response");
const { authentication } = require("../../auth/authUtil");
const router = express.Router();
router.get(
  "/",
  authentication,
  asyncHandle((req, res) => {
    // console.log("req", req);
    // console.log("reqheader", req.header("test123"));
    console.log("req.keyToken", req.keyToken);
    console.log("req.user", req.user);
    console.log("req.refreshToken", req.refreshToken);
    new OK({ message: "Test successful!" }).send(res);
  })
);
module.exports = router;
