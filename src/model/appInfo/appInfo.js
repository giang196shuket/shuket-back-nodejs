const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");
const queriesHelper = require("../../helper/queries");

module.exports = class appInfoModel {
  static async getMoaMartInfoApp(martCode) {
    let logBase = `models/appInfoModel.getMoaMartInfoApp`;

    try {
    
      let sql = ` SELECT MB.SEQ, MB.M_MOA_CODE, MB.M_LOGO, MB.M_NAME,  MB.M_PHONE, MB.CT_CODE, MB.DT_CODE, MB.M_ADDRESS,
      CA.CT_NAME_KR, CA1.DT_NAME_KR, MB.M_BIZHOUR, MB.M_BANNER_APP, MB.M_LOGO_APP, MB.M_COLOR_APP, MB.M_INTRO_APP, 
      MB.M_NOTICE_APP, MB.M_TIME_SET_SLIDE_APP, MB.M_TIME, MB.C_TIME,
      IF(MB.C_ID != 'SYSTEM', (SELECT U_NAME FROM TBL_MOA_USERS_ADMIN WHERE U_ID = MB.C_ID), MB.C_ID) AS C_NAME,
	  IF(MB.M_ID != 'SYSTEM', (SELECT U_NAME FROM TBL_MOA_USERS_ADMIN WHERE U_ID = MB.M_ID), MB.M_ID) AS M_NAME,
      MC.USE_PICKUP, MC.M_PICKUP_START, MC.M_PICKUP_END,MC.USE_DELIVERY,MC.USE_PICKUP_COD,MC.PICKUP_INTERVAL_TIME,MC.USE_TDC_ORDER,
      MB.USE_INTRO, MC.IS_CUSTOM_APP, MB.M_NAME AS MART_NAME, MB.M_LICENSE AS M_LICENSE, MB.M_CONTACT_NAME AS M_CONTACT_NAME,
      MC.SHOW_MART_INFO_COMPANY,  MC.CS_LINE1, MC.CS_LINE2
  FROM
      TBL_MOA_MART_BASIC AS MB
  LEFT JOIN TBL_MOA_MART_CONFIG AS MC ON MB.M_MOA_CODE = MC.M_MOA_CODE
  LEFT JOIN TBL_MOA_CODE_AREA AS CA ON MB.CT_CODE = CA.CT_CODE
  LEFT JOIN TBL_MOA_CODE_AREA AS CA1 ON MB.DT_CODE = CA1.DT_CODE
  WHERE
      MB.M_MOA_CODE = '${martCode}'
      GROUP BY MB.M_MOA_CODE`;

      logger.writeLog("info", `${logBase} : ${sql}`);

      const [rows] = await pool.mysqlPool.query(sql);

      return rows[0]
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
  static async getScreenDefaultByMart(martCode) {
    let logBase = `models/appInfoModel.getMoaMartInfoApp`;

    try {
    
      let sql = ` SELECT
      AP.M_MOA_CODE, AP.T_SC_CODE, AP.T_SC_LABEL
  FROM TBL_MOA_APP_SCREENS AS AP
      JOIN TBL_MOA_APP_TM_TREE AS AR ON AP.M_MOA_CODE = AR.M_MOA_CODE AND AP.T_SC_CODE = AR.T_SC_CODE
  WHERE AP.M_MOA_CODE = '${martCode}'
  AND AP.T_SC_STATUS = 'A'
  AND AP.T_SC_TYPE = 'M'  AND (select count(T_SC_CODE) from TBL_MOA_APP_SCREENS_DETAIL where AP.T_SC_CODE=T_SC_CODE AND T_SC_DT_USER_TYPE='A') > 0
  ORDER BY IFNULL(AP.T_SC_POSITION, 9999),AR.T_APP_TM_ORDER ASC
  LIMIT 1
  `;

      logger.writeLog("info", `${logBase} : ${sql}`);

      const [rows] = await pool.mysqlPool.query(sql);

      return rows[0].T_SC_CODE
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
};
