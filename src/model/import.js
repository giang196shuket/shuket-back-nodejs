const pool = require("../../config/database");
const logger = require("../../config/logger");
const moment = require("moment");
const { password_verify } = require("../service/auth");

module.exports = class importModel {

  static async getListMartImport() {
    let logBase = `models/posModel.getListMartImport:`;
      try {
        const  sql = ` SELECT MB.M_MOA_CODE as mart_code, MB.M_NAME as mart_name, MBC.M_DB_CONNECT as mart_db
        FROM TBL_MOA_MART_BASIC AS MB
        LEFT JOIN TBL_MOA_MART_CONFIG AS MBC ON MBC.M_MOA_CODE = MB.M_MOA_CODE
        WHERE MB.M_STATUS = 'A' `;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async getAccountImport(userId){
    let logBase = `models/posModel.getAccountImport:`;
      try {
        const  sql = ` SELECT
        MUA.SEQ AS U_SEQ, MUA.U_ID, MUA.U_ACC, MUA.U_GROUP, MUA.U_LEVEL, MUA.U_NAME
    FROM
        TBL_MOA_USERS_ADMIN AS MUA
    WHERE
        MUA.U_ID = '${userId}'`;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows[0]
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  
};
