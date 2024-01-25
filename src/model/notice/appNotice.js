const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");

module.exports = class appNotice {
  static async getListNotice(limitQuery, keywordType, keywordValue , status) {
    let logBase = `models/appNotice.getListNotice`;
    try {
      let where = ""
      //keywordType: T => search by title
      if(keywordType === 'T'){
        where += ` AND MMA.NT_MSG_TITLE LIKE '%${keywordValue}%' `
      }
      //keywordType: S =>  search by screen show notice
      if(keywordType === 'T'){
        where += ` AND MMA.NT_SCREEN_TARGET_OPTION = '${keywordType}' 
        AND MMA.NT_SCREEN_TARGET_DATA LIKE '%${keywordValue}%' `
      }
      let sql = `SELECT
      MMA.SEQ, MMA.M_MOA_CODE, MMA.NT_MSG_CODE, MMA.NT_MSG_TITLE, MMA.NT_SCREEN_TARGET_OPTION, MMA.NT_SCREEN_TARGET_DATA, MMA.MART_TYPE,
      MMA.NT_MSG_DETAIL, MMA.NT_MSG_IMAGES, MMA.NT_MSG_SDATE, MMA.NT_MSG_EDATE, MMA.USE_CUSTOM_MART, MMA.SHOWDOWNLOAD_APP, MMA.MART_CUSTOM,
      MMA.NT_MSG_STATUS, MMA.C_TIME, MMA.C_ID, MMA.M_TIME, MMA.M_ID, MMA.APP_IOS, MMA.APP_GOOGLE, MMA.NT_MSG_DISPLAY
  FROM TBL_MOA_MART_NOTI_APP AS MMA
  WHERE MMA.NT_MSG_STATUS = 'A' ${where}  ORDER BY MMA.SEQ DESC ${limitQuery}`;

      logger.writeLog("info", `${logBase} : ${sql}`);
      const [rows] = await pool.mysqlPool.query(sql);
      return rows;
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
};
