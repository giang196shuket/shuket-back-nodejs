const pool = require("../../config/database");
const logger = require("../../config/logger");
const moment = require("moment");
const { password_verify } = require("../service/auth");

module.exports = class appBuilderModel {
  static async getScreenBuilder(martId) {
    let logBase = `models/appBuilderModel.getScreenBuilder:`;
    try {
      const sql = ` SELECT
        AP.SEQ,AP.T_SC_CODE, AP.T_SC_TYPE, AP.T_SC_LABEL, (SELECT COUNT(T_SC_DT_TMPL_CODE) FROM moa_platform.TBL_MOA_APP_SCREENS_DETAIL 
        WHERE T_SC_CODE=AP.T_SC_CODE AND T_SC_DT_TMPL_CODE NOT IN (SELECT T_TMPL_CODE FROM TBL_MOA_APP_CODE_TEMPLATE WHERE T_TMPL_SOURCE ='A')) AS T_SC_TMPL_CNT, AP.T_SC_STATUS, C_TIME, M_TIME,
        IF(AP.C_ID != 'SYSTEM', (SELECT U_NAME FROM TBL_MOA_USERS_ADMIN WHERE U_ID = AP.C_ID), AP.C_ID) AS C_ADMIN,
        IF(AP.M_ID != 'SYSTEM', (SELECT U_NAME FROM TBL_MOA_USERS_ADMIN WHERE U_ID = AP.M_ID), AP.M_ID) AS M_ADMIN,
        AP.T_SC_POSITION
    FROM TBL_MOA_APP_SCREENS AS AP
    WHERE AP.T_SC_STATUS != 'D'
    AND AP.M_MOA_CODE = '${martId}'
    AND AP.T_SC_CODE NOT LIKE '%WS%'
    ORDER BY AP.T_SC_CODE,AP.T_SC_STATUS,IFNULL(AP.T_SC_POSITION, 9999) DESC `;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows;
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
  static async getAllTemplateAlreadySet(martId, sreenCode) {
    let logBase = `models/appBuilderModel.getAllTemplateAlreadySet:`;
    try {
      const sql = ` SELECT
        AP.M_MOA_CODE, AP.T_SC_CODE, AP.T_SC_LABEL, AD.T_SC_DT_TMPL_CODE, AD.T_SC_DT_TMPL_ORDER,
        AE.T_TMPL_LABEL, AE.T_TMPL_TYPE, AD.T_SC_DT_TMPL_DATA, AD.T_SC_DT_USER_TYPE
    FROM TBL_MOA_APP_SCREENS AS AP
        JOIN TBL_MOA_APP_SCREENS_DETAIL AS AD ON AP.T_SC_CODE = AD.T_SC_CODE
        JOIN TBL_MOA_APP_CODE_TEMPLATE AS AE ON AD.T_SC_DT_TMPL_CODE = AE.T_TMPL_CODE
    WHERE AP.M_MOA_CODE = '${martId}'
    AND AP.T_SC_CODE = '${sreenCode}'
    AND AP.T_SC_STATUS = 'A'
    AND AE.T_TMPL_STATUS = 'A'
    AND AP.T_SC_CODE NOT LIKE '%WS%'
    AND (AE.T_TMPL_SOURCE IS NULL OR AE.T_TMPL_SOURCE !='A') ORDER BY AD.T_SC_DT_TMPL_ORDER ASC`;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows;
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
  static async getAppScreenInfo(sreenCode, martId) {
    let logBase = `models/appBuilderModel.getAppScreenInfo:`;
    try {
      const sql = ` SELECT
      AP.M_MOA_CODE, AP.T_SC_TYPE, AP.T_SC_CODE, AP.T_SC_LABEL, AP.T_SC_TMPL_CNT, AP.T_SC_STATUS, AP.C_TIME, AP.M_TIME,
      IF(AP.C_ID != 'SYSTEM', (SELECT U_NAME FROM TBL_MOA_USERS_ADMIN WHERE U_ID = AP.C_ID), AP.C_ID) AS C_ADMIN,
      IF(AP.M_ID != 'SYSTEM', (SELECT U_NAME FROM TBL_MOA_USERS_ADMIN WHERE U_ID = AP.M_ID), AP.M_ID) AS M_ADMIN
  FROM TBL_MOA_APP_SCREENS AS AP
  WHERE AP.T_SC_CODE = '${sreenCode}'
  AND AP.T_SC_STATUS != 'D'
  AND AP.M_MOA_CODE = '${martId}'`;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows[0];
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
  static async getAppScreenDetailList(sreenCode, martId, haveCondition) {
    let logBase = `models/appBuilderModel.getAppScreenDetailList:`;
    try {
      let where = `AND (AE.T_TMPL_SOURCE IS NULL OR AE.T_TMPL_SOURCE !='A')`
      if(haveCondition == 1){
        where = " "
      }
      const sql = `SELECT
      AD.SEQ,AD.T_SC_CODE, AD.T_SC_DT_TMPL_CODE, AD.T_SC_DT_TMPL_DATA, AD.T_SC_DT_TMPL_ORDER, AD.T_SC_DT_USER_TYPE, AE.T_TMPL_LABEL, AE.T_TMPL_TYPE, AE.T_TMPL_IMG, AD.IS_YN
  FROM TBL_MOA_APP_SCREENS AS AP
      JOIN TBL_MOA_APP_SCREENS_DETAIL AS AD ON AP.T_SC_CODE = AD.T_SC_CODE
      LEFT JOIN TBL_MOA_APP_CODE_TEMPLATE AS AE ON AD.T_SC_DT_TMPL_CODE = AE.T_TMPL_CODE AND AE.T_TMPL_STATUS = 'A'
  WHERE AD.T_SC_CODE = '${sreenCode}'
  AND AP.M_MOA_CODE = '${martId}'  ${where}
  ORDER BY AD.T_SC_DT_TMPL_ORDER ASC `;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows;
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
};
