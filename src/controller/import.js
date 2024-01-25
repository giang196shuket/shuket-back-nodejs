const { messageError, messageSuccess } = require("../helper/message");
const { responseSuccess, responseErrorData, responseErrorInput } = require("../helper/response");
const moment = require("moment");



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

};
