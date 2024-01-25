const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");
const { password_verify } = require("../../service/auth");

module.exports = class martModel {
  static async moaSelectMarts(
    limit,
    page,
    appType,
    keywordType,
    keywordValue,
    martUseSyncOrder,
    martWithStock,
    status,
    offset
  ) {
    let logBase = `models/martModel.moaSelectMarts: `;

    try {
      let sql = ` SELECT
        MB.SEQ AS MART_SEQ, MB.SP_CODE, MB.SPT_CODE, MB.M_MOA_CODE, MC.M_POS_REGCODE, MB.M_NAME AS MART_NAME, MB.M_DISTRICT AS DISTRICT_NAME, MB.C_TIME,
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
      if (martUseSyncOrder === true || martUseSyncOrder === 1) {
        whereStr += ` AND MC.USE_TDC_ORDER = 'Y' `;
      }
      if (martWithStock === true || martWithStock === 1) {
        whereStr += ` AND MC.IS_STOCK = 'Y' AND MC.IS_STOP_STOCK = 'N' `;
      }

      sql += whereStr + " ORDER BY MB.SEQ DESC ";
      if (offset && limit) {
        sql += " LIMIT " + offset + "," + limit;
      }
      console.log(sql);

      const [rows] = await pool.mysqlPool.query(sql);
      return rows;
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
			      MC.IS_STOCK,
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
    console.log(sql);

    const [rows] = await pool.mysqlPool.query(sql);
    return rows[0];
  }
  //SK, SG, YSK, GSK
  static async getTypeWhere(mMoaCode) {
    let logBase = `models/martModel.getTypeWhere: `;

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
  //SKP BANK CARD KKP NP CCOD COD VBANK
  static async getListPaymentOfMart(moaCode) {
    let logBase = `models/martModel.getListPaymentOfMart: `;

    const sql = `SELECT C_CODE, C_KO, C_ENG , ifnull(MMP.IS_USE,'N') AS IS_USE, ifnull(MMP.IS_USE,'yes') AS IS_INSERT
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
};
