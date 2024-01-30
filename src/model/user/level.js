const pool = require("../../../config/database");
const logger = require("../../../config/logger");
module.exports = class levelModel{
    static async getLevelSearchList() {
        let logBase = `models/userModel.getLevelOptions:`;
          try {
            const  sql = ` SELECT
            UL.SEQ, UL.U_LEVEL_CODE AS CODE, UL.U_LEVEL_TITLE AS NAME, U_LEVEL_TYPE AS TYPE, UL.U_LEVEL_STATUS AS STATUS
        FROM
            TBL_MOA_USERS_LEVEL UL WHERE UL.U_LEVEL_STATUS = 'A' `;
    
          const [rows] = await pool.mysqlPool.query(sql);
          return rows
        } catch (error) {
          logger.writeLog("error", `${logBase} : ${error.stack}`);
          return null
        }
      }
}