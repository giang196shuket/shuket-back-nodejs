const { bucketImage } = require("../../helper/const");
const { arrayColumn, arrayColumnAssign, customArrayImageProduct, customCategoryProduct, convertTagsStringToArray } = require("../../helper/funtion");
const { messageSuccess, messageError } = require("../../helper/message");
const queriesHelper = require("../../helper/queries");
const { requsetSearchListDate } = require("../../helper/request");
const { responseDataList, responseSuccess, responseProductPrice, responseErrorInput } = require("../../helper/response");
const productPriceModel = require("../../model/product/price");
const { loadImageAwsProduct, loadNoImage } = require("../../service/loadImage");
const moment = require("moment");
const { configPriceForProduce } = require("./common");
module.exports = {
  async setPriceForProduct(req, res, next) {
    const user = req.userInfo;
    const dataConnect = req.dataConnect

    let { list_price, sale_price, unit, code, barcode, priceNumber, priceType , priceUpDown, useTime,
    timeStart, timeEnd } = req.body

    const isExistData = await queriesHelper.getDataCountWhere('TBL_MOA_PRD_SCALE',
    ` M_MOA_CODE = '${user.u_martid}' AND P_CODE = '${code}' AND P_BARCODE = '${barcode}'`)

    let price = 0
    if(sale_price && sale_price > 0){
      price = sale_price
    }else{
      price = list_price
    }

    if(useTime === 'Y'){
      timeStart = timeStart + ' 00:00:00'
      timeEnd = timeEnd + ' 23:59:59'
    }else{
      timeStart = null
      timeEnd = null
    }
    let priceShow = 0
    if(priceType === 'PC'){
      if(priceUpDown === 'U'){
        if(sale_price && sale_price > 0){
          priceShow =
          (parseInt(sale_price) / 100) *
            parseInt(priceNumber) +
          parseInt(sale_price);
        }else{
          priceShow =
          (parseInt(list_price) / 100) *
            parseInt(priceNumber) +
          parseInt(list_price);
        }
      }
      if(priceUpDown === 'D'){
        if(sale_price && sale_price > 0){
          priceShow =
              parseInt(sale_price) -
              (parseInt(sale_price) / 100) *
                parseInt(priceNumber);
        }else{
          priceShow =
          parseInt(list_price) -
          (parseInt(list_price) / 100) *
            parseInt(priceNumber);
        }
      }
    }
    if(priceType === 'AM'){
      if(priceUpDown === 'U'){
        if(sale_price && sale_price > 0){
          priceShow =
          parseInt(sale_price) + parseInt(priceNumber);
        }else{
          priceShow =
           parseInt(list_price) + parseInt(priceNumber);
        }
      }
      if(priceUpDown === 'D'){
        if(sale_price && sale_price > 0){
          priceShow =
          parseInt(sale_price) - parseInt(priceNumber);
        }else{
          priceShow =
          parseInt(list_price) - parseInt(priceNumber);
        }
      }
    }

    let result = 0
    if(isExistData === 0){
      // product chưa set price bao giờ => insert  
      result = await productPriceModel.insertPriceOfProduct(user.u_martid, barcode,code, unit, price,priceType,priceUpDown, priceNumber, user.user_id,
      useTime === 'Y' ? 1: 0, timeStart, timeEnd)
    }else{
      // product đã từng set price rồi => update
      result = await productPriceModel.updatePriceOfProduct(user.u_martid,  user.user_id,price, priceType, priceUpDown, priceNumber, useTime === 'Y' ? 1: 0, timeStart, timeEnd, code, barcode)
    }

    if(result > 0){
      return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success,  messageSuccess.Success));
    }else{
      return res
      .status(200)
      .json(responseErrorInput(messageError.RegisterFailure));
    }
    
  },

    async searchProductPriceList(req, res, next) {
        const user = req.userInfo;
        let params = requsetSearchListDate(req.body, [
          "customPriceStatus",
        ]);
        //customPriceStatus : PRODUCT ĐƯỢC MỞ RỘNG GIÁ TRONG TBL_PRD_MAIN_SCALE
        page = !params.page ? 1 : params.page;
        limit = !params.limit ? 1 : params.limit;
        const offset = params.page * params.limit - params.limit;
        // lấy list product hiện tại sau khi sync xong
        const dataListProduct = await productPriceModel.searchProductPriceList(
          req.dataConnect,
          params.status,
          params,
          offset,
          params.limit
        );
 
        let list = [];
        let i = 0;
        let proSettingsMaxMin = "N";
        for (const row of dataListProduct.rows) {
         
          const dataPrice = configPriceForProduce(row)

          //kết thúc tiến hành gán price mở rộng cho product
          responseProductPrice

          list[i] = {
            priceType: dataPrice.priceType,
            priceUpDown: dataPrice.priceUpdown,
            priceNumber: dataPrice.priceNumber,
            price_show: Math.round(dataPrice.priceShow),
            sale_percent: Math.round((row.P_SALE_PRICE / row.P_LIST_PRICE) * 10),
            tags: row.P_TAGS,
            category: customCategoryProduct(row.P_CAT,row.P_CAT_MID, row.P_CAT_SUB),
            images: customArrayImageProduct(row.P_IMG),
            ...responseProductPrice(row)         
          };
 
          i++;
        }
 
        let dataResponse = {
          ...responseDataList(page, limit, dataListProduct.search_count, list),
        };
    
        return res
          .status(200)
          .json(responseSuccess(200, messageSuccess.Success, dataResponse));
        
      },
}