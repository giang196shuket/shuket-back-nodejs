const multer = require('multer');
let path = require('path');
const { messageError } = require('../helper/message');


    const storage = multer.diskStorage({
        destination: function(req, file, cb) {
              cb(null, 'src/excel');

        },
        filename: function(req, file, cb) {   
              cb(null,  file.originalname);
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