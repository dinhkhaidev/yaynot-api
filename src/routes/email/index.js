const express = require("express");
const asyncHandle = require("../../helpers/asyncHandle");
const router = express.Router();
const emailController = require("../../controllers/email/index");
router.post("/new-template", asyncHandle(emailController.createTemplate));
router.post("/resend", asyncHandle(emailController.resendOtp));
module.exports = router;
