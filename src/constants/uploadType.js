const uploadType = {
  AVATAR: "avatar",
  POST: "post",
  THUMB: "thumb",
  COMMENT: "comment",
};
const uploadSize = {
  AVATAR: { width: 512, height: 512 },
  POST: [
    { width: 1080, height: 1350 }, //doc
    { width: 1080, height: 1080 }, //vuong
    { width: 1080, height: 566 }, //ngang
  ],
  THUMB: { width: 320, height: 180 },
  COMMENT: { width: 640, height: 640 },
};

module.exports = { uploadType, uploadSize };
