const pool = require("../../../../config/database");
const logger = require("../../../../config/logger");
const moment = require("moment");

function bargainQuery(dbConnect) {
  return `SELECT CONCAT(B.DSCNT_DIV_CODE,'|',B.DSCNT_PRICE,'|',B.DSCNT_UNIT,'|',B.DSCNT_RATE,'|',B.BRGN_GROUP_SEQNO,'|',B.BRGN_GROUP_NAME,'|',B.GOODS_UPDT_DTM,'|',B.BRGN_UPDT_DTM,'|',
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
    ORDER BY B.ORDER LIMIT 1`;
}

function bargainQueryGetCol(dbConnect) {
  return `FROM ${dbConnect}.MART_ORDER_BRGN AS OB
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
    LIMIT 1`;
}
module.exports = class templateViewEightModel {
  //banner 01
  static async getProductTemplateData(
    prdCode,
    prdName,
    prdBCode,
    martId,
    posRegcode,
    dbConnect
  ) {
    let logBase = `models/templateViewEightModel.getProductTemplateData:`;
    try {
      const sql = `SELECT SUB.*,
      CASE WHEN BRGN_STR IS NOT NULL THEN SUBSTRING_INDEX(SUBSTRING_INDEX(BRGN_STR, '|', 2), '|', -1) ELSE NULL END P_SALE_PRICE, 0 as IS_OUT_STOCK
    FROM (SELECT PM.SEQ, PM.M_MOA_CODE, PM.M_POS_REGCODE, PM.P_CODE, PM.P_BARCODE, PM.P_CAT, PM.P_CAT_CODE,
            PM.P_CAT_SUB, PM.P_NAME, PM.P_IMG, PM.P_TAGS, PM.P_STATUS, PM.C_TIME, PM.M_TIME,
            P.PRVDR_NAME AS P_PROVIDER,
            CONCAT(
              IF(MOG.GOODS_STD IS NOT NULL, CONCAT(' ',MOG.GOODS_STD),''),
              IF(MOG.EXTNS_UNIT_COUNT IS NOT NULL AND MOG.EXTNS_UNIT_COUNT != '' AND MOG.EXTNS_UNIT_COUNT > 1, CONCAT('*',MOG.EXTNS_UNIT_COUNT),''),
              IF(MOG.EXTNS_UNIT IS NOT NULL AND MOG.EXTNS_UNIT != '', CONCAT(' (',MOG.EXTNS_UNIT,')'),'')
            ) AS P_UNIT, MOG.EXPSR_PRICE AS P_LIST_PRICE,
            PP.PS_TYPE as PRICE_TYPE,
            PP.PS_TYPE_OPTION as PRICE_UP_DOWN,
            PP.PS_NUM as PRICE_NUMBER,
            PP.PS_STATUS as PRICE_CUSTOM_STATUS,
            (${bargainQuery(dbConnect)}) AS BRGN_STR,
            (SELECT OB.BRGN_GROUP_NAME ${bargainQueryGetCol(
              dbConnect
            )}) AS P_SALE_TITLE,
            (SELECT OB.BRGN_GROUP_SEQNO ${bargainQueryGetCol(
              dbConnect
            )}) AS E_CODE,
            'POS SALE' AS SALE_SRC,
            MOG.MART_ORDER_GOODS_SEQNO as PR_SEQ,
            MOG.TAX_TYPE AS TAX_TYPE
          FROM TBL_MOA_PRD_MAIN AS PM
          JOIN ${dbConnect}.MART_ORDER_GOODS AS MOG ON MOG.MART_SEQNO = PM.M_POS_REGCODE AND MOG.GOODS_CODE = PM.P_CODE AND MOG.BRCD = PM.P_BARCODE
          LEFT JOIN TBL_MOA_PRD_SCALE AS PP
          ON
          (
              PP.M_MOA_CODE = PM.M_MOA_CODE
              AND PP.P_CODE = PM.P_CODE
              AND PP.P_BARCODE = PM.P_BARCODE
          )
          LEFT JOIN ${dbConnect}.PRVDR AS P ON P.MART_SEQNO = MOG.MART_SEQNO AND P.PRVDR_SEQNO = MOG.PRVDR_SEQNO AND PRVDR_STATE_CODE = 'Y'
          WHERE PM.P_STATUS = 'A'
          AND PM.M_MOA_CODE = '${martId}'
          AND PM.P_CODE = ${prdCode}
          AND PM.P_BARCODE = ${prdBCode}
          AND MOG.USE_YN = 'Y'
        ) SUB
    ORDER BY SUB.PR_SEQ desc
    LIMIT 1 `;
      // logger.writeLog("info", `${logBase} : ${sql}`);

      const [rows] = await pool.mysqlPool.query(sql);
      return rows[0];
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
  static async getProductStock(prdCode, prdBCode, martId, dbConnect) {
    let logBase = `models/templateViewEightModel.getProductStock:`;
    try {
      const sql = `SELECT PM.P_CODE,PM.P_INV_TYPE,PM.P_STATUS,PM.P_MIN_STOCK, IFNULL(STO.STK_STOCK,0) AS STK_STOCK,MOG.INV_TYPE as G_INV_TYPE FROM TBL_MOA_PRD_MAIN AS PM
      left join TBL_MOA_STOCK_TOGETHERS AS STO ON STO.GOODS_CODE = PM.P_CODE AND STO.M_MOA_CODE = PM.M_MOA_CODE
      left join ${dbConnect}.MART_ORDER_GOODS AS MOG
      ON
      (
              MOG.MART_SEQNO = PM.M_POS_REGCODE
              AND MOG.GOODS_CODE = PM.P_CODE
              AND MOG.BRCD = PM.P_BARCODE
              AND MOG.USE_YN = 'Y'
      )
      WHERE PM.M_MOA_CODE ='${martId}' AND PM.P_STATUS ='A' AND PM.P_CODE=${prdCode} AND PM.P_BARCODE=${prdBCode}`;
    //   logger.writeLog("info", `${logBase} : ${sql}`);

      const [rows] = await pool.mysqlPool.query(sql);
      return rows[0];
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
};
