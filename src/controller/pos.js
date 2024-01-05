const logger = require("../../config/logger");
const { generate_token } = require("../service/auth");
const { messageError, messageSuccess } = require("../helper/message");
const { responseSuccess, responseErrorData } = require("../helper/response");
const posModel = require("../model/pos");


module.exports = {

  async getPosOptions(req, res, next) {
    const data = await posModel.getPosOptions()
    const listPos = await data.map((item) => ({
      seq: item.SEQ,
      code: item.POS_CODE,
      name: item.POS_NAME
    }));
    const dataResponse = {
      list_pos: listPos,
    };
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },

};
