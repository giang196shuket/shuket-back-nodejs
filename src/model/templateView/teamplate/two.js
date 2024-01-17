const logger = require("../../../../config/logger");
const pool = require("../../../../config/database");

module.exports = class templateViewTwoModel {
    static async getBlogDetailData(blogCode, martId) {
        let logBase = `models/templateViewTwoModel.getBlogDetailData:`;
        try {
          const sql = ` SELECT
          BG.B_CODE, BG.B_TITLE, BG.B_CONT, BG.B_STATUS, BG.C_TIME, BG.B_IMG_CV, BG.C_ID,
          IF(BG.C_ID != 'SYSTEM', (SELECT U_NAME FROM TBL_MOA_USERS_ADMIN WHERE U_ID = BG.C_ID), BG.C_ID) AS C_ADMIN,
          IF(BG.M_ID != 'SYSTEM', (SELECT U_NAME FROM TBL_MOA_USERS_ADMIN WHERE U_ID = BG.M_ID), BG.M_ID) AS M_ADMIN
      FROM TBL_MOA_BLOG_MAIN AS BG
      WHERE BG.B_STATUS = 'A'
      AND BG.B_CODE = '${blogCode}'
      AND BG.M_MOA_CODE = '${martId}'`;
    
          const [rows] = await pool.mysqlPool.query(sql);
          return rows[0];
        } catch (error) {
          logger.writeLog("error", `${logBase} : ${error.stack}`);
          return null;
        }
      }
      static async getEventDetailData(eventCode, martId) {
        let logBase = `models/templateViewTwoModel.getEventDetailData:`;
        try {
          const sql = ` SELECT
          ET.E_CODE, ET.E_TITLE, ET.E_DESC, ET.E_CATEGORY, ET.E_STATUS,
          ET.E_SDATE, ET.E_EDATE, ET.E_IMG_CV, ET.E_IMG_DT, ET.C_ID
      FROM TBL_MOA_EVT_MAIN AS ET
      WHERE ET.E_STATUS='A'
      AND ET.E_CODE = '${eventCode}'
      AND ET.M_MOA_CODE = '${martId}'`;
    
          const [rows] = await pool.mysqlPool.query(sql);
          return rows[0];
        } catch (error) {
          logger.writeLog("error", `${logBase} : ${error.stack}`);
          return null;
        }
      }
}