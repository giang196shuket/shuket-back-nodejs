const moment = require("moment");
const queriesHelper = require("../../helper/queries");
const { responseSuccess } = require("../../helper/response");
const { messageSuccess } = require("../../helper/message");

module.exports = {
  async updateStatusImgs(req, res, next) {
    let { code, status } = req.body;
    const time = moment().format("YYYY-MM-DD HH:mm:ss");
    const result = await queriesHelper.updateTableWhere(
      "TBL_MOA_IMAGE_PRD",
      ` IM_STATUS = '${status}', M_ID = '${req.userInfo.user_id}',
          M_TIME = '${time}'`,
      ` IM_CODE = '${code}' `
    );
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, messageSuccess.updateSuccess));
  },
};
