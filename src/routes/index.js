const express = require("express");
const router = express.Router();
router.use("/v1/auth", require("./access/index"));
module.exports = router;
