const pool = require("../../config/database");
const logger = require("../../config/logger");
const moment = require("moment");

module.exports = class partnerModel {

  static async getPartnerOptions() {
    let logBase = `models/partnerModel.getPartnerOptions:`;
      try {
        const  sql = ` SELECT
        SB.SEQ, SB.SP_CODE, SB.SP_NAME, SB.SP_LICENSE, SB.SP_LEVEL, SB.SP_STATUS
    FROM
        TBL_SP_BASIC SB `;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }

  static async getPartnerSalesTeamOptions(spCode) {
    let logBase = `models/partnerModel.getPartnerSalesTeamOptions:`;
      try {
        const  sql = ` SELECT
        SST.SEQ, SST.SP_CODE, SST.SPT_CODE, SST.SPT_NAME
    FROM
        TBL_SP_SALES_TEAM AS SST
    WHERE
        SST.SPT_STATUS = 'A' AND SST.SP_CODE = '${spCode}'`;
      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  
};
