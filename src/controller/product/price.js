const { bucketImage } = require("../../helper/const");
const { arrayColumn, arrayColumnAssign } = require("../../helper/funtion");
const { messageSuccess } = require("../../helper/message");
const queriesHelper = require("../../helper/queries");
const { requsetSearchListDate } = require("../../helper/request");
const { responseDataList, responseSuccess } = require("../../helper/response");
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
    

          list[i] = {
            seq: row.SEQ,
            moa_code: row.M_MOA_CODE,
            pos_regcode: row.M_POS_REGCODE,
            code: row.P_CODE,
            name: row.P_NAME,
            category:
              row.P_CAT +
              " " +
              (row.P_CAT_MID ? ` > ${row.P_CAT_MID}` : " ") +
              " " +
              (row.P_CAT_SUB ? ` > ${row.P_CAT_SUB}` : " "),
            unit: row.P_UNIT,
            barcode: row.P_BARCODE,
            status: row.P_STATUS,
            list_price: row.P_LIST_PRICE,
            provider: row.P_PROVIDER,
            sale_price: row.P_SALE_PRICE,         
            price_type: priceType,
            price_updown: priceUpdown,
            price_number: priceNumber,
            price_show: Math.round(priceShow),
            is_use_qty : row.IS_USE_QTY,
            default_qty: row.DEFAULT_QTY,
            custom_qty : row.CUSTOM_QTY,
            time_start: row.TIME_START,
            value_qty: row.CUSTOM_QTY ? row.CUSTOM_QTY : row.CUSTOM_QTY
              ? moment(row.TIME_START).format("YYYY-MM-DD")
              : null,
            time_end: row.TIME_END
              ? moment(row.TIME_END).format("YYYY-MM-DD")
              : null,
            create_name: row.C_NAME,
            create_time: row.C_TIME,
            update_name: row.M_NAME,
            update_time: row.M_TIME,
          };
          // gán mảng hình ảnh cho product
          const productImages = JSON.parse(row.P_IMG);
          let arrImage = [];
          let j = 0;
          productImages.forEach((prdImage) => {
            arrImage[j] = loadImageAwsProduct(prdImage, bucketImage.product);
            if (prdImage.main === 1) {
              arrImage[j].main = 1; // ảnh phụ
            } else {
              arrImage[j].main = 0; //ảnh chính
            }
            j++;
          });
          if (arrImage.length === 0) {
            arrImage[0] = {
              thumb: loadNoImage(),
              main: 1,
            };
          }
     
          list[i].images = arrImage;
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