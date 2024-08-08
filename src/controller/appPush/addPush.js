const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { responseSuccess, responseDataList, responseImageBannerCouponList, responseErrorInput } = require("../../helper/response");

module.exports = {
   async insertImageEditor(req, res, next) {
      if (req.multerError) {
         return res.status(500).json(responseErrorInput(req.multerError));
      }

      console.log('file', req.file)
      // const image = sharp(req.file.buffer);

      // const resizedImageBuffer = await image
      //    .resize(200, 200,{
      //     fit:"contain",
      //     position:"center"
      //    }) 
      //    .toBuffer();
      // fs.writeFileSync(`src/upload/event/description/${req.file.originalname}`, resizedImageBuffer);


      const dataResponse = {
         fileName: req.file.originalname,
         uploaded: 1,
         url: `http://localhost:8000/upload/event/description/${req.file.originalname}`, // Adjust as necessary
      };

      return res.status(200).json(dataResponse);
   },
};
