const multer = require("multer");
let path = require("path");
const fs = require("fs");
const { messageError } = require("../helper/message");


const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      const folder = "src/upload" + req.query.currentFolder;

      if (!fs.existsSync(folder)) {
         // Nếu ko tồn tại, tạo thư mục
         
         
         fs.mkdir(folder, (err) => {
            if (err) {
               console.log(err)
               cb(null, false, (req.multerError = messageError.uploadFailed));
            } else {
               // console.log('Thư mục đã được tạo thành công !');
            }
         });
      }

      cb(null, folder);
   },
   filename: function (req, file, cb) {
      cb(null, `${file.originalname}`);
   },
});

const fileFilter = (req, file, cb) => {
      cb(null, true);

};

const uploadStaticApp = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 100000000 } });


// const storage = multer.memoryStorage(); // Use memory storage to process files in memory

// const uploadStaticApp = multer({
//    storage: storage,
//    fileFilter: (req, file, cb) => {
//      cb(null, true);
//    },
//    limits: { fileSize: 100000000 } 
//  });
module.exports = uploadStaticApp;
