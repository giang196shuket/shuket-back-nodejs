
const { messageError, messageSuccess } = require("../helper/message");
const { responseSuccess, responseErrorData } = require("../helper/response");
const userModel = require("../model/user");
const { mergeRoleList } = require("../helper/funtion");

module.exports = {    
   
    async moaSearchList(req, res, next)
    {
      const logBase = `controller/mart/moaSearchList: `;
     const data = {
     };
      return res.status(200).json(responseSuccess(200, messageSuccess.Success,data ))
    }
}