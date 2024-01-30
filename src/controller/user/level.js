const { assignSequentialNumbers } = require("../../helper/funtion");
const { messageSuccess } = require("../../helper/message");
const { responseSuccess } = require("../../helper/response");
const levelModel = require("../../model/user/level");

module.exports = {
    async getLevelSearchList(req, res, next) {
        const result = await levelModel.getLevelSearchList();
        const dataResponse = {
            list: assignSequentialNumbers(result),
        };
        return res
          .status(200)
          .json(responseSuccess(200, messageSuccess.Success, dataResponse));
      },
}