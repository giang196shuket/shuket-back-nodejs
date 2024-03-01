


const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");


  module.exports = class productCommonModel {
    static bargainQuery(dbConnect) {
      return ` SELECT CONCAT(B.DSCNT_DIV_CODE,'|',B.DSCNT_PRICE,'|',B.DSCNT_UNIT,'|',B.DSCNT_RATE,'|',B.BRGN_GROUP_SEQNO,'|',B.BRGN_GROUP_NAME,'|',B.GOODS_UPDT_DTM,'|',B.BRGN_UPDT_DTM,'|',
      CASE WHEN NOW()   <
      START_DATE THEN '예정' WHEN NOW()   >=
      START_DATE AND NOW()   <
      DATE_ADD(END_DATE, INTERVAL
      1 DAY) THEN '적용중' WHEN NOW()   >=
      DATE_ADD(END_DATE, INTERVAL 1 DAY) THEN '종료' END) AS BRGN_STR
      FROM ${dbConnect}.MART_ORDER_BRGN AS B
      WHERE B.MART_SEQNO = PM.M_POS_REGCODE
      AND B.GOODS_CODE = MOG.GOODS_CODE
      AND B.START_DATE    <  NOW() AND DATE_ADD(B.END_DATE, INTERVAL 1 DAY)  > NOW()
      AND B.DSCNT_STATE_CODE= 'Y'
      AND CASE WHEN (SELECT USE_EXTEND_BRGN FROM moa_platform.TBL_MOA_MART_CONFIG WHERE M_POS_REGCODE=MOG.MART_SEQNO LIMIT 1)='Y'  THEN MOG.UNIT_CODE = B.UNIT_CODE
      ELSE MOG.UNIT_CODE = 0 AND IF(B.DSCNT_UNIT = 1, 0,B.DSCNT_UNIT) = MOG.EXTNS_UNIT_COUNT
      END
      ORDER BY B.ORDER LIMIT 1 `;
    }
    
    static bargainQueryGetCol(dbConnect) {
      return ` FROM ${dbConnect}.MART_ORDER_BRGN AS OB
      WHERE
      OB.GOODS_CODE = PM.P_CODE
      AND OB.MART_SEQNO = PM.M_POS_REGCODE
      AND OB.DSCNT_STATE_CODE = 'Y'
      AND DATE_FORMAT(OB.START_DATE, '%Y%m%d') <= DATE_FORMAT(CURDATE(), '%Y%m%d')
      AND DATE_FORMAT(OB.END_DATE, '%Y%m%d') >= DATE_FORMAT(CURDATE(), '%Y%m%d')
      AND CASE WHEN (SELECT USE_EXTEND_BRGN FROM moa_platform.TBL_MOA_MART_CONFIG WHERE M_POS_REGCODE=MOG.MART_SEQNO LIMIT 1)='Y'  THEN MOG.UNIT_CODE = OB.UNIT_CODE
      ELSE MOG.UNIT_CODE = 0 AND IF(OB.DSCNT_UNIT = 1, 0,OB.DSCNT_UNIT) = MOG.EXTNS_UNIT_COUNT
      END
      ORDER BY OB.BRGN_UPDT_DTM DESC
      LIMIT 1 `;
    }
  static async getProductCategory(cateParent, dbConnect, posRegcode) {
    let logBase = `models/productRegistedModel.getProductCategory:`;
    try {
      let sql = `  `;

      if (cateParent) {
        sql = `SELECT
        MC.CTGRY_SEQNO AS code, MC.CTGRY_NAME AS name
    FROM                
         ${dbConnect}.MART_CTGRY AS MC
    WHERE
        MC.MART_SEQNO = '${posRegcode}'                 
        AND MC.CTGRY_LARGE_NO = '${cateParent}'
        AND MC.CTGRY_SMALL_NO > 0
        AND CTGRY_STATE = 1  ORDER BY MC.CTGRY_ORDER, MC.CTGRY_NAME ASC`;
      } else {
        sql = `  SELECT
        MC.CTGRY_LARGE_NO AS code, MC.CTGRY_NAME AS name                 
    FROM
        ${dbConnect}.MART_CTGRY AS MC
    WHERE
        MC.MART_SEQNO = '${posRegcode}'     
        AND MC.CTGRY_LARGE_NO > 0
        AND MC.CTGRY_STATE = 1
        AND MC.CTGRY_SMALL_NO = 0 
        AND MC.CTGRY_MEDIUM_NO = 0    ORDER BY MC.CTGRY_ORDER, MC.CTGRY_NAME ASC `;
      }

      logger.writeLog("info", `${logBase} : ${sql}`);

      const [rows] = await pool.mysqlPool.query(sql);
      return rows;
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
  }
