const { messageSuccess } = require("../../helper/message");
const { responseSuccess, responseDataList, responseOrderList } = require("../../helper/response");
const { requsetSearchListDate } = require("../../helper/request");
const queriesHelper = require("../../helper/queries");
const { MART_HIDE_CHANGE_STATUS_ORDER, DELIVERY_PUSH_TYPE, MART_USE_DELIVERY_PUSH, textDeFault, days, MART_USE_DELIVERY_FEE, DELIVERY_FEE } = require("../../helper/const");
const { getLimitQuery, generateTimePickup, assignSequentialNumbers } = require("../../helper/funtion");
const orderModel = require("../../model/order/order");
const moment = require("moment");
module.exports = {
  

  async getOrderList(req, res, next) {      
    let params = requsetSearchListDate(req.body, [
        "methodPayment", // mã của các phương thức thanh toán : SKP, BANK, CARD, KKP,...
        "orderStatus", // số mã của các trạng thái order trong table TBL_MOA_CODE_COMMON,
        "typeOrder", // delivery, pick up, url
        "sortByArea" // sắp xếp list theo địa chỉ giao hàng asc/desc
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
    const martAppType = await queriesHelper.getRowDataFieldWhere('M_APP_TYPE,USE_TDC_ORDER','TBL_MOA_MART_CONFIG',` M_MOA_CODE = '${req.userInfo.u_martid}'` )
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
        totalAmount = await orderModel.getOrderAmountByTime(limitQuery, req.userInfo.u_martid, params)
    }
    const listOrder =  await orderModel.getOrderListData(limitQuery, req.userInfo.u_martid, params) 

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
    for (const val of listOrder.list) {
        // lấy  màu sắc status
        let statusColorBox = ""
        let statusColorText = ""
        if(val.O_STATUS === 60 || val.O_STATUS === 61 || val.O_STATUS === 62 || val.O_STATUS === 63 || val.O_STATUS === 64){
            statusColorBox = '#2468ae'
        }else if(val.O_STATUS === 70 || val.O_STATUS === 71){
            statusColorBox = '#850075'
        }else if(val.O_STATUS === 80 || val.O_STATUS === 81  || val.O_STATUS === 82 || val.O_STATUS === 90 || val.O_STATUS === 91  || val.O_STATUS === 92){
            statusColorBox = '#00c334'
        }else if(val.O_STATUS === 83){
            statusColorBox = '#ea781c'
        }else{
            statusColorBox = '#e4d03f'
        }
        //màu text
        if(val.O_STATUS === 70 || val.O_STATUS === 82 || val.O_STATUS === 32 || val.O_STATUS === 42 || val.O_STATUS === 92){
            statusColorText = '#00c334'
        }else if(val.O_STATUS === 60 || val.O_STATUS === 80 || val.O_STATUS === 30 || val.O_STATUS === 40 || val.O_STATUS === 90){
            statusColorText = '#aaaaaa'
        }else if(val.O_STATUS === 61 || val.O_STATUS === 33  || val.O_STATUS === 43 || val.O_STATUS === 93){
            statusColorText = '#ff0000'
        }else if(val.O_STATUS === 63 || val.O_STATUS === 62  || val.O_STATUS === 81 || val.O_STATUS === 31 || val.O_STATUS === 41 || val.O_STATUS === 71 || val.O_STATUS === 91 ){
            statusColorText = '#ff8c29'
        }else if(val.O_STATUS === 64){
            statusColorBox = '#b4b800'
        }
        // lấy địa chỉ giao hàng
        let address = ''
        if(val.U_ADDR_RA){

           const arrAddress = val.U_ADDR_RA.split(' ')
           if(arrAddress.length > 3) {
            address += arrAddress.join(' ').replace(/\(/g, '\n(') + '  ';
           }else{
            address += val.U_ADDR_RA
           }
        }
        if(val.U_ADDR_DETAIL !== ""){
            address += val.U_ADDR_DETAIL
        }
        let usernameOrder = val.U_NAME
        if(val.O_WEBURL === 1){
            // đặt hàng qua website
            usernameOrder = val.U_ADDR_RECI
        }
        let isUsePushDelivery = 'N'
        let pushShowTimeDisplay = ''
        let pushSetTime = ""
        let pushCustomSetTime = ""

        if(val.NOTI_YN == 'N'){
            pushSetTime = val.OB_DEL_TIME // 90/ 60/ 120 minutes delivery...
            pushCustomSetTime = ""
        }else{
            if(val.OB_TIME_SET === 'N'){
                // không dùng time delivery mặc định  // 90/ 60/ 120
                pushSetTime = val.OB_DEL_TIME
                pushCustomSetTime = ""
                pushShowTimeDisplay =  val.OB_DEL_TIME + textDeFault.orderDeliveryTime
            }else{
                // dùng time delivery tự chọn VD: 20/ 35
                pushSetTime = ""
                pushCustomSetTime = val.OB_DEL_TIME
                pushShowTimeDisplay = val.OB_DEL_TIME
            }
        }
        if(val.NOTI_YN){
            // đẩy thông báo
            isUsePushDelivery = val.NOTI_YN
        }
        let timePickupOrder = ""
        if(val.O_DELIVERY_TYPE === 'P'){
            // pick up
            if(JSON.parse(val.O_PICKUP_DATE).date_pickup === 0){
                timePickupOrder = generateTimePickup(val.C_TIME, val.O_PICKUP_TIME, false)
            }else{
                timePickupOrder = generateTimePickup(val.C_TIME, val.O_PICKUP_TIME, true) //+1day
            }
        }
        let deliveryText1 = ""
        let deliveryText2 = ""
        let deliveryText3 = ""
        let caseDelivery = 0
        let isDelivery = 0
        if(val.IS_DELIVERY === 1){
            // có vận chuyển đơn hàng
            isDelivery = 1
            let dateEnd = null
            let dateStart = null
            const dataDeliveryResult1 = JSON.parse(val.DELIVERY_INFO)
            deliveryText1 += dataDeliveryResult1 ?  dataDeliveryResult1.name : "" //VD: Giao hàng tiêu chuẩn - 1.000 won, đến trong vòng 100 phút
            const dataDeliveryResult2 = JSON.parse(val.DELIVERY_DATA)
            if(dataDeliveryResult2){
                if(dataDeliveryResult2?.DELI_DATA?.is_nextday == 0){
                    // ko trì hoãn giao trong ngày 
                    // lặp qua object days
                    for (const key in days) {
                        // key : Mon, Tue, Wed,..
                        if(key === dataDeliveryResult2.DELI_DATA.delivery_date_D){
                            dateEnd = days[key]
                        }
                        // key : Mon, Tue, Wed,..
                        if(key === moment(val.C_TIME).format('ddd')){
                            dateStart = days[key]
                        }
                    }
                    const dateAdd = dateEnd - dateStart 
                    if(dataDeliveryResult2.DELI_TIME_OPTION === 'D'){
                        //day
                        deliveryText2 = textDeFault.dayDelivery1 + moment(val.C_TIME).add(Math.abs(dateAdd), 'd').format('YYYY-MM-DD')

                    }
                    if(dataDeliveryResult2.DELI_TIME_OPTION === 'H'){
                        //day and hour
                        deliveryText2 = textDeFault.dayDelivery1 + moment(val.C_TIME).add(Math.abs(dateAdd), 'd').format('YYYY-MM-DD')
                        deliveryText3 = textDeFault.timeDelivery + dataDeliveryResult2.DELI_DATA.delivery_H_data.hour_text
                    }
                }
                else if(dataDeliveryResult2?.DELI_DATA?.is_nextday == 1){
                    // trì hoãn
                    if(dataDeliveryResult2.DELI_TIME_OPTION === 'D'){
                        //day
                        if(moment(val.C_TIME).format('YYYY-MM-DD') !== dataDeliveryResult2.DELI_DATA.time_order){
                            deliveryText2 = textDeFault.dayDelivery2 + moment(val.C_TIME).add(1, 'd').format('YYYY-MM-DD') + textDeFault.delayDelivery
                        }else{
                            deliveryText2 = textDeFault.dayDelivery2 + moment(val.C_TIME).format('YYYY-MM-DD') + textDeFault.delayDelivery
                        }
                    }
                    if(dataDeliveryResult2.DELI_TIME_OPTION === 'H'){
                        // day && hour
                        if(moment(val.C_TIME).format('YYYY-MM-DD') !== dataDeliveryResult2.DELI_DATA.time_order){
                            deliveryText2 = textDeFault.dayDelivery2 + moment(val.C_TIME).add(1, 'd').format('YYYY-MM-DD') + textDeFault.delayDelivery
                        }else{
                            deliveryText2 = textDeFault.dayDelivery2 + moment(val.C_TIME).format('YYYY-MM-DD') + textDeFault.delayDelivery
                        }
                        const timeNext = timeStartDay + 1
                        if(parseInt(timeNext) < 10){
                            // thêm 0 VD: 1 => 01
                            deliveryText3 = textDeFault.timeDelivery + ` 0${timeStartDay}:00 - ` + timeNext + ':00'
                        }else{
                            deliveryText3 = textDeFault.timeDelivery + ` ${timeStartDay}:00 - ` + timeNext + ':00'
                        }
                    }
                    caseDelivery = 1
                 }
            }
        }
        let isSubCancel = 0
        let dataSubCancel = []
        // tiến hành lấy dữ liệu từng phần của đơn hàng hủy
        if(val.O_STATUS === 60){
            //Order Cancellation
            //lấy dữ liệu hủy từng phần  //O_CODE_ORGINAL => O_CODE_PARENT => O_CODE
            const orderCancel = await queriesHelper.getRowDataFieldWhere('O_CODE,TID,NICE_CANCELAMT,NICE_REMAINAMT,O_CODE_PARENT',
            'TBL_MOA_PAYMT_NICE_CANCEL_PARTICAL_LOG', `O_CODE_PARENT = '${val.O_CODE}' AND M_MOA_CODE = '${req.userInfo.u_martid}'` )
            if(orderCancel){
                //LẤY DATA CÁC PRODUCT CỦA ORDER cha
                const dataOrginal = orderModel.getOrderDetailData(orderCancel.O_CODE_PARENT, req.userInfo.u_martid, req.dataConnect)
                let arrayProductSub = []
                let arrayProductQuantity = []
                dataOrginal.forEach(item => {
                    arrayProductQuantity[item.P_CODE+'_'+item.P_BARCODE] = {
                        productId: item.P_CODE+'_'+item.P_BARCODE,
                        quantity: item.O_QTY,
                        productCode: item.P_CODE,
                        productBarcode: item.P_BARCODE,
                        price: item.O_PRD_PRICE
                    }
                });
                let arrayProductQuantitySub = []
                 //LẤY DATA CÁC PRODUCT CỦA ORDER con
                const dataSubOrginal = orderModel.getOrderDetailData(orderCancel.O_CODE, req.userInfo.u_martid, req.dataConnect)
                dataSubOrginal.forEach(item => {
                    arrayProductSub.push(item.P_CODE+'_'+item.P_BARCODE)
                    arrayProductQuantitySub[item.P_CODE+'_'+item.P_BARCODE] = {
                        productId: item.P_CODE+'_'+item.P_BARCODE,
                        quantity: item.O_QTY,
                        productCode: item.P_CODE,
                        productBarcode: item.P_BARCODE,
                        price: item.O_PRD_PRICE
                    }
                });
                let arraySubData = []
                if(orderCancel.O_CODE_PARENT !== orderCancel.O_CODE){
                    isSubCancel = 1
                    arrayProductQuantity.forEach((row, key) => {
                        if(arrayProductSub.includes(row.productId)){
                            // trừ quantity từng phần
                            let quantityCheck = row.quantity - (row.quantity - arrayProductQuantitySub[row.productId].quantity)
                            let quantityPrice = row.quantity - arrayProductQuantitySub[row.productId].quantity
                            if(quantityCheck < 0){
                                quantityCheck = 0
                            }
                            if(quantityPrice <= 0){
                                quantityPrice = 1
                            }
                            if(arrayProductQuantitySub[row.productId].quantity < row.quantity){
                                arraySubData.push({
                                    quantityText : row.quantity+'->'+quantityCheck,
                                    price: row.price * quantityPrice,
                                    productCode: item.P_CODE,
                                    productBarcode: item.P_BARCODE,
                                    mid:orderCancel.TID,
                                    unit: quantityPrice,
                                    orderCode: orderCancel.O_CODE
                                })
                            }else{
                                arraySubData.push({
                                    quantityText : row.quantity+'->0',
                                    price: row.price * quantityPrice,
                                    productCode: item.P_CODE,
                                    productBarcode: item.P_BARCODE,
                                    mid:orderCancel.TID,
                                    unit: quantityPrice,
                                    orderCode: orderCancel.O_CODE
                                })
                            }
                        }
                    });
                }
                dataSubCancel = {
                    TID: orderCancel.TID,
                    NICE_CANCELAMT : orderCancel.NICE_CANCELAMT, // PHẦN TIỀN BỊ TRỪ
                    NICE_REMAINAMT : orderCancel.NICE_REMAINAMT, // PHẦN TIỀN BAN ĐẦU HOẶC  CÒN LẠI SAU KHI LẤY NÓ TRỪ  NICE_CANCELAMT
                    data: arraySubData,
                    a: dataOrginal,
                    b: dataSubOrginal
                }
            }else{
                dataSubCancel = []
                isSubCancel = 0
            }
        }
       // kết thúc lấy dữ liệu từng phần của đơn hàng hủy
       val.O_CODE_OLD = ""
       // lấy cha của order hiện tại
       const orderOldData = queriesHelper.getRowDataFieldWhere('O_CODE,O_CODE_PARENT','TBL_MOA_PAYMT_NICE_CANCEL_PARTICAL_LOG',
       `O_CODE = '${val.O_CODE}' AND M_MOA_CODE = '${req.userInfo.u_martid}'` )
       if(orderOldData){
        val.O_CODE_OLD = orderOldData.O_CODE_PARENT
       }
       if(val.PRODUCT_DELIVERY == 1){
        val.OD_GOODS_CNT = val.OD_GOODS_CNT -1
        val.ORDERS_SALE_PRICE = val.ORDERS_SALE_PRICE - val.OSHIP
       }
       // tiến hành custom địa chỉ gom nhóm
       if(val.U_ADDR_RA && val.U_ADDR_RA != "" && val.GROUP_ADDRESS != ""){
        let addressGroup = ""
         const arrAddress = val.U_ADDR_RA.split(" ")
         if(arrAddress.length > 4){
            arrAddress.splice(3, 1);
            arrAddress.splice(4, 1);
            arrAddress.splice(5, 1);
            arrAddress.splice(6, 1);
            addressGroup = arrAddress.join(' ').replace(/\(/g, '\n(') + '  ';
         }else{
            arrAddress.splice(2, 1);
            arrAddress.splice(3, 1);
            arrAddress.splice(4, 1);
            addressGroup = arrAddress.join(' ').replace(/\(/g, '\n(') + '  ';
         }
       }
       let cartName = ""
       if(val.NICE_CARDNAME){
        cartName = val.NICE_CARDNAME
       }
       if(val.O_PAY_METHOD === 'SKP'){
        ////shuket pay
        cartName = val.NICE_EASYBANKNAME
       }else{
        cartName = val.NICE_CARDNAME
       }
       // get product list of order
       const productList = await orderModel.getOrderDetailData(val.O_CODE, req.userInfo.u_martid, req.dataConnect)

       jsonResponseData.push({
         ...responseOrderList(val, usernameOrder, cartName, address, isUsePushDelivery, pushSetTime, pushCustomSetTime, pushShowTimeDisplay,
        timePickupOrder, dataSubCancel, isSubCancel, deliveryText1, deliveryText2, deliveryText3, statusColorBox, statusColorText ),
         productList: assignSequentialNumbers(productList)
       })
    }
    let jsonDataGroup = {}
    let dataResponse = null
    if(params.sortByArea){
        // gom nhóm các order theo khu vực địa chỉ giao hàng
        // tiến hành gom nhóm các order theo khu vực
        if(listOrder.total > 0){
            jsonResponseData.forEach(item => {
                if(!item.orderPostCode){
                    item.orderPostCode = 99999
                }
                jsonDataGroup[item.orderPostCode] ??= {} // kiểm tra obj này rỗng hay ko => nếu rổng khởi tạo obj {}
                jsonDataGroup[item.orderPostCode].dataOrderGroup ??= [] //=> nếu rổng khởi tạo mảng []
                jsonDataGroup[item.orderPostCode].dataOrderGroup = jsonDataGroup[item.orderPostCode].dataOrderGroup.concat(item)
                jsonDataGroup[item.orderPostCode].total = jsonDataGroup[item.orderPostCode].dataOrderGroup.length
                jsonDataGroup[item.orderPostCode].nameAddress = item.groupAddress ? item.groupAddress : 'No address'
            });
        } 

        //kết thúc gom nhóm các order theo khu vực
        dataResponse =  {
            ...responseDataList(params.page, params.limit, listOrder.total, jsonDataGroup),
            isHideChangeStatusOrder: isHideChangeStatusOrder,
            isHideSetDeliveryPush: isHideSetDeliveryPush,
            sortByArea: true,
            showRowAmount: showRowAmount,
            totalAmount: totalAmount
        }

        //list: return object

    }else{
        //list: return array
        dataResponse =  {
            ...responseDataList(params.page, params.limit, listOrder.total, jsonResponseData),
            isHideChangeStatusOrder: isHideChangeStatusOrder,
            isHideSetDeliveryPush: isHideSetDeliveryPush,
            sortByArea: false,
            showRowAmount: showRowAmount,
            totalAmount: totalAmount
        }

    }

    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
  async getListPaymentCart(req, res, next) {
    const list = await orderModel.getListPayment()

    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, list));
  },
  async getListStatusOrder(req, res, next) {
    const list = await orderModel.getListStatusOrder()

    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, list));
  },
  async getListDeliveryTime(req, res, next) {
    const list = await orderModel.getListDeliveryTime()

    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, list));
  },
  async getMartOrderMinimum(req, res, next) {
    let configDeliveryFee = 0
    const user = req.userInfo
    // danh sách các mart miễn phí tiền ship hàng
    if((MART_USE_DELIVERY_FEE.includes(user.u_martid) && DELIVERY_FEE == 'TARGET_MART') || DELIVERY_FEE === 'ALL_MART'){
        configDeliveryFee = 1
    }
    const martData = await queriesHelper.getRowDataFieldWhere('IS_MIN_AMOUNT,M_SHOPPING_MIN,DELIVERY_CHARGE,DELIVERY_CHARGE_AMOUNT,IS_FREE_DELIVERY,FREE_DELIVERY_AMOUNT',
    'TBL_MOA_MART_CONFIG', ` M_MOA_CODE = '${user.u_martid}'`)
    let deliveryChargeAmount = 0
    const dataResponse = {
        minAmount : martData.M_SHOPPING_MIN,
        isMinAmount: martData.IS_MIN_AMOUNT,
        deliveryCharge: martData.DELIVERY_CHARGE,
        deliveryChargeAmount: deliveryChargeAmount,
        isFreeDelivery: martData.IS_FREE_DELIVERY,
        freeDeliveryAmount: martData.FREE_DELIVERY_AMOUNT,  
    }
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
};

