const { messageError, messageSuccess } = require("../../helper/message");
const { responseSuccess, responseErrorData, responseErrorInput, responseDataList } = require("../../helper/response");
const martModel = require("../../model/mart/mart");
const moment = require("moment");
const { loadImageAws } = require("../../service/loadImage");
const { s3 } = require("../../service/uploadS3");
const  {getSize, getNameMartLogo}  = require("../../helper/upload");
const { bucketImage } = require("../../helper/const");
const fcmModel = require("../../model/fcm/fcm");
const { requsetSearchList } = require("../../helper/request");


module.exports = {
  async getMoaMartList(req, res, next) {
    const logBase = `controller/mart/getMoaMartList: `;

    const params = requsetSearchList(req.body,['appType','isSyncOrder','useStock'])
    const offset =  params.page * params.limit - params.limit;
    const data = await martModel.moaSelectMarts( params, offset );
    let list = [];
    let i = 1;
    let statusStock = "E";
    data.list.forEach((row) => {
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
        mart_seq: row.MART_SEQ.toString(),
        mart_type: martBusinessType,
        mart_code: row.M_MOA_CODE,
        pos_regcode: row.M_POS_REGCODE,
        mart_name: row.MART_NAME,
        logo_url: row.M_LOGO ?  loadImageAws(row.M_LOGO, bucketImage.martlogo) : "",
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
        is_tdc: statusStock,
        time_sync_tdc:
          row.IS_STOCK == "Y" || row.IS_STOCK == "F"
            ? moment(row.INITIAL_STOCK_DATE).format("YYYY-MM-DD hh:mm:ss")
            : "NA",
        time_last_sync_tdc:
          row.IS_STOCK == "Y" && row.LAST_STOCK_DATE != ""
            ? moment(row.LAST_STOCK_DATE).format("YYYY-MM-DD hh:mm:ss")
            : "NA",
        text_color:
          (i + 1) % 2 == 0
            ? "background-color: #504f4f69;"
            : "background-color: #807e7e4f;",
        tposcode: row.T_POS_CODE,
        mart_type_name: {
          en: row.C_ENG,
          kr: row.C_KO,
        },
        is_order_sync: row.USE_TDC_ORDER,
      });
    });

    const dataResponse = {
      ...responseDataList(params.page, params.limit , data.total, list)
    };

    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
  async getDetailMart(req, res, next) {
    const logBase = `controller/mart/getDetailMart: `;
    const martSeq = req.query.mart_seq;

    const activitySummary = {
      app_users: {
        total: "0/0",
        active: "0/0",
        inactive: "0/0",
      },
      push_mms: {
        total: "0/0",
        today: "0/0",
        read_avg: "0% / NA",
      },
      billing: {
        total: "0",
        paid: "0",
        due: "0.0",
      },
    };
    const arraySingle = ["SA", "SW", "SB"];
    const arrayAnotherApp = ["FA", "FW", "FB"];
    const row = await martModel.selectDetailMart(martSeq);
    const getType = await martModel.getTypeWhere(row.M_MOA_CODE);
    let listMartType = [];
    getType.forEach((val) => {
      listMartType.push({
        hq_code: val.M_HQ_CODE,
        moa_code: val.M_MOA_CODE,
        name: val.M_NAME,
        m_app_type: val.M_APP_TYPE,
      });
    });

    //start get info mart payment

    const getListPayment = await martModel.getListPaymentOfMart(
      row.M_MOA_CODE
    );
    let paymentCRC = "N"; // ko dùng thanh toán
    let paymentXOD = "N"; // ko dùng thu hộ

    let dataPaymentReturn = [];
    getListPayment.forEach((item) => {
      if (item.C_CODE === "COD" || item.C_CODE === "CCOD") {
        if (item.IS_USE === "Y") {
          paymentXOD = 'Y' // dùng thu hộ
        }
      }
      if (item.C_CODE !== "COD" && item.C_CODE !== "CCOD") {
        if (item.IS_USE === "Y") {
          paymentCRC = 'Y' // dùng thanh toán
        }
      }
      dataPaymentReturn.push({
        payment_code: item.C_CODE,
        payment_lang_ko: item.C_KO,
        payment_lang_en: item.C_ENG,
        checked: item.IS_USE === "Y" ? true : false,
        is_insert:
          item.IS_INSERT === "Y" || item.IS_INSERT === "N" ? "NO" : "YES",
      });
    });
    //end get info mart payment

    //start check mart type
    const bizhourArr = row.M_BIZHOUR;
    let type = "S";
    let martBusinessType = row.M_TYPE;
    let showfranchise = "N";

    if (martBusinessType === "S") {
      type = "S";
      martBusinessType = "SA";
    }
    if (!martBusinessType || !row.M_TYPE) {
      type = "S";
      martBusinessType = "SA";
    }
    if (row.M_TYPE == "F" && row.M_MOA_CODE == row.M_HQ_CODE) {
      type = "H"; //main mart
      martBusinessType = "FA";
    } else if (row.M_TYPE === "F" && row.M_MOA_CODE != row.M_HQ_CODE) {
      type = "F";
      martBusinessType = "FA";
    }

    if (arraySingle.includes(row.M_TYPE)) {
      type = "S";
    }
    if (
      arrayAnotherApp.includes(row.M_TYPE) &&
      row.M_MOA_CODE == row.M_HQ_CODE
    ) {
      type = "H"; //main mart
    }
    if (
      arrayAnotherApp.includes(row.M_TYPE) &&
      row.M_MOA_CODE != row.M_HQ_CODE
    ) {
      type = "F";
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
    //end check pick up and TDC
    let martInfo = {
      hq_code: row.M_HQ_CODE,
      type: type,
      moa_code: row.M_MOA_CODE,
      mart_type: row.M_APP_TYPE,
      show_franchise: showfranchise,
      logo_name: row.M_LOGO,
      logo_push_name: row.M_LOGO_PUSH,
      logo_url: row.M_LOGO ?  loadImageAws(row.M_LOGO, bucketImage.martlogo) : "",
      logo_push_url: row.M_LOGO
        ?  loadImageAws(row.M_LOGO_PUSH, bucketImage.martlogo)
        : "",
      mart_display_status: row.HIDE_SHUKET,
      name: row.M_NAME,
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
      is_ymart: row.IS_YMART,
      pg_code: row.PG_CODE,
      term_id: row.TERM_ID,
      mpass: row.MPASS,
      bizhour_open: bizhourArr.substring(0, bizhourArr.indexOf(":")),
      bizhour_close: bizhourArr.substring(
        bizhourArr.indexOf(":") + 1,
        bizhourArr.length
      ),
      contact_name: row.M_CONTACT_NAME,
      contact_phone: row.M_CONTACT_PHONE,
      contact_email: row.M_CONTACT_EMAIL,
      s_type: row.M_S_TYPE,
      s_payment: row.M_S_PAYMENT,
      s_date_service: sDateService,
      s_date_billing: sDateBilling,
      s_discount: row.M_S_DISCOUNT,
      s_discount_period: row.M_S_DISCOUNT_PERIOD,
      receipt: row.M_RECEIPT,
      local_partner: row.M_LOCAL_PARTNER,
      mart_common: row.M_DB_CONNECT,
      pop: row.M_POP,
      mms: row.M_MMS,
      mms_deposit: row.M_MMS_DEPOSIT,
      status: row.M_STATUS,
      is_tdc: row.IS_STOCK,
      integrated_messging: row.INTEGRATED_MSG,
      time_sync_tdc: row.IS_STOCK === "Y" ? row.INITIAL_STOCK_DATE : "NA",
      hidecheckbox:
        row.IS_STOCK === "Y" && row.INITIAL_STOCK_DATE !== "" ? 1 : 0,
      op_payment: dataPaymentReturn,
      mart_pm_crc: paymentCRC,
      mart_pm_xod: paymentXOD,
      mart_business_type: martBusinessType,
      old_type: type,
      old_group_mart: row.M_HQ_CODE,
      push_key_android: row.AN_CM_KEY,
      push_key_ios: row.IOS_CM_KEY,
      set_delivery: row.USE_DELIVERY,
      store_set_hour: row.USE_PICKUP,
      store_pk_cod: row.USE_PICKUP_COD,
      store_set_hour_start: timePickUpStart,
      store_set_hour_end: timePickUpEnd,
      store_pick_time_interval: parseInt(row.PICKUP_INTERVAL_TIME),
      order_sync: row.USE_TDC_ORDER,
      can_edit_sync_order: canEditSyncOrder,
      is_custom_app: row.IS_CUSTOM_APP,
      is_extend_brgn: row.USE_EXTEND_BRGN ? row.USE_EXTEND_BRGN : "N",
    };

    const listFCM = await fcmModel.fcmList();
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
      fcm_list: listFCM,
    };

    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },



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
  async getMartOptions(req, res, next) {
    const user = req.userInfo;
    const result = await mainModel.getMartOptions(user.u_martid);
    const dataResponse = {
      list: result,
    };
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
};
