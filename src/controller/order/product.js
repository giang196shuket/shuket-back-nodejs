const { messageSuccess } = require("../../helper/message");
const { responseSuccess, responseDataList } = require("../../helper/response");
const { requsetSearchListDate } = require("../../helper/request");
const queriesHelper = require("../../helper/queries");
const { getLimitQuery, customArrayImageProduct, customCategoryProduct } = require("../../helper/funtion");
const orderProductModel = require("../../model/order/product");
const { loadImageAwsProduct, loadNoImage } = require("../../service/loadImage");
const { bucketImage } = require("../../helper/const");
const productRegistedModel = require("../../model/product/registed");
module.exports = {

  async searchProductOrder(req, res, next) {
    let params = requsetSearchListDate(req.body, [
        "optionOrderByDate", 
        // custom => dataEnd, dataStart : choose  dataEnd, dataStart
        //today, 1 week, 1 month
        "optionOrderSort", //order by quantity asc/desc, price asc/desc
        "categoryCode" // mảng tên thể loại product
      ]);
    const limitQuery = getLimitQuery(params.page, params.limit)
    const rows = await orderProductModel.searchProductOrder(params, limitQuery, req.dataConnect)
    let list = []
    let rank = params.page * 0
    if(params.page <= 1){
        rank = 1
    }else{
        rank = (params.page * params.limit) - params.limit + 1 
    }
    for (const row of rows.list) {
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
        
       //push 
        list.push({
            seq: row.SEQ,
            moaCode: row.M_MOA_CODE,
            posRegcode: row.M_POS_REGCODE,
            code:row.P_CODE,
            name:row.P_NAME,
            category: customCategoryProduct(row.P_CAT,row.P_CAT_MID, row.P_CAT_SUB),
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
            price_number_show: priceNumber,
            price_updown_show: priceUpdown,
            total_qty: row.TOTAL_QTY,
            total_price: row.TOTAL_PRICE,
            images: customArrayImageProduct(row.P_IMG),
            rank:rank
        })
        rank++
    }
    const dataResponse = responseDataList(params.page, params.limit, rows.total, list)
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
  async getListCate(req,res, next){
    const list = await  productRegistedModel.getProductCategory(null, req.dataConnect.M_DB_CONNECT, req.dataConnect.M_POS_REGCODE)
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, list));
  }

};

