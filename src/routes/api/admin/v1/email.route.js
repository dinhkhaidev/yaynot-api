const express = require("express");
const router = express.Router();
const emailController = require("../../../../controllers/email/index");
const asyncHandle = require("../../../../helpers/asyncHandle");

router.post("/template", asyncHandle(emailController.createTemplate));

module.exports = router;
