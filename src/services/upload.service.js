const { cloudinary } = require("../configs/cloudinary.config");
const streamifier = require("streamifier");
class UploadService {
  //using with many route, but need combine between two api. 1 for upload, 1 for update logic code to image.
  //non-composite API
  static async uploadImageByType({ type, file, userId, dataURI, resize }) {
    const { w = 600, h = 600 } = resize;
    const folderPath = type;
    const buffer = file.buffer;
    const publicId = `${type}-${userId}-${Date.now()}`;
    // const result = await cloudinary.uploader.upload(dataURI, {
    //   folder: folderPath,
    //   public_id: publicId,
    // });
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderPath,
          public_id: publicId,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
    const imageType = cloudinary.image(result.public_id, {
      transformation: {
        width: w,
        height: h,
        crop: "fill",
        gravity: "center",
      },
    });
    // const imageAvatar = cloudinary.image(result.public_id, {
    //   sign_url: true,
    //   type: "facebook",
    // });
    return {
      image: result.url,
      type: result.format,
      imageType,
    };
  }
}
module.exports = UploadService;
