const logger = require("../../../config/logger");
const { messageSuccess } = require("../../helper/message");
const queriesHelper = require("../../helper/queries");
const { responseSuccess } = require("../../helper/response");
const productCommonModel = require("../../model/product/common");
const moment = require("moment");
const ip = require('ip');
const { typeLog } = require("../../helper/const");

module.exports = {
  async settingAllMaxMinProduct(req, res, next) {
    const {default_maxqty, default_minqty, is_using_maxqty, is_using_minqty} = req.body;
    const time = moment().format('YYYY-MM-DD HH:mm:ss')
    const user = req.userInfo

     await queriesHelper.updateTableWhere('TBL_MOA_PRD_MAIN', ` P_USE_MAXQTY_PD = '${is_using_maxqty}',
     P_VALUE_MAXQTY_PD = '${default_maxqty}',
     P_USE_MINQTY_PD = '${is_using_minqty}',
     P_VALUE_MINQTY_PD = '${default_minqty}',
     M_TIME = '${time}',
     M_ID = '${user.user_id}'`,
     ` M_MOA_CODE = '${user.u_martid}'`)

     //update max quantity của bargain khuyến mãi bằng mức min quantity 
    if(is_using_minqty === 'Y'){
      await queriesHelper.updateTableWhere('TBL_MOA_PRD_MAIN', `P_MAXQTY_BRGN = P_VALUE_MINQTY_PD,
      M_TIME = '${time}',
      M_ID = '${user.user_id}'`,
      ` M_MOA_CODE = '${user.u_martid}' AND P_VALUE_MINQTY_PD >= P_MAXQTY_BRGN AND P_USE_MAXQTY_BRGN='Y' ` )
    }

    //update config of mart 
    await queriesHelper.updateTableWhere('TBL_MOA_MART_CONFIG', ` USE_MAXQTY_PRODUCT = '${is_using_maxqty}',
    MAXQTY_PRODUCT_VALUE = '${default_maxqty}',
    USE_MINQTY_PRODUCT = '${is_using_minqty}',
    MINQTY_PRODUCT_VALUE = '${default_minqty}',
    M_TIME = '${time}',
    M_ID = '${user.user_id}'`,
    `M_MOA_CODE = '${user.u_martid}'`)
    
    //save log
    await queriesHelper.insertTableWhere('TBL_MOA_MART_ACTIVITY_LOG' , ' M_MOA_CODE, HIS_IP, TYPE_LOG, DATA, C_TIME, C_ID',
    ` '${user.u_martid}', '${ip.address()}', '${typeLog.SetAllMaxMinQty}', '${JSON.stringify(req.body)}', '${time}', '${user.user_id}'`)

    return res
      .status(200)
      .json(
        responseSuccess(
          200,
          messageSuccess.Success,
          messageSuccess.updateSuccess
        )
      );
  },
  async settingAllStockProduct(req, res, next) {
    let {default_stock, inital_stock, is_using_stock} = req.body;
    const time = moment().format('YYYY-MM-DD HH:mm:ss')
    const user = req.userInfo

    let status = ""
    if(inital_stock === 1){
      if(is_using_stock === 1){
        status = 'N'
      }else if(is_using_stock === 0){
        status = 'Y'
      }
      // update toàn bộ product của mart này
      await queriesHelper.updateTableWhere('TBL_MOA_PRD_MAIN', ` P_MIN_STOCK = '${default_stock}',
      P_MIN_STOCK_DEFAULT = '${default_stock}',
      M_ID = '${user.user_id}',
      M_TIME = '${time}'`, ` M_MOA_CODE = '${user.u_martid}'`)

      // update config của mart này khi đăng ký mới 1 product
      await queriesHelper.updateTableWhere('TBL_MOA_MART_CONFIG', ` IS_STOP_STOCK = '${status}', 
      MIN_STOCK_DEFAULT = '${default_stock}',
      M_ID = '${user.user_id}',
      M_TIME = '${time}'`, ` M_MOA_CODE = '${user.u_martid}' AND IS_STOCK = 'Y'`)
    }

    return res
      .status(200)
      .json(
        responseSuccess(
          200,
          messageSuccess.Success,
          messageSuccess.updateSuccess
        )
      );
  },
  async updateStatus(req, res, next) {
    const { code, status } = req.body;
    const userId = req.userInfo.user_id;
    const time = moment().format("YYYY-MM-DD HH:mm:ss");
    await queriesHelper.updateTableWhere(
      "TBL_MOA_PRD_MAIN",
      ` P_STATUS = '${status}', M_ID = '${userId}', M_TIME = '${time}' `,
      ` P_CODE = '${code}'`
    );
    return res
      .status(200)
      .json(
        responseSuccess(
          200,
          messageSuccess.Success,
          messageSuccess.updateSuccess
        )
      );
  },
  async updateStatusMulti(req, res, next) {
    const { code, status } = req.body;
    //code la mang code
    console.log(code, status);
    const userId = req.userInfo.user_id;
    const time = moment().format("YYYY-MM-DD HH:mm:ss");
    for (const item of code) {
      await queriesHelper.updateTableWhere(
        "TBL_MOA_PRD_MAIN",
        ` P_STATUS = '${status}', M_ID = '${userId}', M_TIME = '${time}' `,
        ` P_CODE = '${item}'`
      );
    }
   
    return res
      .status(200)
      .json(
        responseSuccess(
          200,
          messageSuccess.Success,
          messageSuccess.updateSuccess
        )
      );
  },

  async getProductCategory(req, res, next) {
    const { cateParent } = req.body;
    const data = await productCommonModel.getProductCategory(
      cateParent,
      req.dataConnect.M_DB_CONNECT,
      req.dataConnect.M_POS_REGCODE
    );
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, data));
  },
   configPriceForProduce(row) {
    let priceType = "N";
    let priceUpdown = "N";
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
            if (row.P_SALE_PRICE && parseInt(row.P_SALE_PRICE > 0)) {
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
            if (row.P_SALE_PRICE && parseInt(row.P_SALE_PRICE > 0)) {
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
            if (row.P_SALE_PRICE && parseInt(row.P_SALE_PRICE > 0)) {
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
            if (row.P_SALE_PRICE && parseInt(row.P_SALE_PRICE > 0)) {
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
    console.log('row', row)


    return {
       priceType,
       priceUpdown ,
       priceNumber,
       priceShow 
    }
  }
};
