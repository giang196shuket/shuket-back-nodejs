const multer = require('multer');
let path = require('path');
const fs = require('fs');
const { messageError } = require('../helper/message');


    const storage = multer.diskStorage({
        destination: function(req, file, cb) {
          const folder = "src/file/"+req.body.action+"/"+req.body.mart_code

          if (fs.existsSync(folder)) {
            // Nếu tồn tại, xóa thư mục
            fs.rmdirSync(folder, { recursive: true });
          }
          
          fs.mkdir(folder, (err) => {
            if (err) {
              cb(null, false, req.multerError = messageError.uploadFailed);
            } else {
              console.log('Thư mục đã được tạo thành công!');
            }
          });
          cb(null, folder);

        },
        filename: function(req, file, cb) {   
              req.dataResponse = `${req.body.mart_code}-${req.body.action}-` + new Date().getTime().toString().substring(0,10) + file.originalname.substring(file.originalname.lastIndexOf('.'),file.originalname.length)
              cb(null,  `${req.body.mart_code}-${req.body.action}-` + new Date().getTime().toString().substring(0,10) + file.originalname.substring(file.originalname.lastIndexOf('.'),file.originalname.length));
        }
    });
    
    
    const fileFilter = (req, file, cb) => {
        if (file.mimetype === 'text/csv') {
          cb(null, true);
        } else {
          cb(null, false, req.multerError = messageError.mimetypeNotValid);
        }
      };
      
    const uploadStatic = multer({ storage:storage, fileFilter:fileFilter,limits: {fileSize: 100000000}} );

module.exports = uploadStatic