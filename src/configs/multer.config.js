const multer = require("multer");
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: 3 * 1024 * 1024,
}); //max 3 mb for upload image
module.exports = { uploadMemory };
