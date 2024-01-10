const { messageError, messageSuccess } = require("../helper/message");
const { responseSuccess, responseErrorData, responseErrorInput } = require("../helper/response");
const userModel = require("../model/user");
const { mergeRoleList } = require("../helper/funtion");
const saleCollectionModel = require("../model/saleCollection");
const moment = require("moment");
const { loadImageAws } = require("../service/loadImage");
const { s3 } = require("../service/upload");
const  {getSize, getNameMartLogo}  = require("../helper/upload");
const xlsx = require('xlsx');



module.exports = {


  async uploadFile(req, res, next) {
    if (req.multerError) {
      return res
      .status(500)
      .json(responseErrorInput(req.multerError));
  }
    try {
        const workbook = xlsx.readFile(req.file.path);

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 0 });
          return res
            .status(200)
            .json(responseSuccess(200, messageSuccess.Success, data));
        
    } catch (error) {
      return res
            .status(500)
            .json(responseErrorInput( error));
    }
  },
};
