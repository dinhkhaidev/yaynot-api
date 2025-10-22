const express = require("express");
const router = express.Router();
const emailController = require("../../../../controllers/email/index");
const asyncHandle = require("../../../../helpers/asyncHandle");

router.post("/resend", asyncHandle(emailController.resendOtp));

module.exports = router;
