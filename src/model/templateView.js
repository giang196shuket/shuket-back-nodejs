const pool = require("../../config/database");
const logger = require("../../config/logger");
const moment = require("moment");

module.exports = class templateViewModel {

  static async getTypeOneData(detailCode, martId) {
    let logBase = `models/templateViewModel.getTypeOneData:`;
      try {
        const  sql = ` SELECT
        T_BNR_CODE, T_BNR_NAME, T_BNR_IMAGE, T_BNR_IMAGE_WD, T_BNR_IMAGE_HT, T_BNR_PLATFM
    FROM TBL_MOA_BNR_MAIN
    WHERE T_BNR_CODE = '${detailCode}'
    AND T_BNR_PLATFM = 'A'
    AND T_BNR_STATUS = 'A'
    AND M_MOA_CODE = '${martId}' `;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows[0]
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  
};
