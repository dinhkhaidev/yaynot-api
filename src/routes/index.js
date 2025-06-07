const express = require("express");
const router = express.Router();
router.use("/v1/auth", require("./access/index"));
router.use("/v1/test", require("./test/index"));
module.exports = router;
