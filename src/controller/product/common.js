const logger = require("../../../config/logger");
const {  messageSuccess } = require("../../helper/message");
const queriesHelper = require("../../helper/queries");
const {
  responseSuccess,
} = require("../../helper/response");
const productCommonModel = require("../../model/product/common");
const moment = require("moment");


module.exports = {
  
    async updateStatus(req, res, next) {
        const {code, status} = req.body 
        const userId = req.userInfo.user_id
        const time = moment().format('YYYY-MM-DD HH:mm:ss')
        await queriesHelper.updateTableWhere('TBL_MOA_PRD_MAIN', ` P_STATUS = '${status}', M_ID = '${userId}', M_TIME = '${time}' `,
        ` P_CODE = '${code}'` )
        return res
          .status(200)
          .json(
            responseSuccess(200, messageSuccess.Success,  messageSuccess.updateSuccess)
          );
      },
    
  async getProductCategory(req, res, next) {
    const {cateParent} = req.body 
    const data = await productCommonModel.getProductCategory(cateParent, req.dataConnect.M_DB_CONNECT, req.dataConnect.M_POS_REGCODE);
    return res
      .status(200)
      .json(
        responseSuccess(200, messageSuccess.Success, data)
      );
  },
};
