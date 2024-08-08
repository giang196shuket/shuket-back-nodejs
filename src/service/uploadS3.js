const multer = require("multer");

const storage = multer.memoryStorage();


const fileFilter = (req, file, cb) => {
  console.log(file)
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
    cb(null, true);
  } else {
    cb(null, false, req.multerError = messageError.mimetypeNotValid);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

const AWS = require("aws-sdk");
const { messageError } = require("../helper/message");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

module.exports = { s3, upload};
