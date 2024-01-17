const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");
module.exports = class templateViewModel {

  //

 
  static async getAllTemplateAlreadySet(martId, sreenCode) {
    let logBase = `models/templateViewModel.getAllTemplateAlreadySet:`;
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
    ORDER BY AD.T_SC_DT_TMPL_ORDER ASC`;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows;
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
};
