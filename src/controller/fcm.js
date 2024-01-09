const logger = require("../../config/logger");
const { messageError, messageSuccess } = require("../helper/message");
const { responseSuccess, responseErrorData } = require("../helper/response");
const fcmModel = require("../model/fcm");
const {  adminFCM1, adminFCM2 } = require("../service/fcm");

module.exports = {

  async getFcmOptions(req, res, next) {
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


   async postNotification(req, res, next) {
    const admin =  req.body.FCM === 'FCM0000001' ? adminFCM1 : adminFCM2

    const data = {
      data:  {...req.body.message, sendBy: req.body.FCM},
      token: req.body.NT_DEVC_TOKEN
    };

    admin.messaging().send(data)
      .then((response) => {
        return res
        .status(200)
        .json(responseSuccess(200, messageSuccess.Success, messageSuccess.Success));
      })
      .catch((error) => {
        return res
        .status(200)
        .json(responseSuccess(500, messageError.ErrorServer,  error));
      });
  
  },
  async postNotificationSchedule(req, res, next) {
    const admin =  req.body.FCM === 'FCM0000001' ? adminFCM1 : adminFCM2

    const data = {
      data:  {...req.body.message, sendBy: req.body.FCM},
      token: req.body.NT_DEVC_TOKEN
    };

    admin.messaging().send(data)
      .then((response) => {
        return res
        .status(200)
        .json(responseSuccess(200, messageSuccess.Success, messageSuccess.Success));
      })
      .catch((error) => {
        return res
        .status(200)
        .json(responseSuccess(500, messageError.ErrorServer,  error));
      });
  
  },
  

  
  async postNotificationByTopic(req, res, next) {
    const admin =  req.body.FCM === 'FCM0000001' ? adminFCM1 : adminFCM2

    const data = {
      data:  {...req.body.message, sendBy: req.body.FCM},
      topic: req.body.topic
    };

    admin.messaging().send(data)
      .then((response) => {
        return res
        .status(200)
        .json(responseSuccess(200, messageSuccess.Success, messageSuccess.Success));
      })
      .catch((error) => {
        return res
        .status(200)
        .json(responseSuccess(500, messageError.ErrorServer,  error));
      });
  
  },
   
  async subcribeTopic(req, res, next) {
    const admin =  req.body.FCM === 'FCM0000001' ? adminFCM1 : adminFCM2

    admin.messaging().subscribeToTopic(req.body.NT_DEVC_TOKEN_LIST, req.body.topic)
      .then((response) => {
        return res
        .status(200)
        .json(responseSuccess(200, messageSuccess.Success, messageSuccess.Success));
      })
      .catch((error) => {
        return res
        .status(200)
        .json(responseSuccess(500, messageError.ErrorServer,  error));
      });
  
  },
  async unsubcribeTopic(req, res, next) {
    const admin =  req.body.FCM === 'FCM0000001' ? adminFCM1 : adminFCM2
    
    admin.messaging().unsubscribeFromTopic(req.body.NT_DEVC_TOKEN_LIST, req.body.topic)
      .then((response) => {
        return res
        .status(200)
        .json(responseSuccess(200, messageSuccess.Success, messageSuccess.Success));
      })
      .catch((error) => {
        return res
        .status(200)
        .json(responseSuccess(500, messageError.ErrorServer,  error));
      });
  
  },

};
