const { bucketImage } = require("../../helper/const");
const { arrayColumn, arrayColumnAssign, customArrayImageProduct, customCategoryProduct } = require("../../helper/funtion");
const { messageSuccess } = require("../../helper/message");
const queriesHelper = require("../../helper/queries");
const { requsetSearchListDate } = require("../../helper/request");
const { responseDataList, responseSuccess, responseProductInventory } = require("../../helper/response");
const productInventoryModel = require("../../model/product/inventory");
const { loadImageAwsProduct, loadNoImage } = require("../../service/loadImage");
const moment = require("moment");
const { configPriceForProduce } = require("./common");
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
          const dataPrice = configPriceForProduce(row)

              list[i] = {          
            category:  customCategoryProduct(row.P_CAT,row.P_CAT_MID, row.P_CAT_SUB),
            is_pro_stock: isProStock,
            price_type: dataPrice.priceType,
            price_updown: dataPrice.priceUpdown,
            price_number: dataPrice.priceNumber,
            price_show: Math.round(dataPrice.priceShow),        
            images: customArrayImageProduct(row.P_IMG),
            ...responseProductInventory(row)         
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
          valueStock:{
            default_stock: defaultStock,
            is_using_stock: isUsingStock,
            inital_stock: initialStock,
          },
        };
    
        return res
          .status(200)
          .json(responseSuccess(200, messageSuccess.Success, dataResponse));
        
      },
}