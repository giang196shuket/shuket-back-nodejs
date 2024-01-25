const pool = require("../../../../config/database");
const logger = require("../../../../config/logger");
const moment = require("moment");

module.exports = class templateViewTenModel {
  //category list icon
  static async getTypeTenData(cateCode, cateType, martId, dbConnect) {
    let logBase = `models/templateViewTenModel.getTypeTenData:`;
    try {
      let sql = "";
      if (cateType === "L") {
        //LARGE ICON => CTGRY_LARGE_NO = ACM.P_CAT_CODE
        sql = `SELECT ACM.M_MOA_CODE, ACM.T_CATE_CODE, ACM.P_CAT_CODE, ACM.T_CATE_IMG_USE, ACM.T_CATE_IMG_CV, ACM.T_CATE_IMG_WD, 
        ACM.T_CATE_IMG_HT, ACM.T_CATE_STATUS, MC.M_POS_REGCODE, ACM.C_TIME, ACM.M_TIME, ACM.T_CATE_TYPE, ACM.T_CATE_IMG_DATA,
                    (
                        SELECT
                        IF(CHAR_LENGTH(TRIM(REPLACE(CTGRY_NAME, ' ','' )))>4,CONCAT(SUBSTRING(TRIM(REPLACE(CTGRY_NAME, ' ','' )),1,4),''),TRIM(REPLACE(CTGRY_NAME, ' ','' )))  AS CTGRY_NAME
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
                WHERE ACM.T_CATE_CODE = '${cateCode}'
                AND ACM.M_MOA_CODE = '${martId}'
                AND ACM.T_CATE_STATUS = 'A'
				AND ACM.T_CATE_M_TYPE = 'SM'`;
      } else {
        // MAIN ICON  => CTGRY_SEQNO = ACM.P_CAT_CODE
        sql = `SELECT
        ACM.M_MOA_CODE, ACM.T_CATE_CODE, ACM.P_CAT_CODE, ACM.T_CATE_IMG_USE, ACM.T_CATE_IMG_CV, ACM.T_CATE_IMG_WD, ACM.T_CATE_IMG_HT,
        ACM.T_CATE_STATUS, MC.M_POS_REGCODE, ACM.C_TIME, ACM.M_TIME, ACM.T_CATE_TYPE,ACM.T_CATE_IMG_DATA,
        (
            SELECT
             IF(CHAR_LENGTH(TRIM(REPLACE(CTGRY_NAME, ' ','' )))>4,CONCAT(SUBSTRING(TRIM(REPLACE(CTGRY_NAME, ' ','' )),1,4),''),TRIM(REPLACE(CTGRY_NAME, ' ','' )))  AS CTGRY_NAME
            FROM ${dbConnect}.MART_CTGRY
            WHERE MART_SEQNO = MC.M_POS_REGCODE AND CTGRY_SEQNO = ACM.P_CAT_CODE
        ) AS P_CAT
    FROM TBL_MOA_APP_CATE_MAIN AS ACM
    JOIN TBL_MOA_MART_CONFIG AS MC ON ACM.M_MOA_CODE = MC.M_MOA_CODE
    WHERE ACM.T_CATE_CODE = '${cateCode}'
    AND ACM.M_MOA_CODE = '${martId}'
    AND ACM.T_CATE_STATUS = 'A'
AND ACM.T_CATE_M_TYPE = 'SM'`;
      }
      // logger.writeLog("info", `${logBase} : ${sql}`);

      const [rows] = await pool.mysqlPool.query(sql);
      return rows[0];
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
  static async getCateMid(cateCode , martId, dbConnect) {
    let logBase = `models/templateViewTenModel.getCateMid:`;
    try {
      const sql = ` SELECT
      TCATE.CTGRY_MEDIUM_NO AS MID_CAT_CODE, TCATE.CTGRY_NAME AS MID_CAT_NAME
  FROM
      ${dbConnect}.MART_CTGRY AS TCATE
JOIN TBL_MOA_MART_CONFIG AS MC ON TCATE.MART_SEQNO = MC.M_POS_REGCODE
  WHERE
      MC.M_MOA_CODE = '${martId}'
      AND TCATE.CTGRY_LARGE_NO = '${cateCode}'
      AND TCATE.CTGRY_STATE = 1
      AND TCATE.CTGRY_SMALL_NO = 0
      AND TCATE.CTGRY_MEDIUM_NO > 0`;
      // logger.writeLog("info", `${logBase} : ${sql}`);

      const [rows] = await pool.mysqlPool.query(sql);
      return rows;
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }


};
