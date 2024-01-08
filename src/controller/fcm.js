const logger = require("../../config/logger");
const { generate_token } = require("../service/auth");
const { messageError, messageSuccess } = require("../helper/message");
const { responseSuccess, responseErrorData } = require("../helper/response");
const fcmModel = require("../model/fcm");


module.exports = {

  async getPosOptions(req, res, next) {
    const data = await fcmModel.getFcmOptions()
    const listFcm = await data.map((item) => ({
      fcm_code: item.FCM_CODE,
      fcm_name: item.FCM_NAME
    }));
    const dataResponse = {
        list_fcm: listFcm,
    };
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },

};
