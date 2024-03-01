const { messageError, messageSuccess } = require("../../helper/message");
const { responseSuccess, responseErrorData, responseErrorInput, responseDataList, responseMartList, responseMartDetail } = require("../../helper/response");
const martModel = require("../../model/mart/mart");
const moment = require("moment");
const { loadImageAws } = require("../../service/loadImage");
const { s3 } = require("../../service/uploadS3");
const  {getSize, getNameMartLogo}  = require("../../helper/upload");
const { bucketImage, appBottomMenu, activitySummary } = require("../../helper/const");
const fcmModel = require("../../model/fcm/fcm");
const { requsetSearchList } = require("../../helper/request");
const logger = require("../../../config/logger");
const queriesHelper = require("../../helper/queries");
const userModel = require("../../model/user/account");
const { generateNewTopic } = require("../../helper/funtion");


module.exports = {
  // get list
  async getMoaMartList(req, res, next) {
    const logBase = `controller/mart/getMoaMartList: `;

    const params = requsetSearchList(req.body,['appType','isSyncOrder','useStock'])
    const offset =  params.page * params.limit - params.limit;
    const data = await martModel.moaSelectMarts( params, offset );
    let list = [];
    let i = 1;
    let statusStock = "E";

    // check logo mart có hợp lệ ko => nếu ko sử dụng bucket của tôi else sử dụng bucket shuket hiện tại
    const listLogo = await Promise.all(data.list.map(row => loadImageAws(row.M_LOGO, bucketImage.martlogo, row.M_MOA_CODE)));

    for  (const row of data.list) {
          if (row.IS_STOCK == "Y" && row.IS_STOP_STOCK == "N") {
        statusStock = "Y"; //USE STOCK
      }
      if (row.IS_STOCK == "Y" && row.IS_STOP_STOCK == "Y") {
        statusStock = "N"; // NOT USE STOCK
      }
      let martBusinessType = row.M_TYPE;
      if (row.M_TYP == "S") {
        martBusinessType = "SA";
      }
      if (row.M_TYPE == "F") {
        martBusinessType = "FA";
      }
      list.push({
        id: i++,
        mart_type: martBusinessType,
        mart_seq: row.MART_SEQ.toString(),
        logo_url: row.M_LOGO ?  listLogo.find((lg)=>lg.code ===  row.M_MOA_CODE)?.logo : "",
        is_tdc: statusStock,
        text_color:
          (i + 1) % 2 == 0
            ? "background-color: #504f4f69;"
            : "background-color: #807e7e4f;",
        ...responseMartList(row)
      });
    }

    const dataResponse = {
      ...responseDataList(params.page, params.limit , data.total, list)
    };

    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
  // get detail
  async getDetailMart(req, res, next) {
    const logBase = `controller/mart/getDetailMart: `;
    const martSeq = req.query.mart_seq;

 
    const arraySingle = ["SA", "SW", "SB"];
    const arrayAnotherApp = ["FA", "FW", "FB"];
    const row = await martModel.selectDetailMart(martSeq);
    const listHQgroup = await martModel.getlistHQgroup(row.M_MOA_CODE);
    let listMartType = [];
    listHQgroup.forEach((val) => {
      listMartType.push({
        hq_code: val.M_HQ_CODE,
        mart_code: val.M_MOA_CODE,
        mart_name: val.M_NAME,
        m_app_type: val.M_APP_TYPE,
      });
    });

    //start get info mart payment

    const getListPayment = await martModel.getListPaymentOfMart(
      row.M_MOA_CODE
    );
    let paymentOnline = "N"; //  dùng các phương thức thanh toán online
    let paymentCOD = "N"; //  dùng thu hộ

    let dataPaymentReturn = [];
    getListPayment.forEach((item) => {
      if (item.C_CODE === "COD" || item.C_CODE === "CCOD") {
        if (item.IS_USE === "Y") {
          paymentCOD = 'Y' // dùng thu hộ
        }
      }
      if (item.C_CODE !== "COD" && item.C_CODE !== "CCOD") {
        if (item.IS_USE === "Y") {
          paymentOnline = 'Y' // dùng các phương thức thanh toán online
        }
      }
      dataPaymentReturn.push({
        payment_code: item.C_CODE,
        payment_lang_ko: item.C_KO,
        payment_lang_en: item.C_ENG,
        checked: item.IS_USE === "Y" ? true : false,
      });
    });
    //end get info mart payment

    //start check mart head/FranchiseType
    const bizhourArr = row.M_BIZHOUR;
    let headFranchiseType = "S";
    let martBusinessType = row.M_TYPE;
    let showfranchise = "N";

    if (martBusinessType === "S") {
      headFranchiseType = "S";
      martBusinessType = "SA";
    }
    if (!martBusinessType || !row.M_TYPE) {
      headFranchiseType = "S";
      martBusinessType = "SA";
    }
    if (row.M_TYPE == "F" && row.M_MOA_CODE == row.M_HQ_CODE) {
      headFranchiseType = "H"; //main mart
      martBusinessType = "FA";
    } else if (row.M_TYPE === "F" && row.M_MOA_CODE != row.M_HQ_CODE) {
      headFranchiseType = "F";
      martBusinessType = "FA";
    }

    if (arraySingle.includes(row.M_TYPE)) {
      headFranchiseType = "S";
    }
    if (
      arrayAnotherApp.includes(row.M_TYPE) &&
      row.M_MOA_CODE == row.M_HQ_CODE
    ) {
      headFranchiseType = "H"; //main mart
    }
    if (
      arrayAnotherApp.includes(row.M_TYPE) &&
      row.M_MOA_CODE != row.M_HQ_CODE
    ) {
      headFranchiseType = "F";
    }

    if (
      row.M_APP_TYPE != "SG" &&
      row.M_TYPE === "F" &&
      row.M_MOA_CODE !== row.M_HQ_CODE
    ) {
      showfranchise = "Y";
    } else {
      showfranchise = "N";
    }

    //end check mart type

    //start check date use service of MOA
    let sDateService = "";
    let sDateBilling = "";

    if (
      row.M_S_DATE_SERVICE == "0000-00-00 00:00:00" ||
      row.M_S_DATE_SERVICE == null
    ) {
      sDateService = "";
    } else {
      sDateService = moment(row.M_S_DATE_SERVICE).format("YYYY-MM-DD");
    }

    if (
      row.M_S_DATE_BILLING == "0000-00-00 00:00:00" ||
      row.M_S_DATE_SERVICE == null
    ) {
      sDateBilling = "";
    } else {
      sDateBilling = moment(row.M_S_DATE_BILLING).format("YYYY-MM-DD");
    }
    //end check date use service of MOA

    //start check pick up and TDC
    let canEditSyncOrder = "N";
    let timePickUpStart = "";
    let timePickUpEnd = "";
    if (row.USE_TDC_ORDER === "Y") {
      canEditSyncOrder = "Y";
    } else {
      canEditSyncOrder = "Y";
    }

    if (row.USE_PICKUP == "Y") {
      timePickUpStart = row.M_PICKUP_START ? row.M_PICKUP_START : "";
      timePickUpEnd = row.M_PICKUP_END ? row.M_PICKUP_END : "";
    } else {
      timePickUpStart = "";
      timePickUpEnd = "";
    }
    //load image kiểm tra bucket 
     const logoUrl = row.M_LOGO ? await loadImageAws(row.M_LOGO, bucketImage.martlogo, row.M_MOA_CODE) :""
     const logoPushUrl = row.M_LOGO_PUSH ? await loadImageAws(row.M_LOGO_PUSH, bucketImage.martlogo, row.M_MOA_CODE) :""

    //business open, close hour
    const bizhour_open = (bizhourArr.substring(0, bizhourArr.indexOf(":"))).slice(0, 2) +":"+(bizhourArr.substring(0, bizhourArr.indexOf(":"))).slice( 2) 
    const bizhour_close = (bizhourArr.substring( bizhourArr.indexOf(":") + 1,bizhourArr.length)).slice(0, 2) +":"+(bizhourArr.substring( bizhourArr.indexOf(":") + 1,bizhourArr.length)).slice(2) 
    
    //end check pick up and TDC
    let martInfo = {
      store_set_hour_start: timePickUpStart, // Pickup hours start
      store_set_hour_end: timePickUpEnd, // Pickup hours end
      headFranchiseType: headFranchiseType, // head/ franchies mart
      show_franchise: showfranchise,
      s_date_service: sDateService, // Service start date
      s_date_billing: sDateBilling, // Billing start date
      op_payment: dataPaymentReturn, //list payment online + COD
      paymentOnline: paymentOnline, // use payment online 
      paymentCOD: paymentCOD, //use payment COD 
      mart_business_type: martBusinessType,
      old_type: headFranchiseType,
      can_edit_sync_order: canEditSyncOrder,
      logo_url: logoUrl.logo,
      logo_push_url: logoPushUrl.logo,
      bizhour_open: bizhour_open,
      bizhour_close: bizhour_close,
      ...responseMartDetail(row)
    };
    const configCustom = await martModel.getDataConfigCustomMart(
      row.M_MOA_CODE
    );
    let receiveOption = "N";
    let receiveBeginHours = "";
    let receiveEndHours = "";

    if (configCustom && configCustom.DATA_CONFIG) {
      const dataConfig = JSON.parse(configCustom.DATA_CONFIG);

      receiveOption = dataConfig.receive_option;
      if (dataConfig.receive_option === "C") {
        receiveBeginHours = dataConfig.receive_begin_hours;
        receiveEndHours = dataConfig.receive_end_hours;
      }
    }

    const dataResponse = {
      mart_info: {
        ...martInfo,
        receive_option: receiveOption,
        receive_begin_hours: receiveBeginHours,
        receive_end_hours: receiveEndHours,
      },
      activity_summary: activitySummary,
      mart_list: listMartType,
    };

    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
  //add mart
  async addMart(req, res, next) {
    let _FILED = req.fieldData
    const user = req.userInfo
   
   
    try {
      //tìm và tạo moa mart code mới
      const mart_code = await martModel.getMaxMartCode()
      console.log('mart_code', mart_code)
      _FILED.hq_code = ""
      if(_FILED.headFranchiseType === 'S'){
        _FILED.hq_code = mart_code
      }
      if(_FILED.headFranchiseType === 'H'){
        //head
        _FILED.hq_code = mart_code
      }
      if(_FILED.headFranchiseType === 'F'){
        //franchise
        _FILED.hq_code = _FILED.group_mart_code
      }
      if(_FILED.headFranchiseType === "" || _FILED.headFranchiseType === 'N'){
        _FILED.hq_code = mart_code
      }
     //insert basic info
     let result = await martModel.insertMartBasicInfo(_FILED, user.user_id, mart_code)
     if(result){
       logger.writeLog("info", 'insert Mart Basic Info success: ' + mart_code);
     }
     
    // insert Mart subcription success
    result = await martModel.insertMartSubcription(_FILED.s_type, moment(_FILED.s_date_service).format('YYYY-MM-DD HH:mm:ss'),
    moment(_FILED.s_date_billing).format('YYYY-MM-DD HH:mm:ss'), _FILED.s_discount, _FILED.s_discount_period, _FILED.s_payment,
    moment().format('YYYY-MM-DD HH:mm:ss'),  user.user_id, mart_code)
     if(result){
       logger.writeLog("info", 'insert Mart subcription success: ' + mart_code);
     }

    // insert list payment method online and COD
    for (const item of _FILED.op_payment) {
      await queriesHelper.insertTableWhere('TBL_MOA_MART_PAYMETHOD',' M_MOA_CODE, M_PM_CODE, IS_USE, C_TIME, C_ID',
      `'${mart_code}','${item.payment_code}','${item.checked ? 'Y' : 'N'}','${moment().format('YYYY-MM-DD HH:mm:ss')}','${user.user_id}'`)
    }
    logger.writeLog("info", 'insert Mart payment method: ' + mart_code);

    console.log(_FILED)
    //insert to config of mart
     result = await martModel.insertMartConfig(_FILED, moment().format('YYYY-MM-DD HH:mm:ss') ,user.user_id, mart_code )
     if(result){
       logger.writeLog("info", 'update Mart config success: ' + mart_code);
     }

     if(_FILED.add_group === ""){
      _FILED.add_group = 'M'
     }
     if(_FILED.add_level === ""){
      _FILED.add_level = '301'
     }
     //insert to account of mart
     result = await userModel.insertAccountMart(_FILED, moment().format('YYYY-MM-DD HH:mm:ss') ,user.user_id, mart_code)
     if(result){
      logger.writeLog("info", 'insert account of mart success: ' + mart_code);
    }

    //insert version app for mart
    const osArr = ['AN', 'IO']
    for (const item of osArr) {
      await queriesHelper.insertTableWhere('TBL_MOA_APP_VER_MAIN',' M_MOA_CODE, AV_OS_TYPE, C_TIME, C_ID',
      `'${mart_code}','${item}','${moment().format('YYYY-MM-DD HH:mm:ss')}','${user.user_id}'`)
    }
    logger.writeLog("info", 'insert version app for mart success: ' + mart_code);    

    // insert bottom menu for app mart
    for (const val of appBottomMenu) {
      await queriesHelper.insertTableWhere('TBL_MOA_APP_TB_TREE',' M_MOA_CODE, T_TB_CODE, T_TB_TITLE, T_TB_ICON, T_TB_STATUS,  C_TIME, C_ID',
      `'${mart_code}','${val.T_TB_CODE}','${val.T_TB_TITLE}','${val.T_TB_ICON}','${val.T_TB_STATUS}','${moment().format('YYYY-MM-DD HH:mm:ss')}','${user.user_id}'`)
    }
    logger.writeLog("info", 'insert bottom menu for app mart success: ' + mart_code);   
    
    // //insert topic fcm for  mart
    const topicFcm = generateNewTopic(mart_code, _FILED.mart_name)
    for (const val  of topicFcm) {
      await queriesHelper.insertTableWhere('TBL_MOA_NOTI_FCM_TOPIC',' M_MOA_CODE, NT_TPC_CODE, NT_TPC_GRP, NT_TPC_NAME, NT_TPC_STATUS, NT_TPC_TYPE,  C_TIME, C_ID',
      `'${mart_code}','${val.NT_TPC_CODE}','${val.NT_TPC_GRP}','${val.NT_TPC_NAME}','${val.NT_TPC_STATUS}','${val.NT_TPC_TYPE}'
      ,'${moment().format('YYYY-MM-DD HH:mm:ss')}','${user.user_id}'`)
    }
    logger.writeLog("info", 'insert topic fcm for  mart success: ' + mart_code);   
     
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success,  messageSuccess.Success));
    } catch (error) {
      return res
      .status(200)
      .json(responseErrorInput(error.message));
    
    }
    
  },
  //update mart
  async updateMart(req, res, next) {
    const user = req.userInfo;

    let _FILED = req.fieldData

    let group_mart_code = ""
    if(_FILED.headFranchiseType === 'H'){
      //Headquarters
      group_mart_code = _FILED.mart_code
    }else if(_FILED.headFranchiseType === 'F'){
      //Franchise
      group_mart_code = _FILED.hq_code
    }else{
      group_mart_code = _FILED.mart_code
    }
    if(_FILED.mart_type === 'SK'){
      group_mart_code = _FILED.mart_code
    }

    try {
       //update Mart Basic Info success
    let result = await martModel.updateMartBasicInfo(_FILED, group_mart_code, user.user_id)
      if(result){
        logger.writeLog("info", 'update Mart Basic Info success: ' + _FILED.mart_code);
      }

    //update Mart subcription success
     result = await martModel.updateMartSubcription(_FILED.s_type, moment(_FILED.s_date_service).format('YYYY-MM-DD HH:mm:ss'),
     moment(_FILED.s_date_billing).format('YYYY-MM-DD HH:mm:ss'), _FILED.s_discount, _FILED.s_discount_period, _FILED.s_payment,
     moment().format('YYYY-MM-DD HH:mm:ss'),  user.user_id, _FILED.mart_code)
      if(result){
        logger.writeLog("info", 'update Mart subcription success: ' + _FILED.mart_code);
      }

    //update list payment method online and COD
    for (const item of _FILED.op_payment) {
      await queriesHelper.updateTableWhere('TBL_MOA_MART_PAYMETHOD',
      ` IS_USE = '${item.checked ? 'Y' : 'N'}', M_TIME = '${moment().format('YYYY-MM-DD HH:mm:ss')}', M_ID = '${user.user_id}'`,
      ` M_MOA_CODE = '${_FILED.mart_code}' AND M_PM_CODE = '${item.payment_code}' `)
    }
    logger.writeLog("info", 'update Mart payment method: ' + _FILED.mart_code);

    //update to config of mart
    result = await martModel.updateMartConfig(_FILED, moment().format('YYYY-MM-DD HH:mm:ss') ,user.user_id )
    if(result){
      logger.writeLog("info", 'update Mart config success: ' + _FILED.mart_code);
    }

    //update to config custom of mart
    const configCustom = await queriesHelper.getRowDataWhere('TBL_MOA_MART_CONFIG_CUSTOM', ` TYPE = 'RCT' AND M_MOA_CODE = '${_FILED.mart_code}'`)
    let dataConfig = {
      receive_option : _FILED.receive_option,
      receive_begin_hours : _FILED.receive_begin_hours,
      receive_end_hours : _FILED.receive_end_hours
    }
    if(configCustom?.DATA_CONFIG){
      // có thì update
      await queriesHelper.updateTableWhere('TBL_MOA_MART_CONFIG_CUSTOM', `DATA_CONFIG = '${JSON.stringify(dataConfig)}'`,
      ` M_MOA_CODE = '${_FILED.mart_code}' AND TYPE = 'RCT' AND STATUS = 'A' `
      )
    }else{
      // ko có thì insert
      await queriesHelper.insertTableWhere('TBL_MOA_MART_CONFIG_CUSTOM', ' M_MOA_CODE, TYPE, DATA_CONFIG, STATUS, C_TIME, C_ID ',
      `'${_FILED.mart_code}', 'RCT', '${JSON.stringify(dataConfig)}', 'A', '${moment().format('YYYY-MM-DD HH:mm:ss')}', '${user.user_id}'`,
      )
    }
    logger.writeLog("info", 'update Mart config custom success: ' + _FILED.mart_code);

    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, messageSuccess.Success));
    } catch (error) {
      return res
      .status(200)
      .json(responseErrorInput(error.message));
    }
  },


  //update logo
  async uploadMartLogo(req, res, next) {
    if (req.multerError) {
      return res
      .status(500)
      .json(responseErrorInput(req.multerError));
  }
    const file = req.file;
    const newNameFile = getNameMartLogo() // generate new name
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: "mart/logo/" + newNameFile,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await s3.upload(params).promise();
      s3.upload(params, async (error, data) => {
        if (error) {
          return res
            .status(500)
            .json(responseErrorInput( error));
        } else {
          const dimension = await getSize(req.file.buffer)
          const dataResponse = {
            image_name: newNameFile,
            image_url: data.Location,
            width: dimension && dimension.width,
            height: dimension && dimension.height,
          };
          return res
            .status(200)
            .json(responseSuccess(200, messageSuccess.Success, dataResponse));
        }
      });
    } catch (error) {
      return res
            .status(500)
            .json(responseErrorInput( error));
    }
  },
  //HQ mart list
  async getListGroupMart(req, res, next) {
    const user = req.userInfo;
    const result = await martModel.getListGroupMart();
    const dataResponse = {
      list: result,
    };
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
  async getMartOptions(req, res, next) {
    const user = req.userInfo;
    const result = await martModel.getMartOptions(user.u_martid);
    const dataResponse = {
      list: result,
    };
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
};
