const logger = require("../../config/logger");
const { generate_token } = require("../service/auth");
const { messageError, messageSuccess } = require("../helper/message");
const { responseSuccess, responseErrorData } = require("../helper/response");
const partnerModel = require("../model/partner");


module.exports = {

  async getPartnerOptions(req, res, next) {
    const data = await partnerModel.getPartnerOptions()
    const listPartners = await data.map((item) => ({
      seq: item.SEQ,
      code: item.SP_CODE,
      name: item.SP_NAME
    }));
    const dataResponse = {
      list_partners: listPartners,
    };
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },

  async getPartnerSalesTeamOptions(req, res, next) {
    spCode = req.query.sp_code;
    const data = await partnerModel.getPartnerSalesTeamOptions(spCode)
    const listSalestTeam = await data.map((item) => ({
      seq: item.SEQ,
      code: item.SPT_CODE,
      name: item.SPT_NAME
    }));
    const dataResponse = {
      list_sales_team: listSalestTeam,
    };
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },


};
