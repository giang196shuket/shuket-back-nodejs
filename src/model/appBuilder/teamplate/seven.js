const pool = require("../../../../config/database");
const logger = require("../../../../config/logger");
const moment = require("moment");

module.exports = class templateViewSeventModel {
  //banner 01
  static async getTypeSevenData(detailCode, categoryType,  martId, dbConnect) {
    let logBase = `models/templateViewSeventModel.getTypeSevenData:`;
    try {
      //basic cate: L > M > S
      let sql = ""
      if(categoryType === 'L'){
        sql =   `SELECT
        ACM.M_MOA_CODE, ACM.T_CATE_CODE, ACM.P_CAT_CODE, ACM.T_CATE_IMG_USE, ACM.T_CATE_IMG_CV, ACM.T_CATE_IMG_WD, ACM.T_CATE_IMG_HT,
        ACM.T_CATE_STATUS, MC.M_POS_REGCODE, ACM.C_TIME, ACM.M_TIME, ACM.T_CATE_TYPE,
        (
            SELECT
                CTGRY_NAME
            FROM ${dbConnect}.MART_CTGRY
            WHERE MART_SEQNO = MC.M_POS_REGCODE
            AND CTGRY_LARGE_NO = ACM.P_CAT_CODE
            AND CTGRY_MEDIUM_NO = 0
            AND CTGRY_SMALL_NO = 0
            AND CTGRY_STATE = 1
            LIMIT 1
        ) AS P_CAT
    FROM TBL_MOA_APP_CATE_MAIN AS ACM
    JOIN TBL_MOA_MART_CONFIG AS MC ON ACM.M_MOA_CODE = MC.M_MOA_CODE
    WHERE ACM.T_CATE_CODE = '${detailCode}'
    AND ACM.M_MOA_CODE = '${martId}'
    AND T_CATE_STATUS = 'A'`
      }else{
        sql = `SELECT
        ACM.M_MOA_CODE, ACM.T_CATE_CODE, ACM.P_CAT_CODE, ACM.T_CATE_IMG_USE, ACM.T_CATE_IMG_CV, ACM.T_CATE_IMG_WD, ACM.T_CATE_IMG_HT,
        ACM.T_CATE_STATUS, MC.M_POS_REGCODE, ACM.C_TIME, ACM.M_TIME, ACM.T_CATE_TYPE,
        (
            SELECT
            CTGRY_NAME
            FROM ${dbConnect}.MART_CTGRY
            WHERE MART_SEQNO = MC.M_POS_REGCODE AND CTGRY_SEQNO = ACM.P_CAT_CODE
        ) AS P_CAT
    FROM TBL_MOA_APP_CATE_MAIN AS ACM
    JOIN TBL_MOA_MART_CONFIG AS MC ON ACM.M_MOA_CODE = MC.M_MOA_CODE
    WHERE ACM.T_CATE_CODE =  '${detailCode}'
    AND ACM.M_MOA_CODE = '${martId}'
    AND T_CATE_STATUS = 'A'`
      }
      // logger.writeLog("info", `${logBase} : ${sql}`);

      const [rows] = await pool.mysqlPool.query(sql);
      return rows[0];
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }


};
