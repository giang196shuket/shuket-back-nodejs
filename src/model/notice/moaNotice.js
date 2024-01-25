const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");

module.exports = class moaNotice {
  static async getNoticeList(limitQuery) {
    let logBase = `models/moaNotice.getNoticeList`;

    try {
      let sql = ` SELECT
      SEQ, NOTI_TITLE as title, NOTI_CONTENT as content, NOTI_STIME as startTime, NOTI_ETIME as endTime, NOTI_STATUS as status
      , NOTI_CODE as code, NOTI_IMAGE as image
  FROM TBL_MOA_POPUP_NOTI_MAIN WHERE NOTI_STATUS != 'D' ORDER BY SEQ DESC ${limitQuery}`;

      logger.writeLog("info", `${logBase} : ${sql}`);
      const [rows] = await pool.mysqlPool.query(sql);
      return rows;
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
};
