const { messageError, messageSuccess } = require("../helper/message");
const { responseSuccess, responseErrorData, responseErrorInput } = require("../helper/response");
const moment = require("moment");
const mainModel = require("../model/main/main");



module.exports = {


  async uploadFile(req, res, next) {
    if (req.multerError) {
      return res
      .status(500)
      .json(responseErrorInput(req.multerError));
  }
    try {
        // const workbook = xlsx.readFile(req.file.path);

        // const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // const data = xlsx.utils.sheet_to_json(worksheet, { header: 0 });
        const dataResponse = {file_name: req.dataResponse}
          return res
            .status(200)
            .json(responseSuccess(200, messageSuccess.Success, dataResponse));
        
    } catch (error) {
      return res
            .status(500)
            .json(responseErrorInput( error));
    }
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
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
};
