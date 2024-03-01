const { getLimitQuery, limitcontent } = require("../../helper/funtion");
const { LINK_BACKEND_DEV } = require("../../helper/link");
const { messageSuccess } = require("../../helper/message");
const { responseSuccess, responseDataList } = require("../../helper/response");
const productBarcodeModel = require("../../model/images/productBarcode");
const moaNotice = require("../../model/notice/moaNotice");
const { loadImageAws } = require("../../service/loadImage");



module.exports = {

  async getNoticeList(req, res, next) {
    const {page, limit } = req.query
    const limitQuery = getLimitQuery(page, limit)
    const result = await moaNotice.getNoticeList(limitQuery)
    let jsonResponseData = []

    for (const val of result) {
        let type = 0
        if(val.image !== ""){
            type = 1
        }
        jsonResponseData.push({
            ...val,
            image: LINK_BACKEND_DEV + val.image,
            type: type,
            shortContent: limitcontent(val.content),
            optionCheck: val.status === 'A' ? true : false
        })
    }
    const dataResponse = {
      ...responseDataList(page,limit, result.length, jsonResponseData)
    }
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },

};
