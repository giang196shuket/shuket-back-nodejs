const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");
const queriesHelper = require("../../helper/queries");

module.exports = class catalogModel {
 
  static async getList(limitQuery) {
    let logBase = `models/catalogModel.getList`;
    
    try {
      

      let sql = ` SELECT
      MIC.SEQ,
      MIC.CATALOG_NAME as name,
      MIC.CATALOG_THUMBNAIL_URI as image,
      MIC.CATALOG_TAGS as tags,
      MIC.CATALOG_STATUS as status,
      MIC.C_TIME,
      MIC.M_TIME,
      IF(MIC.C_ID != 'SYSTEM', (SELECT U_NAME FROM TBL_MOA_USERS_ADMIN WHERE U_ID = MIC.C_ID), 'SYSTEM') AS C_ID,
      IF(MIC.M_ID != 'SYSTEM', (SELECT U_NAME FROM TBL_MOA_USERS_ADMIN WHERE U_ID = MIC.M_ID), 'SYSTEM') AS M_ID
    FROM
      moa_platform.TBL_MOA_CATALOG_MAIN MIC
    WHERE MIC.SEQ > 0 ORDER BY MIC.SEQ DESC  ${limitQuery}`


  logger.writeLog("info", `${logBase} : ${sql}`);
  const count  = await queriesHelper.getDataCountWhere('TBL_MOA_CATALOG_MAIN','SEQ > 0')

      const [rows] = await pool.mysqlPool.query(sql);

      return {list: rows, total: count }
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
};
