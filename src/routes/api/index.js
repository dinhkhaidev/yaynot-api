const express = require("express");
const router = express.Router();
const loggerMiddleware = require("../../middlewares/logger.middleware");

const userRoutes = require("./v1/user/index");
const adminRoutes = require("./admin/v1/index");
const { limitUser } = require("../../configs/rateLimit.config");
const authRoutes = require("./v1/auth/auth.route");
router.use("/v1/auth", authRoutes);
router.use(limitUser);
//turn off log
router.use(loggerMiddleware());
router.use("/v1", userRoutes);
router.use("/admin/v1", adminRoutes);

module.exports = router;
