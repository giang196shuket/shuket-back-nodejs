const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");

module.exports = class orderProductModel {
  static async searchProductOrder(
    {
      page,
      limit,
      keywordType,
      keywordValue,
      orderBy,
      status,
      dateStart,
      dateEnd,
      optionOrderByDate,
      optionOrderSort,
      categoryCode
    },
    limitQuery,
    dataConnect
  ) {
    let logBase = `models/orderProductModel.searchProductOrder`;
    try {
      let where = " WHERE 1=1 "
      if(keywordValue){
        //keywordType default 'tags'
        where += ` AND P_TAGS LIKE '%${keywordValue}%' `
      }
      if(dataConnect.M_MOA_CODE){
        where += ` AND M_MOA_CODE = '${dataConnect.M_MOA_CODE}' `
      }
      //categoryCode:[A1, A2, A3, A4,...]
      // thay thế các cate code có chữ A => bỏ A vì CTGRY_LARGE_NO chỉ là số
      categoryCode = categoryCode.map(item => item.toString().startsWith('A') ? item.replace(/^A/, '') : item);
      if(categoryCode.length > 0){
        where += ` AND CTGRY_LARGE_NO IN ('${categoryCode}')`
      }
      let whereSub = ""
      if(optionOrderByDate && optionOrderByDate === 'today'){
        //dateStart , dateEnd lúc này sẽ trống
        const time = moment().format('YYYY-MM-DD') 
        if(time){
            where += ` AND DATE_FORMAT(ORDER_TIME, '%Y-%m-%d') >= DATE_FORMAT('${time}', '%Y-%m-%d') `
            whereSub += ` AND DATE_FORMAT(TMOD.C_TIME, '%Y-%m-%d') >= DATE_FORMAT('${time}', '%Y-%m-%d') `
        }
      }
      if(optionOrderByDate && optionOrderByDate === 'week'){
        //dateStart , dateEnd lúc này sẽ trống
         dateStart = moment().add(1, 'd').format('YYYY-MM-DD') 
         dateEnd = moment().subtract(1, 'weeks').format('YYYY-MM-DD') 

        if(dateStart){
            where += ` AND DATE_FORMAT(ORDER_TIME, '%Y-%m-%d') <= DATE_FORMAT('${dateStart}', '%Y-%m-%d') `
            whereSub += ` AND DATE_FORMAT(TMOD.C_TIME, '%Y-%m-%d') <= DATE_FORMAT('${dateStart}', '%Y-%m-%d') `
        }
        if(dateEnd){
            where += ` AND DATE_FORMAT(ORDER_TIME, '%Y-%m-%d') >= DATE_FORMAT('${dateEnd}', '%Y-%m-%d') `
            whereSub += ` AND DATE_FORMAT(TMOD.C_TIME, '%Y-%m-%d') >= DATE_FORMAT('${dateEnd}', '%Y-%m-%d') `
        }
      }
      if(optionOrderByDate && optionOrderByDate === 'month'){
        //dateStart , dateEnd lúc này sẽ trống
        dateStart = moment().add(1, 'd').format('YYYY-MM-DD') 
        dateEnd = moment().subtract(1, 'months').format('YYYY-MM-DD') 

       if(dateStart){
           where += ` AND DATE_FORMAT(ORDER_TIME, '%Y-%m-%d') <= DATE_FORMAT('${dateStart}', '%Y-%m-%d') `
           whereSub += ` AND DATE_FORMAT(TMOD.C_TIME, '%Y-%m-%d') <= DATE_FORMAT('${dateStart}', '%Y-%m-%d') `
       }
       if(dateEnd){
           where += ` AND DATE_FORMAT(ORDER_TIME, '%Y-%m-%d') >= DATE_FORMAT('${dateEnd}', '%Y-%m-%d') `
           whereSub += ` AND DATE_FORMAT(TMOD.C_TIME, '%Y-%m-%d') >= DATE_FORMAT('${dateEnd}', '%Y-%m-%d') `
       }
     }
     if(optionOrderByDate && optionOrderByDate === 'custom'){
        //dateStart , dateEnd lúc này sẽ có giá trị và phải  nhập
       if(dateStart){
           where += ` AND DATE_FORMAT(ORDER_TIME, '%Y-%m-%d')  >= DATE_FORMAT('${dateStart}', '%Y-%m-%d') `
           whereSub += ` AND DATE_FORMAT(TMOD.C_TIME, '%Y-%m-%d') >= DATE_FORMAT('${dateStart}', '%Y-%m-%d') `
       }
       if(dateEnd){
           where += ` AND DATE_FORMAT(ORDER_TIME, '%Y-%m-%d') <= DATE_FORMAT('${dateEnd}', '%Y-%m-%d') `
           whereSub += ` AND DATE_FORMAT(TMOD.C_TIME, '%Y-%m-%d') <=  DATE_FORMAT('${dateEnd}', '%Y-%m-%d') `
       }
     }
     let whereOrder = " ORDER BY SUM(SUB2.O_QTY) DESC"
     if(optionOrderSort){
        if(optionOrderSort === 'quantity_asc'){
            whereOrder += ' ORDER BY SUM(SUB2.O_QTY) ASC '
        }
        if(optionOrderSort === 'quantity_desc'){
            whereOrder += ' ORDER BY SUM(SUB2.O_QTY) DESC '
        }
        if(optionOrderSort === 'price_desc'){
            whereOrder += ' ORDER BY SUM(SUB2.O_PRICE) DESC '
        }
        if(optionOrderSort === 'price_asc'){
            whereOrder += ' ORDER BY SUM(SUB2.O_PRICE) ASC '
        }
     }
     let sql = `SELECT SUB2. *, SUM(SUB2.O_QTY) AS TOTAL_QTY,SUM(SUB2.O_PRICE) AS TOTAL_PRICE FROM (
        SELECT
        SUB.*,
                (
                    SELECT MCL.CTGRY_NAME
                    FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY MCL
                    WHERE SUB.CTGRY_LARGE_NO = MCL.CTGRY_LARGE_NO
                    AND SUB.M_POS_REGCODE = MCL.MART_SEQNO
                    AND MCL.CTGRY_MEDIUM_NO = SUB.CTGRY_MEDIUM_NO
                        AND MCL.CTGRY_SMALL_NO = 0
                        AND MCL.CTGRY_STATE = 1
                        LIMIT 1
                ) AS P_CAT_MID,
                (
                    SELECT MCL.CTGRY_NAME
                    FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY MCL
                    WHERE SUB.CTGRY_LARGE_NO = MCL.CTGRY_LARGE_NO
                    AND SUB.M_POS_REGCODE = MCL.MART_SEQNO
                    AND MCL.CTGRY_MEDIUM_NO = 0
                        AND MCL.CTGRY_SMALL_NO = 0
                        AND MCL.CTGRY_STATE = 1
                    LIMIT 1
                ) AS P_CAT,
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
                END BRGN_GROUP_STATUS, CONCAT(SUB.M_MOA_CODE, SUB.P_CODE,SUB.P_BARCODE) AS GPCODE -- ,               
        FROM

                (
                    SELECT
                    PM.SEQ AS SEQ,
                    PM.M_MOA_CODE AS M_MOA_CODE,
                    PM.M_POS_REGCODE AS M_POS_REGCODE,
                    PM.P_CODE AS P_CODE,
                    PM.P_BARCODE AS P_BARCODE,
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
                    (SELECT CTGRY_LARGE_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO 
                    AND MART_SEQNO = MOG.MART_SEQNO LIMIT 1) AS CTGRY_LARGE_NO,
                    (SELECT CTGRY_MEDIUM_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO 
                    AND MART_SEQNO = MOG.MART_SEQNO LIMIT 1) AS CTGRY_MEDIUM_NO,
                    (SELECT MC.CTGRY_NAME FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC WHERE MC.MART_SEQNO = MOG.MART_SEQNO 
                    AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO LIMIT 1) AS P_CAT_SUB,
                    (SELECT MC.CTGRY_SEQNO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC WHERE MC.MART_SEQNO = MOG.MART_SEQNO 
                    AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO LIMIT 1) AS SEQ_P_CAT_SUB,
                    MOG.MART_ORDER_GOODS_SEQNO as PR_SEQ,
                    MOG.INV_TYPE as G_INV_TYPE,
                    PP.PS_TYPE as PRICE_TYPE,
                    PP.PS_TYPE_OPTION as PRICE_UP_DOWN,
                    PP.PS_NUM as PRICE_NUMBER,
                    PP.PS_STATUS as PRICE_CUSTOM_STATUS,
                    PP.IS_USE_QTY,
                    PP.DEFAULT_QTY,
                    PP.CUSTOM_QTY,
                    TMOD.O_CART_CODE as O_CART_CODE,
                    TMOD.C_TIME as ORDER_TIME,
                    TMOD.O_QTY,
                    (TMOD.O_PRD_PRICE * TMOD.O_QTY) AS O_PRICE
                    FROM TBL_MOA_ORD_DETAIL AS TMOD

                    JOIN ${dataConnect.M_DB_CONNECT}.MART_ORDER_GOODS AS MOG
                    ON
                    (
                            MOG.MART_SEQNO = '${dataConnect.M_POS_REGCODE}'
                            AND MOG.GOODS_CODE = TMOD.P_CODE
                            AND MOG.BRCD = TMOD.P_BARCODE
                            AND MOG.USE_YN = 'Y'
                    )
                    JOIN TBL_MOA_PRD_MAIN AS PM
                    ON
                    (
                            PM.M_MOA_CODE = TMOD.M_MOA_CODE
                            AND PM.P_CODE = TMOD.P_CODE
                            AND PM.P_BARCODE = TMOD.P_BARCODE
                    )
                    LEFT JOIN TBL_MOA_PRD_SCALE AS PP
                    ON
                    (
                            PP.M_MOA_CODE = TMOD.M_MOA_CODE
                            AND PP.P_CODE = TMOD.P_CODE
                            AND PP.P_BARCODE = TMOD.P_BARCODE
                    )
                    WHERE TMOD.O_CANCEL_STATUS = 'C' AND (SELECT O_STATUS FROM TBL_MOA_ORD_MAIN 
                        WHERE O_CODE = TMOD.O_CODE AND TMOD.M_MOA_CODE = '${dataConnect.M_MOA_CODE}' LIMIT 1) NOT IN (60,61,71)  
                        AND TMOD.M_MOA_CODE = '${dataConnect.M_MOA_CODE}' ${whereSub}
                    ORDER BY PR_SEQ desc
                ) SUB ${where}  ) SUB2 GROUP BY GPCODE ${limitQuery}`

     let sqlCount = `SELECT SUB.SEQ
     FROM

             (
                 SELECT
                 PM.SEQ AS SEQ,
                 PM.M_MOA_CODE AS M_MOA_CODE,
                 PM.M_POS_REGCODE AS M_POS_REGCODE,
                 PM.P_CODE AS P_CODE,
                 PM.P_BARCODE AS P_BARCODE,
                 PM.P_NAME AS P_NAME,
                 PM.P_IMG AS P_IMG,
                 PM.P_TAGS AS P_TAGS,
                 CONCAT(
                     IF(MOG.GOODS_STD IS NOT NULL, CONCAT(' ',MOG.GOODS_STD),''),
                     IF(MOG.EXTNS_UNIT_COUNT IS NOT NULL AND MOG.EXTNS_UNIT_COUNT != '' AND MOG.EXTNS_UNIT_COUNT > 1, CONCAT('*',MOG.EXTNS_UNIT_COUNT),''),
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
                 (SELECT CTGRY_LARGE_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY 
                 WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO LIMIT 1) AS CTGRY_LARGE_NO,
                 (SELECT CTGRY_MEDIUM_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY 
                 WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO LIMIT 1) AS CTGRY_MEDIUM_NO,
                 (SELECT MC.CTGRY_NAME FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC 
                 WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO LIMIT 1) AS P_CAT_SUB,
                 (SELECT MC.CTGRY_SEQNO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC 
                 WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO LIMIT 1) AS SEQ_P_CAT_SUB,
                 MOG.MART_ORDER_GOODS_SEQNO as PR_SEQ,
                 MOG.INV_TYPE as G_INV_TYPE,
                 PP.PS_TYPE as PRICE_TYPE,
                 PP.PS_TYPE_OPTION as PRICE_UP_DOWN,
                 PP.PS_NUM as PRICE_NUMBER,
                 PP.PS_STATUS as PRICE_CUSTOM_STATUS,
                 PP.IS_USE_QTY,
                 PP.DEFAULT_QTY,
                 PP.CUSTOM_QTY,
                 TMOD.O_CART_CODE as O_CART_CODE,
                 TMOD.C_TIME as ORDER_TIME,
                 TMOD.O_QTY,
                 (TMOD.O_PRD_PRICE * TMOD.O_QTY) AS O_PRICE,
                 CONCAT(PM.M_MOA_CODE, PM.P_CODE,PM.P_BARCODE) AS GPCODE
                 FROM TBL_MOA_ORD_DETAIL AS TMOD
                 JOIN ${dataConnect.M_DB_CONNECT}.MART_ORDER_GOODS AS MOG
                 ON
                 (
                         MOG.MART_SEQNO = '${dataConnect.M_POS_REGCODE}'
                         AND MOG.GOODS_CODE = TMOD.P_CODE
                         AND MOG.BRCD = TMOD.P_BARCODE
                         AND MOG.USE_YN = 'Y'
                 )
                 JOIN TBL_MOA_PRD_MAIN AS PM
                 ON
                 (
                         PM.M_MOA_CODE = TMOD.M_MOA_CODE
                         AND PM.P_CODE = TMOD.P_CODE
                         AND PM.P_BARCODE = TMOD.P_BARCODE
                 )
                 LEFT JOIN TBL_MOA_PRD_SCALE AS PP
                 ON
                 (
                         PP.M_MOA_CODE = TMOD.M_MOA_CODE
                         AND PP.P_CODE = TMOD.P_CODE
                         AND PP.P_BARCODE = TMOD.P_BARCODE
                 )
                 WHERE  TMOD.O_CANCEL_STATUS = 'C' AND (SELECT O_STATUS FROM TBL_MOA_ORD_MAIN 
                    WHERE O_CODE = TMOD.O_CODE AND TMOD.M_MOA_CODE = '${dataConnect.M_MOA_CODE}' LIMIT 1) NOT IN (60,61,71)  
                    AND TMOD.M_MOA_CODE = '${dataConnect.M_MOA_CODE}' ${whereSub}
                 ORDER BY PR_SEQ desc
             ) SUB ${where}  GROUP BY GPCODE`
      logger.writeLog("info", `${logBase} : ${sql}`);

      const [list] = await pool.mysqlPool.query(sql);
      const [total] = await pool.mysqlPool.query(sqlCount);

      return {list: list, total: total.length};
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
};
