const { textDeFault, martBGColorDefault } = require("./const");
const { assignSequentialNumbers, customArrayImageProduct } = require("./funtion");
const moment = require("moment");
const responseSuccess = (code, message, data) => {
  return {
    status: "success",
    code: code,
    message: message,
    data: data,
  };
};

const responseErrorInput = (errors) => {
  return {
    status: "failure",
    errors: errors,
  };
};

const responseErrorData = (code, filed, message) => {
  return {
    status: "failure",
    errors: [
      {
        code: code,
        field: filed,
        error: message,
      },
    ],
  };
};
const responseDataList = (page, limit, total, list) => {
  return {
    page: page,
    limit: limit,
    total: total,
    list: assignSequentialNumbers(list),
  };
};

//help clean code controller
//help clean code controller
//help clean code controller

const responseMartList = (row) => {
  return {
    mart_code: row.M_MOA_CODE,
    pos_regcode: row.M_POS_REGCODE,
    mart_name: row.MART_NAME,
    city_name: {
      en: row.CT_NAME_EN,
      kr: row.CT_NAME_KR,
    },
    district_name: {
      en: row.DT_NAME_EN,
      kr: row.DT_NAME_KR,
    },
    register_date: moment(row.C_TIME).format("DD-MM-YYYY"),
    subscr_cnt: parseInt(row.SUBSCR_CNT),
    subscr_payment: parseInt(row.SUBSCR_PAYMENT),
    collected: parseInt(row.COLLECTED),
    due: parseInt(row.DUE),
    discount: parseInt(row.DISCOUNT),
    extra_payment: parseInt(row.EXTRA_PAYMENT),
    status: row.STATUS,
    partner_name: row.PARTNER_NAME,
    time_sync_tdc:
      row.IS_STOCK == "Y" || row.IS_STOCK == "F"
        ? moment(row.INITIAL_STOCK_DATE).format("YYYY-MM-DD hh:mm:ss")
        : "NA",
    time_last_sync_tdc:
      row.IS_STOCK == "Y" && row.LAST_STOCK_DATE != ""
        ? moment(row.LAST_STOCK_DATE).format("YYYY-MM-DD hh:mm:ss")
        : "NA",
    tposcode: row.T_POS_CODE,
    mart_type_name: {
      en: row.C_ENG,
      kr: row.C_KO,
    },
    is_order_sync: row.USE_TDC_ORDER,
  };
};
const responseMartDetail = (row) => {
  return {
    hq_code: row.M_HQ_CODE,
    mart_code: row.M_MOA_CODE,
    mart_type: row.M_APP_TYPE,
    logo_name: row.M_LOGO,
    logo_push_name: row.M_LOGO_PUSH,
    mart_display_status: row.HIDE_SHUKET,
    mart_name: row.M_NAME,
    license: row.M_LICENSE,
    phone: row.M_PHONE,
    address: row.M_ADDRESS,
    partner: {
      code: row.SP_CODE,
      name: row.SP_NAME,
    },
    sale_team: {
      code: row.SPT_CODE,
      name: row.SPT_NAME,
    },
    city: {
      code: row.CT_CODE,
      name: row.CT_NAME_KR,
    },
    district: {
      code: row.DT_CODE,
      name: row.DT_NAME_KR,
    },
    pos: {
      code: row.M_POS_CODE,
      name: row.POS_NAME,
    },
    pos_regcode: row.M_POS_REGCODE,
    group_no: row.M_GROUP_NO,
    pos_code: row.T_POS_CODE,
    pos_connect: row.M_POS_CONNECT,
    is_use_ymart: row.IS_YMART, // (Y/N)
    pg_code: row.PG_CODE,
    term_id: row.TERM_ID,
    mpass: row.MPASS,
    contact_name: row.M_CONTACT_NAME,
    contact_phone: row.M_CONTACT_PHONE,
    contact_email: row.M_CONTACT_EMAIL,
    s_type: row.M_S_TYPE, //subcription type
    s_payment: row.M_S_PAYMENT, // billing method (CMS | CREADIT | CASH)
    s_discount: row.M_S_DISCOUNT, // Discount(KRW)
    s_discount_period: row.M_S_DISCOUNT_PERIOD, //Discount period (days)
    receipt: row.M_RECEIPT, // use smart receipt (Y/N) (optional service)
    local_partner: row.M_LOCAL_PARTNER, //use local partner (Y/N) (optional service)
    mart_db: row.M_DB_CONNECT,
    pop: row.M_POP, //use web pop (Y/N) (optional service)
    mms: row.M_MMS,
    mms_deposit: row.M_MMS_DEPOSIT,
    status: row.M_STATUS,
    is_tdc: row.IS_STOCK,
    integrated_messging: row.INTEGRATED_MSG,
    time_sync_tdc: row.IS_STOCK === "Y" ? row.INITIAL_STOCK_DATE : "NA",
    hideInitial: row.IS_STOCK === "Y" && row.INITIAL_STOCK_DATE !== "" ? 1 : 0,
    old_group_mart: row.M_HQ_CODE,
    push_key_android: row.AN_CM_KEY, // key fcm
    push_key_ios: row.IOS_CM_KEY, // key fcm
    set_delivery: row.USE_DELIVERY, // use delivery (y/n)
    store_set_hour: row.USE_PICKUP, // use pickup time (y/n)
    store_pickup_cod: row.USE_PICKUP_COD, // use pickup (y/n)
    store_pick_time_interval: parseInt(row.PICKUP_INTERVAL_TIME), // time pickup if use : 30, 60, 90, 120
    order_sync: row.USE_TDC_ORDER,
    is_custom_app: row.IS_CUSTOM_APP,
    is_extend_brgn: row.USE_EXTEND_BRGN ? row.USE_EXTEND_BRGN : "N",
    account_status: row.M_STATUS,
    is_sync_image_by_group: row.IS_GROUP_SYNC_IMAGES,
    value_sync_image_by_group: row.GROUP_SYNC_IMAGES_CODE
      ? row.GROUP_SYNC_IMAGES_CODE
      : "",
  };
};

const responseProductPrice = (row) => {
  return {
    seq: row.SEQ,
    moa_code: row.M_MOA_CODE,
    pos_regcode: row.M_POS_REGCODE,
    id: row.P_CODE,
    code: row.P_CODE,
    name: row.P_NAME,
    unit: row.P_UNIT,
    barcode: row.P_BARCODE,
    status: row.P_STATUS,
    list_price: row.P_LIST_PRICE,
    provider: row.P_PROVIDER,
    sale_price: row.P_SALE_PRICE,
    is_use_qty: row.IS_USE_QTY,
    default_qty: row.DEFAULT_QTY,
    custom_qty: row.CUSTOM_QTY,
    value_qty: row.CUSTOM_QTY
      ? row.CUSTOM_QTY
      : row.CUSTOM_QTY
      ? moment(row.TIME_START).format("YYYY-MM-DD")
      : null,
      timeStart: row.TIME_START ? moment(row.TIME_START).format("YYYY-MM-DD") : null,
    timeEnd: row.TIME_END ? moment(row.TIME_END).format("YYYY-MM-DD") : null,
    create_name: row.C_NAME,
    create_time: row.C_TIME,
    update_name: row.M_NAME,
    update_time: row.M_TIME,
    sale_title: row.P_SALE_TITLE,
    sale_src: row.SALE_SRC,
  };
};
const responseProductInventory = (row) => {
  return {
    seq: row.SEQ,
    moa_code: row.M_MOA_CODE,
    pos_regcode: row.M_POS_REGCODE,
    code: row.P_CODE,
    name: row.P_NAME,
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
    is_show_price: row.PRICE_CUSTOM_STATUS,
    use_time: row.USE_TIME,
    time_start: row.TIME_START
      ? moment(row.TIME_START).format("YYYY-MM-DD")
      : null,
    time_end: row.TIME_END ? moment(row.TIME_END).format("YYYY-MM-DD") : null,
    create_name: row.C_NAME,
    create_time: row.C_TIME,
    update_name: row.M_NAME,
    update_time: row.M_TIME,
  };
};
const responseProductRegisted = (row) => {
  return {
    seq: row.SEQ,
    moa_code: row.M_MOA_CODE,
    pos_regcode: row.M_POS_REGCODE,
    id: row.P_CODE,
    code: row.P_CODE,
    name: row.P_NAME,
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
    is_show_price: row.PRICE_CUSTOM_STATUS,
    is_pro_maxqty: row.P_USE_MAXQTY_PD,
    pro_max_qty: !row.P_VALUE_MAXQTY_PD ? 0 : row.P_VALUE_MAXQTY_PD,
    pro_max_qty_default: !row.P_VALUE_MAXQTY_PD ? 0 : row.P_VALUE_MAXQTY_PD,
    is_pro_minqty: row.P_USE_MINQTY_PD,
    pro_min_qty: !row.P_VALUE_MINQTY_PD ? 0 : row.P_VALUE_MINQTY_PD,
    pro_min_qty_default: !row.P_VALUE_MINQTY_PD ? 0 : row.P_VALUE_MINQTY_PD,
    use_time: row.USE_TIME,
    images: customArrayImageProduct(row.P_IMG),
    time_start: row.TIME_START
      ? moment(row.TIME_START).format("YYYY-MM-DD")
      : null,
    time_end: row.TIME_END ? moment(row.TIME_END).format("YYYY-MM-DD") : null,
    tags: row.P_TAGS,
    create_name: row.C_NAME,
    create_time: row.C_TIME,
    update_name: row.M_NAME,
    update_time: row.M_TIME,
  };
};
const responseProductUnregisted = (row) => {
  return {
    posRegcode: row.M_POS_REGCODE,
    id: row.P_CODE,
    code: row.P_CODE,
    name: row.P_NAME,
    category: row.P_CAT,
    categorySub: row.P_CAT_SUB,
    unit: row.P_UNIT,
    barcode: row.BARCODE,
    price: row.P_LIST_PRICE,
    provider: row.P_PROVIDER,
  };
};
const responseOrderList = (
  val,
  usernameOrder,
  cartName,
  address,
  isUsePushDelivery,
  pushSetTime,
  pushCustomSetTime,
  pushShowTimeDisplay,
  timePickupOrder,
  dataSubCancel,
  isSubCancel,
  deliveryText1,
  deliveryText2,
  deliveryText3,
  statusColorBox,
  statusColorText
) => {
  return {
    orderCode: val.O_CODE,
    orderCustomerPhone: val.U_ADDR_PHONE,
    orderGoodName: val.OD_GOODS_NAME,
    orderGoodCNT: val.OD_GOODS_CNT,
    orderDate: moment(val.C_TIME).format("YYYY-MM-DD HH:mm:ss"),
    orderTotalPrice: val.ORDERS_SALE_PRICE,
    orderShipping: val.OSHIP,
    orderCoupon: val.O_COUPON,
    orderPoint: val.O_POINT,
    orderPayPrice: val.O_PAY_AMOUNT,
    orderCartName: val.PAY_METHOD_CARD_KO,
    orderPayMethod: val.PAY_METHOD,
    orderPayType: val.O_PAY_TYPE,
    orderStatusText: val.ORDERS_GRP,
    orderStatusCode: val.O_STATUS,
    orderCancelComment: val.OD_CANCEL_CMNT, // lý do hủy
    orderRFLEX: val.OD_RFEX_CMNT,
    isPrint: val.IS_PRINT,
    orderBillOld: val.O_PAY_AMOUNT_HIS ? val.O_PAY_AMOUNT_HIS : 0,
    isWeburlOrder: val.O_WEBURL,
    pushCreateTime: val.OB_TIME_CREATE,
    orderType: val.O_DELIVERY_TYPE,
    isDelivery: val.IS_DELIVERY,
    groupAddress: val.GROUP_ADDRESS,
    orderPostCode: val.U_POST_CODE,
    isCheck: val.IS_CHECK,
    bundleOrder: val.BUNDLE_ORDER,
    deliveryType: val.DELIVERY_TYPE,
    deliveryDate: val.DELIVERY_DATE
      ? moment(val.DELIVERY_DATE).format("YYYY-MM-DD")
      : "",
    orderAddressDistrict: val.U_ADDR_CITY,
    orderAddressCity: val.U_ADDR_STATE,
    orderCustomer: usernameOrder,
    orderNicePayCartName: cartName,
    orderAddress: address,
    isUsePushDelivery: isUsePushDelivery,
    pushSetTime: pushSetTime,
    pushCustomSetTime: pushCustomSetTime,
    pushShowTimeDisplay: pushShowTimeDisplay,
    timePickupOrder: timePickupOrder,
    dataSubCancel: dataSubCancel,
    isSubCancel: isSubCancel,
    deliveryText1: deliveryText1,
    deliveryText2: deliveryText2,
    deliveryText3: deliveryText3,
    statusColorBox: statusColorBox,
    statusColorText: statusColorText,
  };
};
const responseOrderProduct = (row) => {
  return {
    seq: row.SEQ,
    moaCode: row.M_MOA_CODE,
    posRegcode: row.M_POS_REGCODE,
    code: row.P_CODE,
    name: row.P_NAME,
    unit: row.P_UNIT,
    barcode: row.P_BARCODE,
    status: row.P_STATUS,
    list_price: row.P_LIST_PRICE,
    provider: row.P_PROVIDER,
    sale_price: row.P_SALE_PRICE,
    total_qty: row.TOTAL_QTY,
    total_price: row.TOTAL_PRICE,
  };
};
const responseNoticeAppList = (val) =>{
  return{
    seq: val.SEQ,
    code: val.NT_MSG_CODE,
    mMoaCode: val.M_MOA_CODE,
    title: val.NT_MSG_TITLE,
    image: LINK_BACKEND_DEV + val.NT_MSG_IMAGES,
    content: val.NT_MSG_DETAIL,
    sdate: val.NT_MSG_SDATE,
    edate: val.NT_MSG_EDATE,
    martSisplay: val.NT_MSG_DISPLAY,
    noticeStatus: val.NT_MSG_STATUS,
    targetScreenOption: val.NT_SCREEN_TARGET_OPTION,
    cTime: val.C_TIME,
    mTime: val.M_TIME,
  }
}
const responseImageBannerCouponList = (val) =>{
  return {
    code:  val.SEQ,
    name: val.CI_NAME,
    category: val.C_KO,
    categoryEn: val.C_ENG,
    image: val.CI_URI,
    file: val.CI_FILE,
    status: val.CI_STATUS,
    cTime: val.C_TIME,
    cId:val.C_ID,
    mTime: val.M_TIME,
    mId: val.M_ID,
    type: val.CI_TYPE,
    typeCate: val.CI_THEME,
    typeOld: val.CI_TYPE,
    typeCateOld: val.CI_THEME,
    nameOld: val.CI_NAME
  }
}
const responseDeliveryAreaList = (row) =>{
  return {
    seq: row.seq,
    address_name: row.address_name,
    road_address_name: row.road_address_name,
    road_address_name: row.road_address_name,
    region_1depth_name: row.region_1depth_name,
    region_2depth_name: row.region_2depth_name,
    zone_no: row.zone_no,
    type: row.type,
  }
}
const reponseAppInfo = (row, isShowSlideNoti, timePickUpStart, timePickUpEnd, cateScreenCode, reviewPush, reviewPushHour, reviewPushDays,
   reviewPushTime, reviewPushContent, cartPush, cartPushHour, cartPushDays, cartPushTime, cartPushContent, showMartCompanyInfo, martName,
   license, contactName, cs_line1, cs_line2) =>{
  return {
    moaCode : row.M_MOA_CODE,
    phone: row.M_PHONE,
    martIntroApp : row.M_INTRO_APP ? row.M_INTRO_APP : row.M_NAME + textDeFault.intro1 + row.M_NAME + textDeFault.intro2,
    martBGClorApp : row.M_COLOR_APP ? row.M_COLOR_APP : martBGColorDefault,
    timeSlideNoti: row.M_TIME_SET_SLIDE_APP ? row.M_TIME_SET_SLIDE_APP : 3, // thời gian chuyển slide 
    cTime: row.C_TIME ? row.C_TIME : '',
    mTime: row.M_TIME ? row.M_TIME :"",
    cName: row.C_NAME ? row.C_NAME : "",
    mName: row.M_NAME ? row.M_NAME : "",
    address: row.M_ADDRESS,
    city:{
        code: row.CT_CODE,
        name: row.CT_NAME_KR
    },
    district : {
        code: row.DT_CODE,
        name: row.DT_NAME_KR
    },
    setDelivery: row.USE_DELIVERY,
    pickupSetHour: row.USE_PICKUP,
    pickupCod : row.USE_PICKUP_COD,
    setIntro: row.USE_INTRO,
    isUploadLogo: 0,
    isUploadBanner : 0,
    isShowSlideNoti: isShowSlideNoti, // ẩn hay hiện slide notice
    pickupStartHour: timePickUpStart,
    pickupEndHour: timePickUpEnd,
    cateScreenCode: cateScreenCode,
    reviewPush: reviewPush,
    reviewPushHour: reviewPushHour,
    reviewPushDays: reviewPushDays,
    reviewPushTime: reviewPushTime,
    reviewPushContent: reviewPushContent,
    cartPush: cartPush,
    cartPushHour: cartPushHour,
    cartPushDays: cartPushDays,
    cartPushTime: cartPushTime,
    cartPushContent: cartPushContent,
    showMartCompanyInfo: showMartCompanyInfo,
    martName: martName,
    license: license,
    contactName: contactName,
    csLine1 :cs_line1,
    csLine2: cs_line2

  }
}

const responseProductDetai = (product) =>{
  return {
    seq: product.SEQ,
    moa_code: product.M_MOA_CODE,
    pos_regcode: product.M_POS_REGCODE,
    code: product.P_CODE,
    name: product.P_NAME,
    unit: product.P_UNIT,
    barcode: product.P_BARCODE,
    list_price: product.P_LIST_PRICE,
    provider: product.P_PROVIDER,
    sale_price: product.P_SALE_PRICE,
    sale_title: product.P_SALE_TITLE,
  }
}
module.exports = {
  responseProductDetai, 
  reponseAppInfo,
  responseDeliveryAreaList,
  responseImageBannerCouponList,
  responseNoticeAppList,
  responseOrderProduct,
  responseOrderList,
  responseProductUnregisted,
  responseProductRegisted,
  responseProductInventory,
  responseProductPrice,
  responseMartDetail,
  responseMartList,
  responseSuccess,
  responseErrorInput,
  responseErrorData,
  responseDataList,
};
