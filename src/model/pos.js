const pool = require("../../config/database");
const logger = require("../../config/logger");
const moment = require("moment");
const { password_verify } = require("../service/auth");

module.exports = class posModel {

  static async getPosOptions() {
    let logBase = `models/posModel.getPosOptions:`;
      try {
        const  sql = ` SELECT
        CP.SEQ, CP.POS_CODE, CP.POS_NAME, CP.POS_STATUS
      FROM
        TBL_MOA_CODE_POS CP `;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  
};
