const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");
const { password_verify } = require("../../service/auth");
const uniqid = require('uniqid');
const { generateNextMoaCode } = require("../../helper/funtion");



module.exports = class martModel {
  static async getMaxMartCode(){
    let logBase = `models/martModel.getMaxMartCode: `;

    const sql = ` SELECT MAX(M_MOA_CODE) AS code FROM TBL_MOA_MART_BASIC`;
    const [rows] = await pool.mysqlPool.query(sql);
    let code = ""
    if(!rows[0]){
      code = 'M000000001'
    }else{
      code = generateNextMoaCode(rows[0].code)
    }
    return code;
  }
  static async moaSelectMarts(
    {
      limit,
      page,
      appType,
      keywordType,
      keywordValue,
      isSyncOrder,
      useStock,
      status,
    },
    offset
  ) {
    let logBase = `models/martModel.moaSelectMarts: `;

    try {
      let sql = ` SELECT
        MB.SEQ AS MART_SEQ, MB.SP_CODE, MB.SPT_CODE, MB.M_MOA_CODE, MC.M_POS_REGCODE, MB.M_NAME AS MART_NAME, 
        MB.M_DISTRICT AS DISTRICT_NAME, MB.C_TIME, MB.M_LOGO,
        '0' AS SUBSCR_CNT,
        '0' AS SUBSCR_PAYMENT,
        '0' AS COLLECTED,
        '0' AS DUE,
        '0' AS DISCOUNT,
        '0' AS EXTRA_PAYMENT,
        MB.M_STATUS AS STATUS,
        SB.SP_NAME AS PARTNER_NAME,
        MCAC.CT_NAME_EN, MCAC.CT_NAME_KR, MCAD.DT_NAME_EN, MCAD.DT_NAME_KR,
        MC.IS_STOCK,
        MC.IS_STOP_STOCK,
        MC.INITIAL_STOCK_DATE,
        MC.LAST_STOCK_DATE,
        MC.T_POS_CODE,
        MCC.C_KO,
        MCC.C_ENG,
        MB.M_TYPE,
        MC.USE_TDC_ORDER
    FROM
        TBL_MOA_MART_BASIC AS MB
        JOIN TBL_MOA_MART_CONFIG AS MC ON MC.M_MOA_CODE = MB.M_MOA_CODE
        JOIN TBL_SP_BASIC AS SB ON MB.SP_CODE = SB.SP_CODE
        LEFT JOIN TBL_MOA_CODE_COMMON AS MCC ON MCC.C_CODE = MC.M_APP_TYPE AND MCC.C_GRP = 'AT'
        LEFT JOIN
        (
            SELECT
                MCAC.CT_CODE, MCAC.CT_NAME_EN, MCAC.CT_NAME_KR
            FROM
                TBL_MOA_CODE_AREA AS MCAC
            GROUP BY
                MCAC.CT_CODE, MCAC.CT_NAME_EN, MCAC.CT_NAME_KR
        ) AS MCAC ON MB.CT_CODE = MCAC.CT_CODE
        LEFT JOIN
        (
            SELECT
                MCAD.DT_CODE, MCAD.DT_NAME_EN, MCAD.DT_NAME_KR
            FROM
                TBL_MOA_CODE_AREA AS MCAD
            GROUP BY
                MCAD.DT_CODE, MCAD.DT_NAME_EN, MCAD.DT_NAME_KR
        ) AS MCAD ON MB.DT_CODE = MCAD.DT_CODE `;
      let sqlCount = ` SELECT COUNT(MB.SEQ) AS CNT
  FROM
      TBL_MOA_MART_BASIC AS MB
      JOIN TBL_MOA_MART_CONFIG AS MC ON MC.M_MOA_CODE = MB.M_MOA_CODE
      JOIN TBL_SP_BASIC AS SB ON MB.SP_CODE = SB.SP_CODE
      LEFT JOIN TBL_MOA_CODE_COMMON AS MCC ON MCC.C_CODE = MC.M_APP_TYPE AND MCC.C_GRP = 'AT'
      LEFT JOIN
      (
          SELECT
              MCAC.CT_CODE, MCAC.CT_NAME_EN, MCAC.CT_NAME_KR
          FROM
              TBL_MOA_CODE_AREA AS MCAC
          GROUP BY
              MCAC.CT_CODE, MCAC.CT_NAME_EN, MCAC.CT_NAME_KR
      ) AS MCAC ON MB.CT_CODE = MCAC.CT_CODE
      LEFT JOIN
      (
          SELECT
              MCAD.DT_CODE, MCAD.DT_NAME_EN, MCAD.DT_NAME_KR
          FROM
              TBL_MOA_CODE_AREA AS MCAD
          GROUP BY
              MCAD.DT_CODE, MCAD.DT_NAME_EN, MCAD.DT_NAME_KR
      ) AS MCAD ON MB.DT_CODE = MCAD.DT_CODE `
      let whereStr = " WHERE 1=1 ";
      if (appType) {
        whereStr += ` AND MC.M_APP_TYPE = '${appType}' `;
      }
      if (keywordType && keywordValue) {
        if (keywordType == "mart_name") {
          whereStr += ` AND MB.M_NAME LIKE '%${keywordValue}%' `;
        }
        if (keywordType == "mart_code") {
          whereStr += ` AND MB.M_MOA_CODE LIKE '%${keywordValue}%' `;
        }
        if (keywordType == "mart_p_regcode") {
          whereStr += ` AND MB.M_POS_REGCODE LIKE '%${keywordValue}%' `;
        }
        if (keywordType == "mart_hq_code") {
          whereStr += ` AND MB.M_HQ_CODE LIKE '%${keywordValue}%' `;
        }
        if (keywordType == "mart_seq") {
          whereStr += ` AND MB.M_HQ_CODE LIKE '%${keywordValue}%' `;
        }
      }
      if (status) {
        whereStr += ` AND MB.M_STATUS = '${status}' `;
      } else {
        whereStr += " AND MB.M_STATUS = 'A' ";
      }
      if (isSyncOrder === true || isSyncOrder === 1) {
        whereStr += ` AND MC.USE_TDC_ORDER = 'Y' `;
      }
      if (useStock === true || useStock === 1) {
        whereStr += ` AND MC.IS_STOCK = 'Y' AND MC.IS_STOP_STOCK = 'N' `;
      }

      sql += whereStr + " ORDER BY MB.SEQ DESC ";
      sqlCount += whereStr + " ORDER BY MB.SEQ DESC ";
      if (offset && limit) {
        sql += " LIMIT " + offset + "," + limit;
      }
      console.log(sql);

      const [list] = await pool.mysqlPool.query(sql);
      const [total] = await pool.mysqlPool.query(sqlCount);

      return {list: list, total: total[0].CNT};
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
  static async selectDetailMart(seq) {
    let logBase = `models/martModel.selectDetailMart: `;

    const sql = ` SELECT
            MB.SEQ, MB.SP_CODE, SP.SP_NAME, MB.SPT_CODE, ST.SPT_NAME, MB.M_HQ_CODE, MB.M_TYPE, MB.M_MOA_CODE, MB.M_LOGO, MB.M_LOGO_PUSH, MB.M_NAME, MB.M_LICENSE, MB.M_PHONE, MB.CT_CODE, MB.DT_CODE, MB.M_ADDRESS,
            CA.CT_NAME_KR, CA1.DT_NAME_KR,
            MC.M_POS_CODE, MC.M_POS_REGCODE, MC.M_GROUP_NO, MC.T_POS_CODE, MC.M_POS_CONNECT, MC.M_RECEIPT, MC.M_LOCAL_PARTNER, MC.M_POP,
            MC.M_POP, MC.M_MMS, MC.M_MMS_DEPOSIT, MC.PG_CODE, MC.TERM_ID, MC.MPASS, MC.IS_YMART, MC.IS_CUSTOM_APP,
			      MC.M_APP_TYPE, MC.HIDE_SHUKET, MC.USE_EXTEND_BRGN,
            MB.M_BIZHOUR, MB.M_CONTACT_NAME, MB.M_CONTACT_PHONE, MB.M_CONTACT_EMAIL, MB.M_STATUS,
            MS.M_S_TYPE, MS.M_S_PAYMENT, MS.M_S_DATE_SERVICE, MS.M_S_DATE_BILLING, MS.M_S_DISCOUNT, MS.M_S_DISCOUNT_PERIOD,
			      CP.POS_NAME,
			      MC.IS_STOCK, MC.INTEGRATED_MSG,
            MC.INITIAL_STOCK_DATE, MC.M_DB_CONNECT, IFNULL(MC.AN_CM_KEY,'FCM0000001') AS AN_CM_KEY, IFNULL(MC.IOS_CM_KEY,'FCM0000001') AS IOS_CM_KEY,
            MC.USE_TDC_ORDER,MC.USE_PICKUP, MC.M_PICKUP_START, MC.M_PICKUP_END,MC.USE_DELIVERY,MC.USE_PICKUP_COD,MC.PICKUP_INTERVAL_TIME
            FROM
            TBL_MOA_MART_BASIC AS MB
            LEFT JOIN TBL_MOA_MART_CONFIG AS MC ON MB.M_MOA_CODE = MC.M_MOA_CODE
            LEFT JOIN TBL_MOA_MART_SUBSCRIPTION AS MS ON MB.M_MOA_CODE = MS.M_MOA_CODE
            LEFT JOIN TBL_MOA_CODE_POS AS CP ON CP.POS_CODE = MC.M_POS_CODE
            LEFT JOIN TBL_MOA_CODE_AREA AS CA ON MB.CT_CODE = CA.CT_CODE
            LEFT JOIN TBL_MOA_CODE_AREA AS CA1 ON MB.DT_CODE = CA1.DT_CODE
            LEFT JOIN TBL_SP_BASIC AS SP ON SP.SP_CODE = MB.SP_CODE
            LEFT JOIN TBL_SP_SALES_TEAM AS ST ON ST.SPT_CODE = MB.SPT_CODE
            WHERE MB.SEQ =  ${seq}`;
    // console.log(sql);

    const [rows] = await pool.mysqlPool.query(sql);
    return rows[0];
  }
  //HQ LIST BY MART FOR EDIT
  static async getlistHQgroup(mMoaCode) {
    let logBase = `models/martModel.getlistHQgroup: `;

    const sql = `SELECT
    MB.M_HQ_CODE, MB.M_MOA_CODE, MB.M_NAME, MC.M_APP_TYPE
    FROM
        TBL_MOA_MART_BASIC AS MB
    JOIN TBL_MOA_MART_CONFIG AS MC ON MB.M_MOA_CODE = MC.M_MOA_CODE
    WHERE (MB.M_TYPE = 'F' OR MB.M_TYPE = 'FA' OR MB.M_TYPE = 'FW' OR MB.M_TYPE = 'FB')
    AND MB.M_STATUS = 'A'
    AND MB.M_HQ_CODE = MB.M_MOA_CODE`;
    const [rows] = await pool.mysqlPool.query(sql);
    return rows;
  }
   //HQ LIST FOR ADD 
   static async getListGroupMart() {
    let logBase = `models/martModel.getListGroupMart: `;

    const sql = ` SELECT MB.M_HQ_CODE AS hq_code ,MB.M_MOA_CODE AS mart_code ,MB.M_NAME AS mart_name, MC.M_APP_TYPE as m_app_type
    FROM TBL_MOA_MART_BASIC AS MB
    JOIN TBL_MOA_MART_CONFIG AS MC ON MB.M_MOA_CODE = MC.M_MOA_CODE
    where (MB.M_TYPE =  'F' OR MB.M_TYPE =  'FA' OR MB.M_TYPE =  'FW' OR MB.M_TYPE =  'FB') and MB.M_STATUS='A' AND MB.M_HQ_CODE = MB.M_MOA_CODE Group by MB.M_HQ_CODE`;
    const [rows] = await pool.mysqlPool.query(sql);
    return rows;
  }
  //SKP BANK CARD KKP NP CCOD COD VBANK
  static async getListPaymentOfMart(moaCode) {
    let logBase = `models/martModel.getListPaymentOfMart: `;

    const sql = `SELECT C_CODE, C_KO, C_ENG , ifnull(MMP.IS_USE,'N') AS IS_USE
    FROM TBL_MOA_CODE_COMMON AS CCMON
    LEFT JOIN TBL_MOA_MART_PAYMETHOD AS MMP on MMP.M_PM_CODE = CCMON.C_CODE AND MMP.M_MOA_CODE='${moaCode}'
    WHERE CCMON.C_GRP = 'OP' AND CCMON.C_USE = 'Y'
    GROUP BY CCMON.C_CODE
    ORDER BY CCMON.C_ORDER ASC`;
    const [rows] = await pool.mysqlPool.query(sql);
    return rows;
  }

  static async getDataConfigCustomMart(mMoaCode) {
    let logBase = `models/martModel.getDataConfigCustomMart: mMoaCode:${mMoaCode} `;

    const sql = `SELECT M_MOA_CODE, DATA_CONFIG FROM TBL_MOA_MART_CONFIG_CUSTOM WHERE TYPE = 'RCT' AND STATUS = 'A' AND M_MOA_CODE = '${mMoaCode}'`;
    const [rows] = await pool.mysqlPool.query(sql);
    return rows[0];
  }

  //getMartOptions for search select
  static async getMartOptions(moaCode) {
    let logBase = `models/martModel.getMartOptions: `;

    let sql = ` SELECT
      MMB.SEQ AS SEQ, MMB.M_MOA_CODE AS CODE, MMB.M_NAME AS NAME
  FROM
      TBL_MOA_MART_BASIC AS MMB
  WHERE
      MMB.M_STATUS = 'A'`;
    if (moaCode !== "") {
      sql += ` AND MMB.M_MOA_CODE = '${moaCode}' `;
    }
    const [rows] = await pool.mysqlPool.query(sql);
    return rows;
  }
 
  //insert mart basic info
  static async insertMartBasicInfo({hq_code, mart_business_type, partner, sale_team, mart_name, logo_name, logo_push_name, 
    license, city, district, address, phone, contact_name, contact_phone, contact_email, bizhour_open, bizhour_close }, userId, mart_code){
        let logBase = `models/martModel.insertMartBasicInfo: `;
        try {

        let  sql = ` INSERT INTO TBL_MOA_MART_BASIC  
        (SP_CODE, SPT_CODE, M_HQ_CODE, M_MOA_CODE, M_TYPE, M_NAME, M_LOGO, M_LOGO_PUSH, M_LICENSE, CT_CODE, DT_CODE, M_ADDRESS, M_PHONE,
        M_CONTACT_NAME, M_CONTACT_PHONE, M_CONTACT_EMAIL, M_BIZHOUR, M_STATUS, C_TIME, C_ID) VALUES 
        ('${partner}', '${sale_team}', '${hq_code}', '${mart_code}','${mart_business_type}', '${mart_name}', '${logo_name}',
        '${logo_push_name}','${license}', '${city}', '${district}', '${address}', '${phone}', '${contact_name}', '${contact_phone}',
        '${contact_email}', '${bizhour_open}:${bizhour_close}',  'A', '${moment().format('YYYY-MM-DD HH:mm:ss')}', '${userId}')`;
    
        logger.writeLog("info", `${logBase} : ${sql}`);
        const [rows] = await pool.mysqlPool.query(sql);
        return rows.affectedRows
      } catch (error) {
        logger.writeLog("error", `${logBase} : ${error.stack}`);
        return 0
      }
   }
  //update mart basic info
static async updateMartBasicInfo({group_mart_code, mart_business_type, partner, sale_team, mart_name, logo_name, logo_push_name, 
license, city, district, address, phone, contact_name, contact_phone, contact_email, bizhour_open, bizhour_close, 
account_status, mart_code }, userId){
    let logBase = `models/martModel.updateMartBasicInfo: `;
    try {
    let  sql = ` UPDATE TBL_MOA_MART_BASIC  
    SET  M_HQ_CODE = '${group_mart_code}',
    M_TYPE = '${mart_business_type}',
    SP_CODE = '${partner}',
    SPT_CODE = '${sale_team}',
    M_NAME = '${mart_name}',
    M_LOGO = '${logo_name}',
    M_LOGO_PUSH = '${logo_push_name}',
    M_LICENSE = '${license}',
    CT_CODE = '${city}',
    DT_CODE = '${district}',
    M_ADDRESS = '${address}',
    M_PHONE = '${phone}',
    M_CONTACT_NAME = '${contact_name}',
    M_CONTACT_PHONE = '${contact_phone}',
    M_CONTACT_EMAIL = '${contact_email}',
    M_BIZHOUR = '${bizhour_open}:${bizhour_close}',
    M_STATUS = '${account_status}',
    M_TIME = '${moment().format('YYYY-MM-DD HH:mm:ss')}',
    M_ID = '${userId}'
    WHERE M_MOA_CODE = '${mart_code}' `;

    logger.writeLog("info", `${logBase} : ${sql}`);
    const [rows] = await pool.mysqlPool.query(sql);
    return rows.affectedRows
  } catch (error) {
    logger.writeLog("error", `${logBase} : ${error.stack}`);
    return 0
  }
  }
    //insert mart subcription
    static async insertMartSubcription(s_type, s_date_service, s_date_billing, s_discount, s_discount_period, s_payment, time, userId, mart_code){
          let logBase = `models/martModel.insertMartSubcription: `;
          try {
          let  sql = ` INSERT INTO TBL_MOA_MART_SUBSCRIPTION  
          (M_MOA_CODE, M_S_TYPE, M_S_DATE_SERVICE, M_S_DATE_BILLING, M_S_DISCOUNT, M_S_DISCOUNT_PERIOD, M_S_PAYMENT, C_TIME, C_ID) VALUES 
          ('${mart_code}','${s_type}', '${s_date_billing}', '${s_date_billing}','${s_discount}', '${s_discount_period}', '${s_payment}','${time}', '${userId}')`;
      
          logger.writeLog("info", `${logBase} : ${sql}`);
          const [rows] = await pool.mysqlPool.query(sql);
          return rows.affectedRows
        } catch (error) {
          logger.writeLog("error", `${logBase} : ${error.stack}`);
          return 0
        }
     }
   //update mart subcription
   static async updateMartSubcription(s_type, s_date_service, s_date_billing, s_discount, s_discount_period, s_payment, time, userId, mart_code){
    let logBase = `models/martModel.updateMartSubcription: `;
    try {
    let  sql = ` UPDATE TBL_MOA_MART_SUBSCRIPTION  
    SET  M_S_TYPE = '${s_type}',
    M_S_DATE_SERVICE = '${s_date_service}',
    M_S_DATE_BILLING = '${s_date_billing}',
    M_S_DISCOUNT = '${s_discount}',
    M_S_DISCOUNT_PERIOD = '${s_discount_period}',
    M_S_PAYMENT = '${s_payment}',
    M_TIME = '${time}',
    M_ID = '${userId}'
    WHERE M_MOA_CODE = '${mart_code}' `;

    logger.writeLog("info", `${logBase} : ${sql}`);
    const [rows] = await pool.mysqlPool.query(sql);
    return rows.affectedRows
  } catch (error) {
    logger.writeLog("error", `${logBase} : ${error.stack}`);
    return 0
  }
  }
    //insert mart config
    static async insertMartConfig({pos, pos_regcode, group_no, pos_code, mart_type, pg_code, term_id, mpass,
      pos_connect, mart_display_status, is_use_ymart, receipt, mart_db, local_partner, pop, store_set_hour, 
      set_delivery, store_pickup_cod, store_set_hour_start, store_set_hour_end, store_pick_time_interval,
      order_sync, push_key_android, push_key_ios},time, userId, mart_code){
      let logBase = `models/martModel.insertMartConfig: `;
      try {
      let  sql = ` INSERT INTO TBL_MOA_MART_CONFIG  
      (M_MOA_CODE, M_POS_CODE, M_POS_REGCODE, M_GROUP_NO, PG_CODE, TERM_ID, MPASS, T_POS_CODE, M_POS_CONNECT, IS_YMART,
        M_RECEIPT, M_LOCAL_PARTNER, M_POP, M_APP_TYPE, M_DB_CONNECT, HIDE_SHUKET, IOS_CM_KEY, AN_CM_KEY, USE_PICKUP, M_PICKUP_START, M_PICKUP_END,
        USE_DELIVERY, USE_PICKUP_COD, PICKUP_INTERVAL_TIME ,USE_TDC_ORDER , C_TIME, C_ID ) VALUES 
      ('${mart_code}', '${pos}', '${pos_regcode}','${group_no}', '${pg_code}', '${term_id}','${mpass}', '${pos_code}',
      '${pos_connect}', '${is_use_ymart}', '${receipt}','${local_partner}', '${pop}', '${mart_type}','${mart_db}', '${mart_display_status}',
      '${push_key_ios}', '${push_key_android}', '${store_set_hour}','${store_set_hour_start}', '${store_set_hour_end}', '${set_delivery}',
     '${store_pickup_cod}','${store_pick_time_interval}', '${order_sync}','${time}', '${userId}')`;
  
      logger.writeLog("info", `${logBase} : ${sql}`);
      const [rows] = await pool.mysqlPool.query(sql);
      return rows.affectedRows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return 0
    }
 } 
 //update mart config
  static async updateMartConfig({pos, pos_regcode, group_no, pos_code, mart_type, pg_code, term_id, mpass,
      pos_connect, mart_display_status, is_use_ymart, receipt, mart_db, local_partner, pop, store_set_hour, 
      set_delivery, store_pickup_cod, store_set_hour_start, store_set_hour_end, store_pick_time_interval,
      order_sync, push_key_android, push_key_ios, integrated_messging, is_sync_image_by_group,
      value_sync_image_by_group, is_extend_brgn, mart_code},time, userId){
      let logBase = `models/martModel.updateMartConfig: `;
      try {
      let  sql = ` UPDATE TBL_MOA_MART_CONFIG  
      SET  M_POS_CODE = '${pos}',
      M_POS_REGCODE = '${pos_regcode}',
      M_GROUP_NO = '${group_no}',
      T_POS_CODE = '${pos_code}',
      M_APP_TYPE = '${mart_type}',
      PG_CODE = '${pg_code}',
      TERM_ID = '${term_id}',
      MPASS = '${mpass}',
      M_POS_CONNECT = '${pos_connect}',
      HIDE_SHUKET = '${mart_display_status}',
      IS_YMART = '${is_use_ymart}',
      M_RECEIPT = '${receipt}',
      M_DB_CONNECT = '${mart_db}',
      M_LOCAL_PARTNER = '${local_partner}',
      M_POP = '${pop}',
      M_TIME = '${time}',
      M_ID = '${userId}',
      USE_PICKUP = '${store_set_hour}',
      USE_DELIVERY = '${set_delivery}',
      USE_PICKUP_COD = '${store_pickup_cod}',
      M_PICKUP_START = '${store_set_hour_start}',
      M_PICKUP_END = '${store_set_hour_end}',
      PICKUP_INTERVAL_TIME = '${store_pick_time_interval}',
      USE_TDC_ORDER = '${order_sync}',
      AN_CM_KEY = '${push_key_android}',
      IOS_CM_KEY = '${push_key_ios}',
      INTEGRATED_MSG = '${integrated_messging}',
      -- IS_GROUP_SYNC_IMAGES = '${is_sync_image_by_group}',
      -- GROUP_SYNC_IMAGES_CODE = '${value_sync_image_by_group}',
      USE_EXTEND_BRGN = '${is_extend_brgn}'
      WHERE M_MOA_CODE = '${mart_code}' `;
  
      logger.writeLog("info", `${logBase} : ${sql}`);
      const [rows] = await pool.mysqlPool.query(sql);
      return rows.affectedRows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return 0
    }
    }
}
