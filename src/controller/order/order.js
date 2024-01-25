const userModel = require("../../model/user/user");
const { messageSuccess } = require("../../helper/message");
const { responseSuccess } = require("../../helper/response");
const { requsetSearchListDate } = require("../../helper/request");
const queriesHelper = require("../../helper/queries");
const { MART_HIDE_CHANGE_STATUS_ORDER, DELIVERY_PUSH_TYPE, MART_USE_DELIVERY_PUSH } = require("../../helper/const");
const { getLimitQuery } = require("../../helper/funtion");
const orderModel = require("../../model/order/order");

module.exports = {
  

  async getOrderList(req, res, next) {
         
    let params = requsetSearchListDate(req.body, [
        "methodPayment", // mã của các phương thức thanh toán : SKP, BANK, CARD, KKP,...
        "orderStatus", // số mã của các trạng thái order trong table TBL_MOA_CODE_COMMON,
        "typeOrder" // delivery, pick up, url
      ]);
    
    let isHideChangeStatusOrder = 0
    // nếu có trong danh sách các mart ko có quyền đổi trạng thái của order 
    if(MART_HIDE_CHANGE_STATUS_ORDER.includes(req.userInfo.u_martid )){
        isHideChangeStatusOrder = 1
    }
    //FA// FB// FW// S// SA// SB// SW
    const martType = await queriesHelper.getRowDataFieldWhere('M_TYPE', 'TBL_MOA_MART_BASIC', ` M_MOA_CODE = '${req.userInfo.u_martid}'` )
    if(martType.M_TYPE === 'SW' || martType.M_TYPE === 'FW'){
        isHideChangeStatusOrder = 1
    }
    //GSK// N// SG// SK// YSK
    const martAppType = await queriesHelper.getRowDataFieldWhere('M_APP_TYPE,USE_TDC_ORDER','TBL_MOA_MART_BASIC',` M_MOA_CODE = '${req.userInfo.u_martid}'` )
    if(martAppType.M_APP_TYPE === 'N'){
        //unused
        isHideChangeStatusOrder = 1
    }
    if(martAppType.USE_TDC_ORDER === 'Y'){
        //dùng order bằng máy pos
        isHideChangeStatusOrder = 1
    }
    let isHideSetDeliveryPush = 1
    if((MART_USE_DELIVERY_PUSH.includes(req.userInfo.u_martid) && DELIVERY_PUSH_TYPE === 'TARGET_MART') || DELIVERY_PUSH_TYPE === 'ALL_MART' ){
        // ko ẩn quyền set time delivery of order
        isHideSetDeliveryPush = 0
    }
    let showRowAmount = 'N'
    let totalAmount = 0
    const limitQuery = getLimitQuery(params.page, params.limit)
    if(params.dateStart && params.dateEnd){
        showRowAmount = 'Y'
        totalAmount = await orderModel.getOrderAmountByTime(limitQuery, req.userInfo.u_martid, params) //..... ....................
    }
    const listOrder =  await orderModel.getOrderListData(limitQuery, req.userInfo.u_martid, params) //..... ....................

    const bizhouz = await queriesHelper.getRowDataFieldWhere('M_BIZHOUR', 'TBL_MOA_MART_BASIC', ` M_MOA_CODE = '${req.userInfo.u_martid}' `)
    let timeEndDay = 19 // mac định đóng cửa 7h tối
    let timeStartDay = 7 // mặc định mở cửa 7h sáng
    let isLimit = 1
    if(bizhouz.M_BIZHOUR){
        const bizhourArr = bizhouz.M_BIZHOUR.split(':');
        timeEndDay = parseInt(bizhourArr[1].substring(0, 2)) - 2; // cắt lấy time
        timeStartDay = parseInt(bizhourArr[0].substring(0, 2)); // cắt lấy time
    }
    const jsonResponseData = []
    for (const val of listOrder) {
        // bỏ qua màu sắc
        let address = ''
        if(val.U_ADDR_RA){
           const arrAddress = val.U_ADDR_RA.split(' ')
           if(arrAddress.length > 3) {
            address += arrAddress.join(' ').replace(/\(/g, '\n(') + '  ';
           }else{
            address += val.U_ADDR_RA
           }
        }
    }

    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, messageSuccess.Success));
  },
};
