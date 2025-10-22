const express = require("express");
const router = express.Router();
const UploadController = require("../../../../controllers/upload/index");
const { uploadMemory } = require("../../../../configs/multer.config");
const asyncHandle = require("../../../../helpers/asyncHandle");
const { validate } = require("../../../../middlewares/validate");
const {
  uploadImageParamSchema,
  uploadImageQuerySchema,
} = require("../../../../validations/Joi/upload.validation");

router.post(
  "/:type",
  validate(uploadImageParamSchema, "params"),
  validate(uploadImageQuerySchema, "query"),
  uploadMemory.single("image"),
  asyncHandle(UploadController.uploadImageByType)
);

module.exports = router;
