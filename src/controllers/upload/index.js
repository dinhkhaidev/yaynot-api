const { BadRequestError } = require("../../core/error.response");
const { OK } = require("../../core/success.response");
const UploadService = require("../../services/upload.service");

class UploadController {
  uploadImageByType = async (req, res, next) => {
    const { file } = req;
    if (!file) {throw new BadRequestError("Missing file!");}
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    new OK({
      message: "Upload avatar successful!",
      metadata: await UploadService.uploadImageByType({
        type: req.params.type,
        resize: req.query,
        file,
        userId: req.user.user_id,
        dataURI,
      }),
    }).send(res);
  };
}
module.exports = new UploadController();
