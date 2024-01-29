const { bucketImage } = require("../../helper/const");
const { arrayColumn, arrayColumnAssign, customArrayImageProduct, customCategoryProduct } = require("../../helper/funtion");
const { messageSuccess } = require("../../helper/message");
const queriesHelper = require("../../helper/queries");
const { requsetSearchListDate } = require("../../helper/request");
const { responseDataList, responseSuccess } = require("../../helper/response");
const productInventoryModel = require("../../model/product/inventory");
const { loadImageAwsProduct, loadNoImage } = require("../../service/loadImage");
const moment = require("moment");
module.exports = {
    async searchProductInventoryList(req, res, next) {
        const logBase = "controlller/product/register.searchProductRegisteredList";
        const user = req.userInfo;
        let checkUseStock = null;
       
        let defaultStock = 5; // sẽ cảnh báo khi số lượng product bé hơn hoặc bằng 5
        checkUseStock = await queriesHelper.getRowDataWhere(
          "TBL_MOA_MART_CONFIG",
          `M_MOA_CODE = '${user.u_martid}'`
        );
        let initialStock = 0;
        let isUsingStock = 0;
        if (!checkUseStock.IS_STOCK) {
          initialStock = 0;
          isUsingStock = 0;
        } else {
          if (checkUseStock.IS_STOCK === "Y") {
            // DÙNG STOCK
            initialStock = 1;
            if (checkUseStock.IS_STOP_STOCK === "Y") {
              isUsingStock = 0;
              //DÙNG STOCK NHƯNG TẠM NGƯNG
            } else {
              //DÙNG STOCK
              isUsingStock = 1;
            }
          } else {
            //KO DÙNG STOCK
            initialStock = 0;
            isUsingStock = 0;
          }
          if (checkUseStock.MIN_STOCK_DEFAULT !== "") {
            defaultStock = parseInt(checkUseStock.MIN_STOCK_DEFAULT);
          }
        }
        let params = requsetSearchListDate(req.body, [
          "appStopSaleProduct",
          "categoryCode",
          "categorySubCode",
          "defaultStock",
          "initalStock",
          "isUsingStock",
          "optionCheckStock",
          "stockSearchValue"
        ]);
        //optionCheckStock : N => NONE , U :UP, D: DOWN  
        //stockSearchValue : if optionCheckStock = U => find stock > stockSearchValue
        //stockSearchValue : if optionCheckStock = D => find stock < stockSearchValue
        //categoryCode : code category product
        //categorySubCode : sub code category product
        
    
        page = !params.page ? 1 : params.page;
        limit = !params.limit ? 1 : params.limit;
        const offset = params.page * params.limit - params.limit;
        // lấy list product hiện tại sau khi sync xong
        const dataListProduct = await productInventoryModel.selectProductInventory(
          checkUseStock,
          req.dataConnect,
          params.status,
          params,
          offset,
          params.limit
        );
    
        let isMerge = 0;
        let dataMergeStock = {};
        let dataMergeStockCtime = {};
        let dataMergeStockMtime = {};
        const listPCode = arrayColumn(dataListProduct.rows, "P_CODE");
    
        if (listPCode.length > 0 && initialStock == 1) {
          //trả ra product nào đang dùng stock
          const dataProductUseStock = await queriesHelper.getListDataFieldWhere(
            "GOODS_CODE AS P_CODE, STK_STOCK, C_TIME, M_TIME",
            "TBL_MOA_STOCK_TOGETHERS",
            ` M_MOA_CODE = '${user.u_martid}' AND GOODS_CODE IN (${listPCode})`
          );
          if (dataProductUseStock.length > 0) {
            isMerge = 1;
            dataMergeStock = arrayColumnAssign(
              dataProductUseStock,
              "STK_STOCK",
              "P_CODE"
            );
            dataMergeStockCtime = arrayColumnAssign(
              dataProductUseStock,
              "C_TIME",
              "P_CODE"
            );
            dataMergeStockMtime = arrayColumnAssign(
              dataProductUseStock,
              "M_TIME",
              "P_CODE"
            );
          }
        }
    
        let list = [];
        let i = 0;
        let showSettingMaxMin = "N";
        for (const row of dataListProduct.rows) {
          let isProStock = 0;
          if (row.P_INV_TYPE > 0 || (!row.P_INV_TYPE && row.G_INV_TYPE > 0)) {
            // dùng stock
            isProStock = 1;
          }
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
            category:  customCategoryProduct(row.P_CAT,row.P_CAT_MID, row.P_CAT_SUB),
            unit: row.P_UNIT,
            barcode: row.P_BARCODE,
            status: row.P_STATUS,
            list_price: row.P_LIST_PRICE,
            provider: row.P_PROVIDER,
            sale_price: row.P_SALE_PRICE,
            sale_percent: Math.round((row.P_SALE_PRICE / row.P_LIST_PRICE) * 10),
            sale_title: row.P_SALE_TITLE,
            sale_src: row.SALE_SRC,
            min_stock: !row.P_MIN_STOCK ? 0 : row.P_MIN_STOCK,
            is_pro_stock: isProStock,
            price_type: priceType,
            price_updown: priceUpdown,
            price_number: priceNumber,
            price_show: Math.round(priceShow),
            is_show_price: row.PRICE_CUSTOM_STATUS,
            use_time: row.USE_TIME,
            images: customArrayImageProduct(row.P_IMG),
            time_start: row.TIME_START
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
          
          // bắt đầu gán giá trị stock cho product
          if (dataMergeStock[row.P_CODE] && isMerge === 1) {
            list[i].value_stock = dataMergeStock[row.P_CODE];
            if (dataMergeStock[row.P_CODE] > row.P_MIN_STOCK) {
              //P_MIN_STOCK giá trị tối thiểu cảnh báo hết hàng
              // còn hàng
              list[i].is_out_stock = 0;
            } else {
              // hết hàng
              list[i].is_out_stock = 1;
            }
            if (dataMergeStock[row.P_CODE] === row.P_MIN_STOCK) {
              // hết hàng
              list[i].is_out_stock = 1;
            }
            if (dataMergeStockMtime[row.P_CODE] === "") {
              // thời gian sync stock
              const valueDate = dataMergeStockCtime[row.P_CODE];
              list[i].date_sync_stock = moment(valueDate).format("YYYY-MM-DD");
              list[i].time_sync_stock = moment(valueDate).format("HH:mm:ss");
            } else if (
              moment(dataMergeStockMtime[row.P_CODE]).isSameOrAfter(
                moment(dataMergeStockCtime[row.P_CODE])
              )
            ) {
              // thời gian sync stock
              const valueDate = dataMergeStockMtime[row.P_CODE];
              list[i].date_sync_stock = moment(valueDate).format("YYYY-MM-DD");
              list[i].time_sync_stock = moment(valueDate).format("HH:mm:ss");
            }
          } else {
            list[i].value_stock = 0;
            if (list[i].value_stock > row.P_MIN_STOCK) {
              list[i].is_out_stock = 0;
            } else {
              // hết hàng
              list[i].is_out_stock = 1;
            }
            if (list[i].value_stock === row.P_MIN_STOCK) {
              // hết hàng
              list[i].is_out_stock = 1;
            }
            list[i].date_sync_stock = "-/-";
            list[i].time_sync_stock = "-/-";
          }
          i++;
        }
 
        let dataResponse = {
          ...responseDataList(page, limit, dataListProduct.search_count, list),
          default_stock: defaultStock,      
          isUsingStock: isUsingStock,
          initialStock: initialStock,
        };
    
        return res
          .status(200)
          .json(responseSuccess(200, messageSuccess.Success, dataResponse));
        
      },
}