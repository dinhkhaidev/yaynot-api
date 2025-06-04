const express = require("express");
const router = express.Router();
const AccessController = require("../../controllers/access/index");
router.get("/", AccessController.signUp);
module.exports = router;
