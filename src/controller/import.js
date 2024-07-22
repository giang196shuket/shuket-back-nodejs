const { messageError, messageSuccess } = require("../helper/message");
const { responseSuccess, responseErrorData, responseErrorInput } = require("../helper/response");
const moment = require("moment");
const mainModel = require("../model/main/main");
const xlsx = require("xlsx");
const fs = require('fs');

module.exports = {
   async uploadFile(req, res, next) {
      if (req.multerError) {
         return res.status(500).json(responseErrorInput(req.multerError));
      }
      try {
         const workbook = xlsx.readFile(req.file.path);
         const worksheet = workbook.Sheets[workbook.SheetNames[0]];
         const data = xlsx.utils.sheet_to_json(worksheet, { header: 0 });
         console.log("data CSV  ===> ", data)

         const dataDuplicate = [
            {
               p_barcode: 1231231,
               p_name: "SUA",
            },
            {
               p_barcode: 5554621,
               p_name: "CA",
            },
         ];
         console.log("data duplicate  ===> ", dataDuplicate)
         const dataResponse = data.map((ele) => {
            return {
               ...ele,
               duplicate: dataDuplicate.find((fi) => fi.p_barcode === ele.p_barcode) ? true : false,
            };
         });
         console.log("data response ===> ", dataResponse)

         // const dataResponse = {file_name: req.dataResponse}
         return res.status(200).json(responseSuccess(200, messageSuccess.Success, dataResponse));
      } catch (error) {
         return res.status(500).json(responseErrorInput(error));
      }
   },
   async ConfirmImport (req, res, next) {
    console.log("data confirm ===> ", req.body.data)
    const folder = "src/file/"+req.body.action+"/"+req.body.mart_code

    if (fs.existsSync(folder)) {
      // Nếu tồn tại, xóa thư mục
      fs.rmdirSync(folder, { recursive: true });
    }
    return res.status(200).json(responseSuccess(200, messageSuccess.Success, true));

   },
   async getListMartImport(req, res, next) {
      const user = req.userInfo;
      let userId = null;
      const rows = await mainModel.getListMartImport();
      if (user.is_change === 1) {
         userId = user.old_userid;
      } else {
         userId = user.user_id;
      }
      const account = await mainModel.getAccountImport(userId);
      const dataResponse = {
         total_cnt: rows.length,
         listmart: rows,
         account: account.U_NAME,
      };
      return res.status(200).json(responseSuccess(200, messageSuccess.Success, dataResponse));
   },
};
