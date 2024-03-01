const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");
const productCommonModel = require("../../model/product/common");


module.exports = class productPriceModel {
  static async searchProductPriceList(
    dataConnect,
    status,
    {
      customPriceStatus,
      categoryCode,
      categorySubCode,    
      keywordValue,
      keywordType,
      orderBy,
      dateStart,
      dateEnd
    },
    offset,
    limit
  ) {
    let logBase = `models/productInventoryModel.selectProductInventory:`;
    try {
     
      // tiến hành thêm điều kiện cho câu truy vấn với những param seach từ request
      let where = " WHERE 1=1 ";
    
      if (keywordType && keywordValue) {
        if (keywordType === "code") {
          //search product code
          where += ` AND P_CODE = '${keywordValue}'  `;
        } else if (keywordType === "barcode") {
          //search theo barcode
          where += ` AND P_BARCODE = '${keywordValue}'  `;
        } else if (keywordType === "name") {
          //search theo product name
          where += ` AND P_NAME LIKE '%"${keywordValue}"%'  `;
        } else if (keywordType === "tags") {
          //search theo product tags
          where += ` AND P_TAGS LIKE '%"${keywordValue}"%'  `;
        } else if (keywordType === "provider") {
          //search theo nhà cung cấp
          where += ` AND P_PROVIDER LIKE '%"${keywordValue}"%'  `;
        }
      }
      if (dataConnect.M_MOA_CODE) {
        // search theo  mart code
        where += `  AND M_MOA_CODE = '${dataConnect.M_MOA_CODE}' `;
      }
      if (categoryCode) {
        // search theo số category code
        where += ` AND CTGRY_LARGE_NO = '${categoryCode}' `;
      }
      if (categorySubCode) {
        //search theo số category sub code
        where += ` AND SEQ_P_CAT_SUB = '${categorySubCode}'  `;
      }
      if (status && status !== "O") {
        //statuus != out of stock
        where += ` AND P_STATUS = '${status}'  `;
      } else if (status && status === "O") {
        //statuus == out of stock
        //=>  lấy status = A bởi vì đã check product out of stock hay không ở những dòng code trên rồi
        where += ` AND P_STATUS = 'A'  `;
      } else {
        //khác deleted
        where += ` AND P_STATUS != 'D'  `;
      }
      // search product theo thời gian được tạo nằm giữa  date start và date end
      if (dateStart) {
        where += ` AND DATE_FORMAT(C_TIME , '%Y-%m-%d') >=  DATE_FORMAT('${dateStart}' , '%Y-%m-%d')  `;
      }
      if (dateEnd) {
        where += ` AND DATE_FORMAT(C_TIME , '%Y-%m-%d') <=  DATE_FORMAT('${dateEnd}' , '%Y-%m-%d')  `;
      }
      // price được scale
      if(customPriceStatus === 'Y'){
        where += ` AND PRICE_CUSTOM_STATUS = 'A' `
      }
      // price ko được scale
      if(customPriceStatus === 'N'){
        where += ` AND (PRICE_CUSTOM_STATUS != 'A' OR PRICE_CUSTOM_STATUS IS NULL) ` 
      }
      where += ` AND P_LIST_PRICE > 0 `

      // thêm điều kiện order by
      let whereOrder = "";
      if (orderBy !== "") {
        if (orderBy === "DESC") {
          whereOrder = " ORDER BY STK_STOCK DESC ";
        }
        if (orderBy === "ASC") {
          whereOrder = " ORDER BY STK_STOCK ASC ";
        }
      } else {
        whereOrder = " ORDER BY P_SALE_PRICE DESC, SEQ DESC ";
      }
      // thêm điều kiện phân trang
      let whereLimit = "";
      if (offset && limit) {
        whereLimit = ` LIMIT ${offset},${limit} `;
      }

      const sql = ` SELECT
      SUB.*,
              (
                  SELECT MCL.CTGRY_NAME
                  FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY MCL
                  WHERE SUB.CTGRY_LARGE_NO = MCL.CTGRY_LARGE_NO
                  AND SUB.M_POS_REGCODE = MCL.MART_SEQNO
                  AND MCL.CTGRY_MEDIUM_NO = 0
                      AND MCL.CTGRY_SMALL_NO = 0
                      AND MCL.CTGRY_STATE = 1 LIMIT 1
              ) AS P_CAT,
              (
                  SELECT MCL.CTGRY_NAME
                  FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY MCL
                  WHERE SUB.CTGRY_LARGE_NO = MCL.CTGRY_LARGE_NO
                  AND SUB.M_POS_REGCODE = MCL.MART_SEQNO
                  AND MCL.CTGRY_MEDIUM_NO = SUB.CTGRY_MEDIUM_NO
                      AND MCL.CTGRY_SMALL_NO = 0
                      AND MCL.CTGRY_STATE = 1  LIMIT 1
              ) AS P_CAT_MID,
              CASE WHEN BRGN_STR IS NOT NULL THEN
              SUBSTRING_INDEX(SUBSTRING_INDEX(BRGN_STR, '|', 2), '|', -1) ELSE NULL
              END P_SALE_PRICE,

              CASE WHEN BRGN_STR IS NOT NULL THEN
              SUBSTRING_INDEX(SUBSTRING_INDEX(BRGN_STR, '|', 3), '|', -1) ELSE NULL
              END DSCNT_UNIT,
              CASE WHEN BRGN_STR IS NOT NULL THEN
              SUBSTRING_INDEX(SUBSTRING_INDEX(BRGN_STR, '|', 5), '|', -1) ELSE NULL
              END BRGN_GROUP_SEQNO,
              CASE WHEN BRGN_STR IS NOT NULL THEN
              SUBSTRING_INDEX(SUBSTRING_INDEX(BRGN_STR, '|', 6), '|', -1) ELSE NULL
              END BRGN_GROUP_NAME,
              CASE WHEN BRGN_STR IS NOT NULL THEN
              SUBSTRING_INDEX(SUBSTRING_INDEX(BRGN_STR, '|', 9), '|', -1) ELSE NULL
              END BRGN_GROUP_STATUS, CONCAT(SUB.M_MOA_CODE, SUB.P_CODE,SUB.P_BARCODE) AS GPCODE
      FROM

              (
                  SELECT
                  PM.SEQ AS SEQ,
                  PM.M_MOA_CODE AS M_MOA_CODE,
                  PM.M_POS_REGCODE AS M_POS_REGCODE,
                  PM.P_CODE AS P_CODE,
                  PM.P_BARCODE AS P_BARCODE,
                  P.PRVDR_NAME AS P_PROVIDER,
                  PM.P_NAME AS P_NAME,
                  PM.P_IMG AS P_IMG,
                  PM.P_TAGS AS P_TAGS,
                  CONCAT(
                      IF(MOG.GOODS_STD IS NOT NULL, CONCAT(' ',MOG.GOODS_STD),''),
                      IF(MOG.EXTNS_UNIT_COUNT IS NOT NULL AND MOG.EXTNS_UNIT_COUNT != '' 
                      AND MOG.EXTNS_UNIT_COUNT > 1, CONCAT('*',MOG.EXTNS_UNIT_COUNT),''),
                      IF(MOG.EXTNS_UNIT IS NOT NULL AND MOG.EXTNS_UNIT != '', CONCAT(' (',MOG.EXTNS_UNIT,')'),'')
                  ) AS P_UNIT,
                  PM.P_STATUS AS P_STATUS,
                  PP.C_TIME AS C_TIME,
                  PP.M_TIME AS M_TIME,
                  MOG.EXPSR_PRICE AS P_LIST_PRICE,
                  (SELECT
                      CONCAT(B.DSCNT_DIV_CODE,'|',B.DSCNT_PRICE,'|',B.DSCNT_UNIT,'|',B.DSCNT_RATE,'|',B.BRGN_GROUP_SEQNO,'|',B.BRGN_GROUP_NAME,'|',B.GOODS_UPDT_DTM,'|',B.BRGN_UPDT_DTM,'|',
                      CASE WHEN NOW()   <
                      START_DATE THEN '예정' WHEN NOW()   >=
                      START_DATE AND NOW()   <
                      DATE_ADD(END_DATE, INTERVAL
                      1 DAY) THEN '적용중' WHEN NOW()   >=
                      DATE_ADD(END_DATE, INTERVAL 1 DAY) THEN '종료' END) AS BRGN_STR
                      FROM ${dataConnect.M_DB_CONNECT}.MART_ORDER_BRGN AS B
                      WHERE B.MART_SEQNO = PM.M_POS_REGCODE
                      AND B.GOODS_CODE = MOG.GOODS_CODE
                      AND IF(B.DSCNT_UNIT = 1, 0,B.DSCNT_UNIT) = MOG.EXTNS_UNIT_COUNT
                      AND B.START_DATE    <  NOW() AND DATE_ADD(B.END_DATE, INTERVAL 1 DAY)  > NOW()
                      AND B.DSCNT_STATE_CODE= 'Y' AND MOG.UNIT_CODE >= 0 ORDER BY B.ORDER LIMIT 1 ) AS BRGN_STR,
                  (
                      SELECT
                      OB.BRGN_GROUP_NAME
                      FROM
                      ${dataConnect.M_DB_CONNECT}.MART_ORDER_BRGN AS OB
                      WHERE
                      OB.GOODS_CODE = PM.P_CODE
                      AND OB.MART_SEQNO = PM.M_POS_REGCODE
                      AND OB.DSCNT_STATE_CODE = 'Y'
                      AND DATE_FORMAT(OB.START_DATE, '%Y%m%d') <= DATE_FORMAT(CURDATE(), '%Y%m%d')
                      AND DATE_FORMAT(OB.END_DATE, '%Y%m%d') >= DATE_FORMAT(CURDATE(), '%Y%m%d')
                      AND MOG.UNIT_CODE >= 0
                      ORDER BY
                      OB.BRGN_UPDT_DTM DESC
                      LIMIT 1
                  ) AS P_SALE_TITLE,
                  (SELECT CTGRY_LARGE_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY 
                         WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO  LIMIT 1) AS CTGRY_LARGE_NO,
                  (SELECT CTGRY_MEDIUM_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY 
                        WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO  LIMIT 1) AS CTGRY_MEDIUM_NO,
                  (SELECT MC.CTGRY_NAME FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC
                          WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO  LIMIT 1) AS P_CAT_SUB,
                  (SELECT MC.CTGRY_SEQNO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC 
                        WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO  LIMIT 1) AS SEQ_P_CAT_SUB,
                  (SELECT P.PRVDR_NAME FROM ${dataConnect.M_DB_CONNECT}.PRVDR AS P 
                        WHERE P.MART_SEQNO = MOG.MART_SEQNO AND P.PRVDR_SEQNO = MOG.PRVDR_SEQNO AND P.PRVDR_STATE_CODE='Y'  LIMIT 1) AS P_PRVDR_NAME,
                  CASE
                      WHEN PP.C_ID = 'system'
                      THEN 'System'
                      WHEN PP.C_ID <> ''
                      THEN
                          (
                          SELECT
                              UA.U_NAME
                          FROM
                              moa_platform.TBL_MOA_USERS_ADMIN AS UA
                          WHERE
                              UA.U_ID = PP.C_ID
                          )
                      ELSE ''
                  END C_NAME,
                  CASE
                      WHEN PP.M_ID = 'system'
                      THEN 'System'
                      WHEN PP.M_ID <> ''
                      THEN
                          (
                          SELECT
                              UA.U_NAME
                          FROM
                              moa_platform.TBL_MOA_USERS_ADMIN AS UA
                          WHERE
                              UA.U_ID = PP.M_ID
                          )
                      ELSE ''
                  END M_NAME,
                  MOG.MART_ORDER_GOODS_SEQNO as PR_SEQ,
                  MOG.INV_TYPE as G_INV_TYPE,
                  PP.PS_TYPE as PRICE_TYPE,
                  PP.PS_TYPE_OPTION as PRICE_UP_DOWN,
                  PP.PS_NUM as PRICE_NUMBER,
                  PP.PS_STATUS as PRICE_CUSTOM_STATUS,
                  PP.USE_TIME,
                  PP.TIME_START,
                  PP.TIME_END,
                  ifnull(PP.IS_USE_QTY,0) AS IS_USE_QTY,
                  ifnull(PP.DEFAULT_QTY,IFNULL((SELECT DEFAULT_QTY FROM moa_platform.TBL_MOA_PRD_SCALE 
                    WHERE M_MOA_CODE = '${dataConnect.M_MOA_CODE}'  LIMIT 1),1)) AS DEFAULT_QTY,
                  ifnull(PP.CUSTOM_QTY,IFNULL((SELECT DEFAULT_QTY FROM moa_platform.TBL_MOA_PRD_SCALE 
                    WHERE M_MOA_CODE = '${dataConnect.M_MOA_CODE}'  LIMIT 1),1)) AS CUSTOM_QTY
                  FROM TBL_MOA_PRD_MAIN AS PM
                  JOIN ${dataConnect.M_DB_CONNECT}.MART_ORDER_GOODS AS MOG
                  ON
                  (
                      MOG.MART_SEQNO = PM.M_POS_REGCODE
                      AND MOG.GOODS_CODE = PM.P_CODE
                      AND MOG.BRCD = PM.P_BARCODE
                      AND MOG.USE_YN = 'Y'
                  )
                  LEFT JOIN ${dataConnect.M_DB_CONNECT}.PRVDR AS P
                  ON
                  (
                      P.MART_SEQNO = MOG.MART_SEQNO
                      AND P.PRVDR_SEQNO = MOG.PRVDR_SEQNO
                      AND PRVDR_STATE_CODE = 'Y'
                  )
                  LEFT JOIN TBL_MOA_PRD_SCALE AS PP
                  ON
                  (
                      PP.M_MOA_CODE = PM.M_MOA_CODE
                      AND PP.P_CODE = PM.P_CODE
                      AND PP.P_BARCODE = PM.P_BARCODE
                  )
                  ORDER BY PR_SEQ desc
              ) SUB ${where} ORDER BY P_SALE_PRICE DESC, SEQ DESC ${whereLimit}`;

      let sqlCount = `  SELECT
      COUNT(SUB.SEQ) AS CNT
      FROM

              (
                  SELECT
                  PM.SEQ AS SEQ,
                  PM.M_MOA_CODE AS M_MOA_CODE,
                  PM.M_POS_REGCODE AS M_POS_REGCODE,
                  PM.P_CODE AS P_CODE,
                  PM.P_BARCODE AS P_BARCODE,
                  P.PRVDR_NAME AS P_PROVIDER,
                  PM.P_NAME AS P_NAME,
                  PM.P_IMG AS P_IMG,
                  PM.P_TAGS AS P_TAGS,
                  CONCAT(
                      IF(MOG.GOODS_STD IS NOT NULL, CONCAT(' ',MOG.GOODS_STD),''),
                      IF(MOG.EXTNS_UNIT_COUNT IS NOT NULL AND MOG.EXTNS_UNIT_COUNT != '' AND MOG.EXTNS_UNIT_COUNT > 1, 
                      CONCAT('*',MOG.EXTNS_UNIT_COUNT),''),
                      IF(MOG.EXTNS_UNIT IS NOT NULL AND MOG.EXTNS_UNIT != '', CONCAT(' (',MOG.EXTNS_UNIT,')'),'')
                  ) AS P_UNIT,
                  PM.P_STATUS AS P_STATUS,
                  PP.C_TIME AS C_TIME,
                  PP.M_TIME AS M_TIME,
                  MOG.EXPSR_PRICE AS P_LIST_PRICE,
                  (SELECT
                      CONCAT(B.DSCNT_DIV_CODE,'|',B.DSCNT_PRICE,'|',B.DSCNT_UNIT,'|',B.DSCNT_RATE,'|',B.BRGN_GROUP_SEQNO,'|',B.BRGN_GROUP_NAME,'|',B.GOODS_UPDT_DTM,'|',B.BRGN_UPDT_DTM,'|',
                      CASE WHEN NOW()   <
                      START_DATE THEN '예정' WHEN NOW()   >=
                      START_DATE AND NOW()   <
                      DATE_ADD(END_DATE, INTERVAL
                      1 DAY) THEN '적용중' WHEN NOW()   >=
                      DATE_ADD(END_DATE, INTERVAL 1 DAY) THEN '종료' END) AS BRGN_STR
                      FROM ${dataConnect.M_DB_CONNECT}.MART_ORDER_BRGN AS B
                      WHERE B.MART_SEQNO = PM.M_POS_REGCODE
                      AND B.GOODS_CODE = MOG.GOODS_CODE
                      AND IF(B.DSCNT_UNIT = 1, 0,B.DSCNT_UNIT) = MOG.EXTNS_UNIT_COUNT
                      AND B.START_DATE    <  NOW() AND DATE_ADD(B.END_DATE, INTERVAL 1 DAY)  > NOW()
                      AND B.DSCNT_STATE_CODE= 'Y' AND MOG.UNIT_CODE >= 0 ORDER BY B.ORDER LIMIT 1 ) AS BRGN_STR,
                  (
                      SELECT
                      OB.BRGN_GROUP_NAME
                      FROM
                      ${dataConnect.M_DB_CONNECT}.MART_ORDER_BRGN AS OB
                      WHERE
                      OB.GOODS_CODE = PM.P_CODE
                      AND OB.MART_SEQNO = PM.M_POS_REGCODE
                      AND OB.DSCNT_STATE_CODE = 'Y'
                      AND DATE_FORMAT(OB.START_DATE, '%Y%m%d') <= DATE_FORMAT(CURDATE(), '%Y%m%d')
                      AND DATE_FORMAT(OB.END_DATE, '%Y%m%d') >= DATE_FORMAT(CURDATE(), '%Y%m%d')
                      AND MOG.UNIT_CODE >= 0
                      ORDER BY
                      OB.BRGN_UPDT_DTM DESC
                      LIMIT 1
                  ) AS P_SALE_TITLE,
                  (SELECT CTGRY_LARGE_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY 
                         WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO  LIMIT 1) AS CTGRY_LARGE_NO,
                  (SELECT CTGRY_MEDIUM_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY 
                         WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO  LIMIT 1) AS CTGRY_MEDIUM_NO,
                  (SELECT MC.CTGRY_NAME FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC 
                         WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO  LIMIT 1) AS P_CAT_SUB,
                  (SELECT MC.CTGRY_SEQNO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC 
                         WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO  LIMIT 1) AS SEQ_P_CAT_SUB,
                  (SELECT P.PRVDR_NAME FROM ${dataConnect.M_DB_CONNECT}.PRVDR AS P 
                         WHERE P.MART_SEQNO = MOG.MART_SEQNO AND P.PRVDR_SEQNO = MOG.PRVDR_SEQNO AND P.PRVDR_STATE_CODE='Y'  LIMIT 1) AS P_PRVDR_NAME,
                  CASE
                      WHEN PP.C_ID = 'system'
                      THEN 'System'
                      WHEN PP.C_ID <> ''
                      THEN
                          (
                          SELECT
                              UA.U_NAME
                          FROM
                              moa_platform.TBL_MOA_USERS_ADMIN AS UA
                          WHERE
                              UA.U_ID = PP.C_ID
                          )
                      ELSE ''
                  END C_NAME,
                  CASE
                      WHEN PP.M_ID = 'system'
                      THEN 'System'
                      WHEN PP.M_ID <> ''
                      THEN
                          (
                          SELECT
                              UA.U_NAME
                          FROM
                              moa_platform.TBL_MOA_USERS_ADMIN AS UA
                          WHERE
                              UA.U_ID = PP.M_ID
                          )
                      ELSE ''
                  END M_NAME,
                  MOG.MART_ORDER_GOODS_SEQNO as PR_SEQ,
                  MOG.INV_TYPE as G_INV_TYPE,
                  PP.PS_TYPE as PRICE_TYPE,
                  PP.PS_TYPE_OPTION as PRICE_UP_DOWN,
                  PP.PS_NUM as PRICE_NUMBER,
                  PP.PS_STATUS as PRICE_CUSTOM_STATUS,
                  PP.IS_USE_QTY,
                  PP.DEFAULT_QTY,
                  PP.CUSTOM_QTY
                  FROM TBL_MOA_PRD_MAIN AS PM
                  JOIN ${dataConnect.M_DB_CONNECT}.MART_ORDER_GOODS AS MOG
                  ON
                  (
                      MOG.MART_SEQNO = PM.M_POS_REGCODE
                      AND MOG.GOODS_CODE = PM.P_CODE
                      AND MOG.BRCD = PM.P_BARCODE
                      AND MOG.USE_YN = 'Y'
                  )
                  LEFT JOIN ${dataConnect.M_DB_CONNECT}.PRVDR AS P
                  ON
                  (
                      P.MART_SEQNO = MOG.MART_SEQNO
                      AND P.PRVDR_SEQNO = MOG.PRVDR_SEQNO
                      AND PRVDR_STATE_CODE = 'Y'
                  )
                  LEFT JOIN TBL_MOA_PRD_SCALE AS PP
                  ON
                  (
                      PP.M_MOA_CODE = PM.M_MOA_CODE
                      AND PP.P_CODE = PM.P_CODE
                      AND PP.P_BARCODE = PM.P_BARCODE
                  )
                  ORDER BY PR_SEQ desc
              ) SUB  ${where} `;
      logger.writeLog("error", `${logBase} : ${sql}`);

      const [rows] = await pool.mysqlPool.query(sql);

      const [rowsCount] = await pool.mysqlPool.query(sqlCount);
      return { rows: rows, search_count: rowsCount[0].CNT };

    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
};
