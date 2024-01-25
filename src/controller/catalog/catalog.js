const { getLimitQuery } = require("../../helper/funtion");
const { messageSuccess } = require("../../helper/message");
const { responseSuccess } = require("../../helper/response");
const catalogModel = require("../../model/catalog/catalog");



module.exports = {

  async getList(req, res, next) {
    let {page, limit } = req.query

    const limitQuery = getLimitQuery(page, limit)
    const result = await catalogModel.getList(limitQuery)
    let jsonResponseData = []
    for (const val of result.list) {
        jsonResponseData.push({
            ...val, CATALOG_STATUS: (val.CATALOG_STATUS && val.CATALOG_STATUS === 'A' ? true: false)
        })
    }
    const dataResonse = {
        page: page,
        size: limit,
        total: result.total,
        list: jsonResponseData
    }
  
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, dataResonse));
  },

};
