const AWS = require("aws-sdk");
const S3_CONFIG = require("../../configs/s3.config");

// Configure AWS
AWS.config.update({
  accessKeyId: S3_CONFIG.ACCESS_KEYID,
  secretAccessKey: S3_CONFIG.SECRETACCESSKEY,
  region: S3_CONFIG.REGION,
});

const s3 = new AWS.S3();

// Upload file
async function uploadFile(file, bucket, key) {
  const params = {
    Bucket: bucket,
    Key: key,
    Body: file,
  };

  try {
    const data = await s3.upload(params).promise();
    console.log("File uploaded successfully:", data.Location);
    return data.Location;
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
}

// Download file
async function getFile(bucket, key) {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    const data = await s3.getObject(params).promise();
    return data.Body;
  } catch (err) {
    console.error("Error getting file:", err);
    throw err;
  }
}

module.exports = { uploadFile, getFile };
