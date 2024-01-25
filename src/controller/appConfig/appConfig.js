const { getLimitQuery } = require("../../helper/funtion");
const { messageSuccess } = require("../../helper/message");
const { responseSuccess, responseDataList } = require("../../helper/response");
const appConfigModel = require("../../model/appConfig/appConfig");
const catalogModel = require("../../model/catalog/catalog");


const { requsetSearchList } = require("../../helper/request");
module.exports = {

  async getAppVersionList(req, res, next) {
    const params = requsetSearchList(req.query)
    //orderBy: RA => ORDER BY ASC
    //orderBy: RD => ORDER BY DESC

    const limitQuery = getLimitQuery(params.page, params.limit)
    const result = await appConfigModel.getAppVersionList(limitQuery, params.orderBy)
    
    let jsonResponseData = []
    for (const val of result.list) {
        jsonResponseData.push({
            mart_code: val.M_MOA_CODE,
            mart_name: val.M_NAME,
            aos:{
                ver_no: val.VERSION_AOS,
                os_type : val.AOS_TYPE,
                chk_type: val.AOS_CHK,
                store_url: val.AOS_STORE
            },
            ios:{
                ver_no: val.VERSION_IOS,
                os_type : val.IOS_TYPE,
                chk_type: val.IOS_CHK,
                store_url: val.IOS_STORE
            }
        })
    }
    const dataResonse = responseDataList(params.page, params.limit, result.total , jsonResponseData)
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, dataResonse));
  },

};
