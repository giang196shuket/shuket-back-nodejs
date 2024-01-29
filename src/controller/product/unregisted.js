const userModel = require("../../model/user/user");
const { messageSuccess } = require("../../helper/message");
const { responseSuccess, responseDataList } = require("../../helper/response");
const queriesHelper = require("../../helper/queries");
const productUnregistedModel = require("../../model/product/unregisted");
const { requsetSearchList } = require("../../helper/request");
const { getLimitQuery, generateTag, customArrayImageProduct } = require("../../helper/funtion");
const { MartGroupDefault, bucketImage } = require("../../helper/const");
const { loadImageAwsProduct, loadImageAws, loadNoImage } = require("../../service/loadImage");

module.exports = {
  


  async searchProductUnregisteredList(req, res, next) {
    let params = requsetSearchList(req.body, ['allImageBarcode', 'categorySubCode', 'categoryCode'])
    const user = req.userInfo;
    const rowData = await queriesHelper.getRowDataWhere('TBL_MOA_MART_CONFIG', `M_MOA_CODE = '${user.u_martid}' `)

    let checkGroupImage = 'N'
    if(rowData.IS_GROUP_SYNC_IMAGES !== 'N'){
        checkGroupImage = 'Y'
    }
    const limitQuery = getLimitQuery(params.page, params.limit)
    //get list unregisted
    const result = await productUnregistedModel.selectProductsUnregistered(params, req.dataConnect.M_DB_CONNECT, req.dataConnect.M_POS_REGCODE, limitQuery)

    let list = []
    for (const row of result) {
        let isGroupImage = 'N'
        let arrImage = []
        //generate image for product
        if(checkGroupImage === 'Y'){
            if(row.P_IMG){
                arrImage = customArrayImageProduct(row.P_IMG)
            }
        }
       //generate tags for product
       let tags = ""
       if(row.P_CAT === row.P_CAT_SUB){
          tags = generateTag([row.P_CODE, row.BARCODE, row.P_NAME, row.P_CAT, row.P_UNIT, row.P_PROVIDER])
       }else{
         tags = generateTag([row.P_CODE, row.BARCODE, row.P_NAME, row.P_CAT, row.P_CAT_SUB, row.P_UNIT, row.P_PROVIDER])
       }
       list.push({
         posRegcode : row.M_POS_REGCODE,
         code:row.P_CODE,
         name:row.P_NAME,
         images: arrImage ? arrImage :"",
         isGroupImage : isGroupImage,
         noImage : loadNoImage(),
         category: row.P_CAT,
         categorySub: row.P_CAT_SUB,
         unit: row.P_UNIT,
         barcode: row.BARCODE,
         price:row.P_LIST_PRICE,
         provider:row.P_PROVIDER,
         tags: tags
       })
    }

    const dataResponse = responseDataList(params.page, params.limit, result.length, list)
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
};
