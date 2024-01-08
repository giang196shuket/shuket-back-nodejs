const pool = require("../../config/database");
const logger = require("../../config/logger");
const moment = require("moment");
const { password_verify } = require("../service/auth");

module.exports = class fcmModel {

  static async getFcmOptions() {
    let logBase = `models/fcmModel.getFcmOptions:`;
      try {
        const  sql = `SELECT FCM_CODE,FCM_NAME FROM moa_platform.TBL_MOA_FCM_DATA `;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  
};
