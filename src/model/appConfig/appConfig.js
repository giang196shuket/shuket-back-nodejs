const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");
const queriesHelper = require("../../helper/queries");

module.exports = class appConfigModel {
  static async getAppVersionList(limitQuery, searchMethod) {
    let logBase = `models/appConfigModel.getAppVersionList`;

    try {
      let where = ""
      if(searchMethod === 'RA'){
        where += ' ORDER BY A.SEQ ASC '
      }else if(searchMethod === 'RD'){
        where += ' ORDER BY A.SEQ DESC '
      }
      let sql = ` SELECT
      A.M_MOA_CODE, A.M_NAME,
      C.AV_APP_VER AS VERSION_AOS, C.AV_OS_TYPE AS AOS_TYPE, C.AV_CHK_TYPE AS AOS_CHK , C.AV_STORE_URL AS AOS_STORE,
      D.AV_APP_VER AS VERSION_IOS, D.AV_OS_TYPE AS IOS_TYPE, D.AV_CHK_TYPE AS IOS_CHK , D.AV_STORE_URL AS IOS_STORE
   FROM TBL_MOA_MART_BASIC AS A
   JOIN TBL_MOA_MART_CONFIG AS B ON A.M_MOA_CODE=B.M_MOA_CODE
   LEFT JOIN TBL_MOA_APP_VER_MAIN AS C ON A.M_MOA_CODE=C.M_MOA_CODE AND C.AV_OS_TYPE = 'AN'
   LEFT JOIN TBL_MOA_APP_VER_MAIN AS D ON A.M_MOA_CODE=C.M_MOA_CODE AND D.AV_OS_TYPE = 'IO'
   WHERE A.M_STATUS != 'D' ${where} ${limitQuery}`;

      logger.writeLog("info", `${logBase} : ${sql}`);
      const count = await queriesHelper.getDataCountWhere(
        "TBL_MOA_MART_BASIC",
        " M_STATUS != 'D'"
      );

      const [rows] = await pool.mysqlPool.query(sql);

      return { list: rows, total: count };
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
};
