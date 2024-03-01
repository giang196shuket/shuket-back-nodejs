const { bucketImage } = require("../../helper/const");
const { arrayColumn, arrayColumnAssign, customArrayImageProduct, customCategoryProduct } = require("../../helper/funtion");
const { messageSuccess } = require("../../helper/message");
const queriesHelper = require("../../helper/queries");
const { requsetSearchListDate } = require("../../helper/request");
const { responseDataList, responseSuccess, responseProductPrice } = require("../../helper/response");
const productPriceModel = require("../../model/product/price");
const { loadImageAwsProduct, loadNoImage } = require("../../service/loadImage");
const moment = require("moment");
module.exports = {
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
         
          let priceType = "No";
          let priceUpdown = "No";
          let priceNumber = 0;
          let priceShow = 0;
          // bắt đầu tiến hành gán price mở rộng cho product
          if (row.PRICE_CUSTOM_STATUS === "A") {
            //dùng giá tiền mở rộng
            if (row.PRICE_TYPE) {
              //PRICE_TYPE : AM => AMOUNT, PC: PERCENT
              priceType = row.PRICE_TYPE;
            }
            if (row.PRICE_UP_DOWN) {
              priceUpdown = row.PRICE_UP_DOWN; //  tăng hoặc giảm giá
              if (row.PRICE_TYPE === "PC") {
                //PERCENT
                if (row.PRICE_UP_DOWN === "U") {
                  // UP PRICE
                  if (row.P_SALE_PRICE && row.P_SALE_PRICE > 0) {
                    //P_SALE_PRICE: price đang sale
                    // PRICE_NUMBER : giá trị mở rộng
                    priceShow =
                      (parseInt(row.P_SALE_PRICE) / 100) *
                        parseInt(row.PRICE_NUMBER) +
                      parseInt(row.P_SALE_PRICE);
                  } else {
                    //P_LIST_PRICE : price mặc định
                    priceShow =
                      (parseInt(row.P_LIST_PRICE) / 100) *
                        parseInt(row.PRICE_NUMBER) +
                      parseInt(row.P_LIST_PRICE);
                  }
                }
                if (row.PRICE_UP_DOWN === "D") {
                  // DOWN PRICE
                  if (row.P_SALE_PRICE && row.P_SALE_PRICE > 0) {
                    //P_SALE_PRICE: price đang sale
                    // PRICE_NUMBER : giá trị mở rộng
                    priceShow =
                      parseInt(row.P_SALE_PRICE) -
                      (parseInt(row.P_SALE_PRICE) / 100) *
                        parseInt(row.PRICE_NUMBER);
                  } else {
                    //P_LIST_PRICE : price mặc định
                    priceShow =
                      parseInt(row.P_LIST_PRICE) -
                      (parseInt(row.P_LIST_PRICE) / 100) *
                        parseInt(row.PRICE_NUMBER);
                  }
                }
              }
              if (row.PRICE_TYPE === "AM") {
                // AMOUNT
                if (row.PRICE_UP_DOWN === "U") {
                  // UP PRICE
                  if (row.P_SALE_PRICE && row.P_SALE_PRICE > 0) {
                    //P_SALE_PRICE: price đang sale
                    // PRICE_NUMBER : giá trị mở rộng
                    priceShow =
                      parseInt(row.P_SALE_PRICE) + parseInt(row.PRICE_NUMBER);
                  } else {
                    //P_LIST_PRICE : price mặc định
                    priceShow =
                      parseInt(row.P_LIST_PRICE) + parseInt(row.PRICE_NUMBER);
                  }
                }
                if (row.PRICE_UP_DOWN === "D") {
                  // DOWN PRICE
                  if (row.P_SALE_PRICE && row.P_SALE_PRICE > 0) {
                    //P_SALE_PRICE: price đang sale
                    // PRICE_NUMBER : giá trị mở rộng
                    priceShow =
                      parseInt(row.P_SALE_PRICE) - parseInt(row.PRICE_NUMBER);
                  } else {
                    //P_LIST_PRICE : price mặc định
                    priceShow =
                      parseInt(row.P_LIST_PRICE) - parseInt(row.PRICE_NUMBER);
                  }
                }
              }
            }
            if (row.PRICE_NUMBER) {
              priceNumber = parseInt(row.PRICE_NUMBER);
            }
          }
          //kết thúc tiến hành gán price mở rộng cho product
          responseProductPrice

          list[i] = {
            price_type: priceType,
            price_updown: priceUpdown,
            price_number: priceNumber,
            price_show: Math.round(priceShow),
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