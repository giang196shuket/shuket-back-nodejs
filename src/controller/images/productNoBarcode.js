const { bucketImage } = require("../../helper/const");
const { getLimitQuery } = require("../../helper/funtion");
const { messageSuccess } = require("../../helper/message");
const { responseSuccess } = require("../../helper/response");
const productNoBarcodeModel = require("../../model/images/productNoBarcode");
const { loadImageAws } = require("../../service/loadImage");



module.exports = {

  async getListProductWithoutBarcode(req, res, next) {
    let {page, limit, orderBy, keywordType, keywordValue, dateStart, dateEnd , status } = req.body
    const limitQuery = getLimitQuery(page, limit)
    const result = await productNoBarcodeModel.getListProductWithoutBarcode(limitQuery,  orderBy, keywordType, keywordValue, dateStart, dateEnd , status)
 
    let jsonResponseData = []
    for await(const val of result.list) {
      jsonResponseData.push({...val, arrImage : {
        image_uri: loadImageAws(val.uri, bucketImage.banner),
        image_priority: val.type
      } })
    }
    const dataResponse = {
      page : page,
      limit : limit,
      total_page: result.list.length,
      total: result.total,
      list: jsonResponseData
    }
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },

};
