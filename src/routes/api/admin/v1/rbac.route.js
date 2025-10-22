const express = require("express");
const router = express.Router();
const RbacController = require("../../../../controllers/rbac/index");
const asyncHandle = require("../../../../helpers/asyncHandle");

router.post("/resource", asyncHandle(RbacController.createResource));
router.post("/role", asyncHandle(RbacController.createRole));
router.get("/resource", asyncHandle(RbacController.getListResource));
router.get("/role", asyncHandle(RbacController.getListRole));

module.exports = router;
