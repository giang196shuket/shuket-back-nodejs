const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");



function bargainQuery(dbConnect) {
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

function bargainQueryGetCol(dbConnect) {
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
module.exports = class productRegistedModel {

  static async getProductRegister_Main_Pos(dbConnect ,martId) {
    let logBase = `models/productRegistedModel.getProductRegister_Main_Pos:`;
      try {
        const  sql = ` SELECT
				SUB.*,
						(
							SELECT MCL.CTGRY_NAME
							FROM ${dbConnect}.MART_CTGRY MCL
							WHERE SUB.CTGRY_LARGE_NO = MCL.CTGRY_LARGE_NO
							AND SUB.M_POS_REGCODE = MCL.MART_SEQNO
							AND MCL.CTGRY_MEDIUM_NO = 0
								AND MCL.CTGRY_SMALL_NO = 0
								AND MCL.CTGRY_STATE = 1
                            LIMIT 1
						) AS P_CAT,
						CASE WHEN BRGN_STR IS NOT NULL THEN
						SUBSTRING_INDEX(SUBSTRING_INDEX(BRGN_STR, '|', 2), '|', -1) ELSE NULL
						END P_SALE_PRICE
				FROM
				(
					SELECT
						PM.SEQ AS SEQ,
                        PM.M_MOA_CODE AS M_MOA_CODE,
						PM.M_POS_REGCODE AS M_POS_REGCODE,
						PM.P_NAME AS P_NAME,
            PM.P_CODE,
            PM.P_BARCODE,
						PM.P_SALE_PRICE AS PROD_PRICE,
						MOG.GOODS_NAME as G_NAME,
						IF(PM.P_NAME != MOG.GOODS_NAME, 1,0) as udate_name,
						PM.P_IMG AS P_IMG,
						PM.P_TAGS AS P_TAGS,
						CONCAT(
                            IF(MOG.GOODS_STD IS NOT NULL, CONCAT(' ',MOG.GOODS_STD),''),
                            IF(MOG.EXTNS_UNIT_COUNT IS NOT NULL AND MOG.EXTNS_UNIT_COUNT != '' AND MOG.EXTNS_UNIT_COUNT > 1, CONCAT('*',MOG.EXTNS_UNIT_COUNT),''),
                            IF(MOG.EXTNS_UNIT IS NOT NULL AND MOG.EXTNS_UNIT != '', CONCAT(' (',MOG.EXTNS_UNIT,')'),'')
						) AS P_UNIT,
						(
							SELECT
							OB.DSCNT_PRICE
							FROM
              ${dbConnect}.MART_ORDER_BRGN AS OB
							WHERE
							OB.GOODS_CODE = PM.P_CODE
							AND OB.MART_SEQNO = PM.M_POS_REGCODE
							AND OB.DSCNT_STATE_CODE = 'Y'
							AND DATE_FORMAT(OB.START_DATE, '%Y%m%d') <= DATE_FORMAT(CURDATE(), '%Y%m%d')
							AND DATE_FORMAT(OB.END_DATE, '%Y%m%d') >= DATE_FORMAT(CURDATE(), '%Y%m%d')
							ORDER BY
							OB.BRGN_UPDT_DTM DESC
							LIMIT 1
						) AS P_SALE_PRICE_OLD,
                        (SELECT
							CONCAT(B.DSCNT_DIV_CODE,'|',B.DSCNT_PRICE,'|',B.DSCNT_UNIT,'|',B.DSCNT_RATE,'|',B.BRGN_GROUP_SEQNO,'|',B.BRGN_GROUP_NAME,'|',B.GOODS_UPDT_DTM,'|',B.BRGN_UPDT_DTM,'|',
							CASE WHEN NOW()   <
							START_DATE THEN '예정' WHEN NOW()   >=
							START_DATE AND NOW()   <
							DATE_ADD(END_DATE, INTERVAL
							1 DAY) THEN '적용중' WHEN NOW()   >=
							DATE_ADD(END_DATE, INTERVAL 1 DAY) THEN '종료' END) AS BRGN_STR
							FROM  ${dbConnect}.MART_ORDER_BRGN AS B
							WHERE B.MART_SEQNO = PM.M_POS_REGCODE
							AND B.GOODS_CODE = MOG.GOODS_CODE
							AND IF(B.DSCNT_UNIT = 1, 0,B.DSCNT_UNIT) = MOG.EXTNS_UNIT_COUNT
							AND B.START_DATE    <  NOW() AND DATE_ADD(B.END_DATE, INTERVAL 1 DAY)  > NOW()
							AND B.DSCNT_STATE_CODE= 'Y' ORDER BY B.ORDER LIMIT 1 ) AS BRGN_STR,
						(SELECT CTGRY_LARGE_NO FROM  ${dbConnect}.MART_CTGRY WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO) AS CTGRY_LARGE_NO,
						(SELECT MC.CTGRY_NAME FROM  ${dbConnect}.MART_CTGRY AS MC WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO) AS P_CAT_SUB,
						(SELECT MC.CTGRY_SEQNO FROM  ${dbConnect}.MART_CTGRY AS MC WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO) AS SEQ_P_CAT_SUB,
						(SELECT P.PRVDR_NAME FROM  ${dbConnect}.PRVDR AS P WHERE P.MART_SEQNO = MOG.MART_SEQNO AND P.PRVDR_SEQNO = MOG.PRVDR_SEQNO AND P.PRVDR_STATE_CODE='Y') AS P_PRVDR_NAME
					FROM
						TBL_MOA_PRD_MAIN AS PM
						JOIN (
							SELECT * FROM  ${dbConnect}.MART_ORDER_GOODS  ORDER BY MART_ORDER_GOODS_SEQNO desc
						) MOG
						ON
						(
							MOG.MART_SEQNO = PM.M_POS_REGCODE
							AND MOG.GOODS_CODE = PM.P_CODE
							AND MOG.BRCD = PM.P_BARCODE
							AND MOG.USE_YN = 'Y'
						)
						LEFT JOIN  ${dbConnect}.PRVDR AS P
						ON
						(
							P.MART_SEQNO = MOG.MART_SEQNO
							AND P.PRVDR_SEQNO = MOG.PRVDR_SEQNO
							AND PRVDR_STATE_CODE = 'Y'
						)
						) SUB
				WHERE SUB.M_MOA_CODE='${martId}'
			 `;
        logger.writeLog("error", `${logBase} : ${sql}`);

      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async syncProduct(dataUpdate) {
    let logBase = `models/addressModel.syncProduct `;
    const connection = await pool.mysqlPool.getConnection(async (conn) => conn);
    await connection.beginTransaction();
    try {
      for (const data of dataUpdate) {
        let sql = `UPDATE TBL_MOA_PRD_MAIN
        SET P_NAME = '${data.P_NAME}' , P_TAGS = '${data.TAGS}', P_IMG = '${data.P_IMG}', P_SALE_PRICE = ${data.P_SALE_PRICE}
        , M_TIME = '${data.M_TIME}' WHERE SEQ = ${data.SEQ} `;
        logger.writeLog("info", `${logBase} ==> ${sql}`);

         await connection.query(sql);
      }
      await connection.commit();
      return 1;
    } catch (error) {
      await connection.rollback();
      logger.writeLog("error", `${logBase}  \nStacktrace: ${error.stack}`);
      return 0;
    } finally {
      connection.release();
    }
  }
  static async selectProductsRegistered(checkUseStock, dataConnect, prd_status, option_check_stock, stock_search_value, keyword_type, keyword_value, category_code , category_sub_code, date_start, date_end, product_no_image, product_only_brgn, sort_prd_stock, offset, limit) {
    let logBase = `models/productRegistedModel.selectProductsRegistered:`;
      try {
        let stringWhereIn = ''
        let stringWhereInSub = ''
        let stringSelectinSub = ' , 0 as STK_STOCK '
        let initialStock = 0
        let isUsingStock = 0

        //bắt đầu kiểm tra stock và thêm điều kiện
        if(!checkUseStock.IS_STOCK){
          initialStock = 0
          isUsingStock = 0
        }else{
          if(checkUseStock.IS_STOCK === 'Y'){
            // DÙNG STOCK
            initialStock =1
            stringWhereIn += ` LEFT JOIN TBL_MOA_STOCK_TOGETHERS AS TBSTOCK
            ON
            (
              TBSTOCK.M_MOA_CODE = SUB.M_MOA_CODE
              AND TBSTOCK.GOODS_CODE = SUB.P_CODE
            ) `
            stringWhereInSub += ` LEFT JOIN TBL_MOA_STOCK_TOGETHERS AS TBSTOCK
            ON
            (
              TBSTOCK.M_MOA_CODE = PM.M_MOA_CODE
              AND TBSTOCK.GOODS_CODE = PM.P_CODE
            ) `
            stringSelectinSub = ' ,IFNULL(TBSTOCK.STK_STOCK,0) as STK_STOCK '
            if(checkUseStock.IS_STOP_STOCK === 'Y'){
              isUsingStock = 0
              //DÙNG STOCK NHƯNG TẠM NGƯNG
            }else{
              //DÙNG STOCK
              isUsingStock = 1
            }
          }else{
            //KO DÙNG STOCK
            initialStock = 0
            isUsingStock = 0
          }
        }
        //kiểm tra stock và thêm điều kiện xong
        // tiến hành thêm điều kiện cho câu truy vấn với những param seach từ request
        let where =' WHERE 1=1 '
        let whereSub = '  WHERE 1=1 '
        let whereSearchUpDown = ''
        let whereSearchUpDownSub = ''

      if(isUsingStock === 1){
          if(prd_status && prd_status === 'O'){
            //O: out of stock status
            //C: DEACTIVE
            //A: ACTIVE
            where += ' AND (STK_STOCK < P_MIN_STOCK OR STK_STOCK < P_MIN_STOCK_DEFAULT)  '
          }
       //find with up : stock search  > stock of product
        if(option_check_stock !== "" && option_check_stock === 'U' && stock_search_value !== ""){
        whereSearchUpDown = ` AND STK_STOCK > ${stock_search_value} `
        whereSearchUpDownSub = ` AND TBSTOCK.STK_STOCK > ${stock_search_value} `
        }
        //find with down : stock search  < stock of product
        if(option_check_stock !== "" && option_check_stock === 'D' && stock_search_value !== ""){
        whereSearchUpDown = ` AND STK_STOCK < ${stock_search_value} `
        whereSearchUpDownSub = ` AND (TBSTOCK.STK_STOCK < ${stock_search_value} OR TBSTOCK.STK_STOCK IS NULL) `
        }
      }
      if(keyword_type && keyword_value){
        if(keyword_type === 'prd_code'){
          //search product code
          where += ` AND P_CODE = '${keyword_value}'  `
          whereSub +=  ` AND PM.P_CODE = '${keyword_value}'  `
        }else if (keyword_type === 'prd_barcode'){
          //search theo barcode
          where += ` AND P_BARCODE = '${keyword_value}'  `
          whereSub += ` AND PM.P_BARCODE = '${keyword_value}'  `
        }else if(keyword_type === 'prd_name'){
          //search theo product name
          where += ` AND P_NAME LIKE '%"${keyword_value}"%'  `
          whereSub += ` AND PM.P_NAME LIKE '%"${keyword_value}"%'  `
        } else if (keyword_type === 'prd_tags'){
          //search theo product tags
          where += ` AND P_TAGS LIKE '%"${keyword_value}"%'  `
          whereSub += ` AND PM.P_TAGS LIKE '%"${keyword_value}"%'  `
        } else if (keyword_type === 'provider'){
          //search theo nhà cung cấp
          where += ` AND P_PROVIDER LIKE '%"${keyword_value}"%'  `
          whereSub += ` AND PM.P_PROVIDER LIKE '%"${keyword_value}"%'  `
        }
      }
      if(dataConnect.M_MOA_CODE){
        // search theo  mart code
        where += `  AND M_MOA_CODE = '${dataConnect.M_MOA_CODE}' `
        whereSub += ` AND PM.M_MOA_CODE = '${dataConnect.M_MOA_CODE}' `
      }
      if(category_code ){
        // search theo số category code
        where += ` AND CTGRY_LARGE_NO = '${category_code}' `
        whereSub += ` AND (SELECT CTGRY_LARGE_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO 
        AND MART_SEQNO = MOG.MART_SEQNO LIMIT 1) = ${category_code} `
      }
      if(category_sub_code){
        //search theo số category sub code 
        where += ` AND SEQ_P_CAT = '${category_sub_code}'  `
        whereSub += ` AND (SELECT MC.CTGRY_SEQNO FROM  ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC WHERE MC.MART_SEQNO = MOG.MART_SEQNO 
        AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO)  =  ${category_sub_code}  `
      }
      if(prd_status && prd_status !== 'O'){
        //statuus != out of stock
        where += ` AND P_STATUS = '${prd_status}'  `
        whereSub += ` AND PM.P_STATUS = '${prd_status}'  `
      }else if(prd_status && prd_status === 'O'){
         //statuus == out of stock 
         //=>  lấy status = A bởi vì đã check product out of stock hay không ở những dòng code trên rồi
         where += ` AND P_STATUS = 'A'  `
         whereSub += ` AND PM.P_STATUS = 'A'  `
      }else{
        //khác deleted
        where += ` AND P_STATUS != 'D'  `
        whereSub += ` AND PM.P_STATUS != 'D'  `
      }
      // search product theo thời gian được tạo nằm giữa  date start và date end
      if(date_start){
        where += ` AND DATE_FORMAT(C_TIME , '%Y-%m-%d') >=  DATE_FORMAT('${date_start}' , '%Y-%m-%d')  `
        whereSub += ` AND DATE_FORMAT(PM.C_TIME , '%Y-%m-%d') >=  DATE_FORMAT('${date_start}' , '%Y-%m-%d')  `
      }
      if(date_end){
        where += ` AND DATE_FORMAT(C_TIME , '%Y-%m-%d') <=  DATE_FORMAT('${date_start}' , '%Y-%m-%d')  `
        whereSub += ` AND DATE_FORMAT(PM.C_TIME , '%Y-%m-%d') <=  DATE_FORMAT('${date_start}' , '%Y-%m-%d')  `
      }
      if(product_no_image && product_no_image === 'Y'){
        // search product nào có hình ảnh
        where += ` AND (P_IMG IS NOT NULL AND P_IMG != '[]')   `
        whereSub += ` AND  (PM.P_IMG IS NOT NULL AND PM.P_IMG != '[]')    `
      }
      if(product_no_image && product_no_image === 'N'){
        // search product nào không có hình ảnh
        where += ` AND (P_IMG IS  NULL AND P_IMG = '[]')   `
        whereSub += ` AND (PM.P_IMG IS  NULL AND PM.P_IMG ='[]')    `
      }
      if(product_only_brgn && product_only_brgn === 1){
        //search product nào đang có khuyến mãi
        where += " AND P_SALE_PRICE > 0 AND  (PRICE_CUSTOM_STATUS NOT IN ('A') OR PRICE_CUSTOM_STATUS IS NULL)  ";
        whereSub += " AND PM.P_SALE_PRICE > 0 AND  (PP.PS_STATUS NOT IN ('A') OR PP.PS_STATUS IS NULL)  ";
      }

      //merger whereSub và whereSearchUpDownSub (nếu có)
      let whereTotalSub = whereSub
      if(whereSearchUpDownSub !== ""){
        whereTotalSub += whereSearchUpDownSub
      }

      // thêm điều kiện order by
      let whereOrder = ""
      if(sort_prd_stock !== ""){
        if(sort_prd_stock === 'DESC'){
          whereOrder = ' ORDER BY STK_STOCK DESC '
        }
        if(sort_prd_stock === 'ASC'){
          whereOrder = ' ORDER BY STK_STOCK ASC '
        }
      }else{
        whereOrder = ' ORDER BY P_SALE_PRICE DESC, SEQ DESC '
      }
      // thêm điều kiện phân trang
      let whereLimit = ""
      if(offset && limit){
        whereLimit = ` LIMIT ${offset},${limit} `
      }



      const  sql = ` SELECT SUBL.*
      FROM (SELECT SUB.*,
              (SELECT MCL.CTGRY_NAME FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY MCL WHERE SUB.CTGRY_LARGE_NO = MCL.CTGRY_LARGE_NO AND SUB.M_POS_REGCODE = MCL.MART_SEQNO AND MCL.CTGRY_MEDIUM_NO = 0 AND MCL.CTGRY_SMALL_NO = 0 AND MCL.CTGRY_STATE = 1 LIMIT 1) AS P_CAT,
              (SELECT MCL.CTGRY_NAME FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY MCL WHERE SUB.CTGRY_LARGE_NO = MCL.CTGRY_LARGE_NO AND SUB.M_POS_REGCODE = MCL.MART_SEQNO AND MCL.CTGRY_MEDIUM_NO = SUB.CTGRY_MEDIUM_NO AND MCL.CTGRY_SMALL_NO = 0 AND MCL.CTGRY_STATE = 1 LIMIT 1) AS P_CAT_MID,
              CASE
                WHEN BRGN_STR IS NOT NULL THEN SUBSTRING_INDEX(SUBSTRING_INDEX(BRGN_STR, '|', 2), '|', - 1)
                ELSE NULL
              END P_SALE_PRICE,
              CASE
                WHEN BRGN_STR IS NOT NULL THEN SUBSTRING_INDEX(SUBSTRING_INDEX(BRGN_STR, '|', 3), '|', - 1)
                ELSE NULL
              END DSCNT_UNIT,
              CASE
                WHEN BRGN_STR IS NOT NULL THEN SUBSTRING_INDEX(SUBSTRING_INDEX(BRGN_STR, '|', 5), '|', - 1)
                ELSE NULL
              END BRGN_GROUP_SEQNO,
              CASE
                WHEN BRGN_STR IS NOT NULL THEN SUBSTRING_INDEX(SUBSTRING_INDEX(BRGN_STR, '|', 6), '|', - 1)
                ELSE NULL
              END BRGN_GROUP_NAME,
              CASE
                WHEN BRGN_STR IS NOT NULL THEN SUBSTRING_INDEX(SUBSTRING_INDEX(BRGN_STR, '|', 9), '|', - 1)
                ELSE NULL
                END BRGN_GROUP_STATUS,
              CONCAT(SUB.M_MOA_CODE, SUB.P_CODE, SUB.P_BARCODE) AS GPCODE
              FROM (SELECT
                  PM.SEQ AS SEQ,
                  PM.M_MOA_CODE AS M_MOA_CODE,
                  PM.M_POS_REGCODE AS M_POS_REGCODE,
                  PM.P_CODE AS P_CODE,
                  PM.P_BARCODE AS P_BARCODE,
                  P.PRVDR_NAME AS P_PROVIDER,
                  MOG.GOODS_NAME AS P_NAME,
                  PM.P_IMG AS P_IMG,
                  PM.P_TAGS AS P_TAGS,
                  PM.P_INV_TYPE AS P_INV_TYPE,
                  PM.P_USE_MAXQTY_BRGN,
                  PM.P_MAXQTY_BRGN,
                  PM.P_MAXQTY_BRGN_DEFAULT,
                  PM.P_USE_MAXQTY_PD,
                  PM.P_VALUE_MAXQTY_PD,
                  PM.P_USE_MINQTY_PD,
                  PM.P_VALUE_MINQTY_PD,
                  (SELECT CONCAT(IF(PUNIT.GOODS_STD IS NOT NULL, CONCAT(' ', PUNIT.GOODS_STD), ''), IF(PUNIT.EXTNS_UNIT_COUNT IS NOT NULL
                      AND PUNIT.EXTNS_UNIT_COUNT != ''
                      AND PUNIT.EXTNS_UNIT_COUNT > 1, CONCAT('*', PUNIT.EXTNS_UNIT_COUNT), ''), IF(PUNIT.EXTNS_UNIT IS NOT NULL
                      AND PUNIT.EXTNS_UNIT != '', CONCAT(' (', PUNIT.EXTNS_UNIT, ')'), '')) AS P_UNIT
                      FROM ${dataConnect.M_DB_CONNECT}.MART_ORDER_GOODS as PUNIT WHERE PUNIT.USE_YN = 'Y' AND PUNIT.MART_SEQNO = MOG.MART_SEQNO AND PUNIT.GOODS_CODE = MOG.GOODS_CODE AND PUNIT.BRCD = MOG.BRCD order by PUNIT.MART_ORDER_GOODS_SEQNO desc limit 1) AS P_UNIT,
                  PM.P_STATUS AS P_STATUS,
                  PM.C_TIME AS C_TIME,
                  PM.M_TIME AS M_TIME,
                  (SELECT EXPSR_PRICE FROM ${dataConnect.M_DB_CONNECT}.MART_ORDER_GOODS  WHERE USE_YN = 'Y' AND MART_SEQNO = MOG.MART_SEQNO AND GOODS_CODE = MOG.GOODS_CODE AND BRCD = MOG.BRCD order by MART_ORDER_GOODS_SEQNO desc limit 1) AS P_LIST_PRICE,
                  'POS SALE' AS SALE_SRC,
                  (${bargainQuery(dataConnect.M_DB_CONNECT)}) AS BRGN_STR,
                  (SELECT OB.BRGN_GROUP_NAME ${bargainQueryGetCol(dataConnect.M_DB_CONNECT)}) AS P_SALE_TITLE,
                  (SELECT CTGRY_LARGE_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO LIMIT 1) AS CTGRY_LARGE_NO,
                  (SELECT CTGRY_MEDIUM_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO LIMIT 1) AS CTGRY_MEDIUM_NO,
                  (SELECT MC.CTGRY_NAME FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO LIMIT 1) AS P_CAT_SUB,
                  (SELECT MC.CTGRY_SEQNO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO LIMIT 1) AS SEQ_P_CAT_SUB,
                  (SELECT P.PRVDR_NAME FROM ${dataConnect.M_DB_CONNECT}.PRVDR AS P WHERE P.MART_SEQNO = MOG.MART_SEQNO AND P.PRVDR_SEQNO = MOG.PRVDR_SEQNO AND P.PRVDR_STATE_CODE = 'Y' LIMIT 1) AS P_PRVDR_NAME,
                  PM.P_MIN_STOCK,
                  PM.P_MIN_STOCK_DEFAULT,
                  CASE
                    WHEN PM.C_ID = 'system' THEN 'System'
                    WHEN PM.C_ID <> ''
                      THEN (SELECT UA.U_NAME FROM moa_platform.TBL_MOA_USERS_ADMIN AS UA WHERE UA.U_ID = PM.C_ID)
                      ELSE ''
                      END C_NAME,
                  CASE
                    WHEN PM.M_ID = 'system' THEN 'System'
                    WHEN PM.M_ID <> ''
                      THEN (SELECT UA.U_NAME FROM moa_platform.TBL_MOA_USERS_ADMIN AS UA WHERE UA.U_ID = PM.M_ID)
                      ELSE ''
                      END M_NAME,
                  MOG.MART_ORDER_GOODS_SEQNO AS PR_SEQ,
                  MOG.INV_TYPE AS G_INV_TYPE,
                  PP.PS_TYPE as PRICE_TYPE,
                  PP.PS_TYPE_OPTION as PRICE_UP_DOWN,
                  PP.PS_NUM as PRICE_NUMBER,
                  PP.PS_STATUS as PRICE_CUSTOM_STATUS,
                  PP.USE_TIME,
                  PP.TIME_START,
                  PP.TIME_END
                    ${stringSelectinSub}
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
              ${stringWhereInSub}
              ${whereTotalSub} ${whereOrder} ${whereLimit} ) SUB) SUBL `;

      let sqlCount = ` SELECT COUNT(SUBL.SEQ) AS CNT
      FROM (SELECT SUB.* ${stringSelectinSub}
            FROM (SELECT SUB1.*,
                  CASE WHEN SUB1.BRGN_STR IS NOT NULL THEN SUBSTRING_INDEX(SUBSTRING_INDEX(SUB1.BRGN_STR, '|', 2), '|', -1) ELSE NULL END P_SALE_PRICE
                  FROM (SELECT
                          PM.SEQ AS SEQ,
                          PM.M_MOA_CODE AS M_MOA_CODE,
                          PM.M_POS_REGCODE AS M_POS_REGCODE,
                          PM.P_CODE AS P_CODE,
                          PM.P_BARCODE AS P_BARCODE,
                          P.PRVDR_NAME AS P_PROVIDER,
                          MOG.GOODS_NAME AS P_NAME,
                          PM.P_TAGS AS P_TAGS,
                          PM.P_IMG AS P_IMG,
                          (SELECT CTGRY_LARGE_NO FROM  ${dataConnect.M_DB_CONNECT}.MART_CTGRY WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO LIMIT 1) AS CTGRY_LARGE_NO,
                          (SELECT MC.CTGRY_SEQNO FROM  ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO LIMIT 1) AS SEQ_P_CAT_SUB,
                          PM.P_STATUS AS P_STATUS,
                          PM.C_TIME AS C_TIME,
                          PM.P_MIN_STOCK,
                          PM.P_MIN_STOCK_DEFAULT,
                          MOG.MART_ORDER_GOODS_SEQNO as PR_SEQ,
                          (${bargainQuery(dataConnect.M_DB_CONNECT)}) AS BRGN_STR,
                          PP.PS_STATUS as PRICE_CUSTOM_STATUS,
                          PP.USE_TIME,
                          PP.TIME_START,
                          PP.TIME_END
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
                        ${whereTotalSub}
                        GROUP BY CONCAT(PM.M_MOA_CODE, PM.P_CODE,PM.P_BARCODE)
                        ORDER BY PR_SEQ desc
                        ) SUB1
                      ) SUB ${stringWhereIn}
                  ) AS SUBL `
      logger.writeLog("error", `${logBase} : ${sql}`);
      if(where !== ""){
        sqlCount += where
      }
      if(whereSearchUpDown !== ""){
        sqlCount += whereSearchUpDown
      }
      const [rows] = await pool.mysqlPool.query(sql);

      const [rowsCount] = await pool.mysqlPool.query(sqlCount);
      return {rows : rows, search_count : rowsCount[0].CNT}

    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async selectProductByArraySeq(prd_seqs) {
    let logBase = `models/posModel.selectProductByArraySeq:`;
      try {
        const  sql = ` SELECT PM.* FROM TBL_MOA_PRD_MAIN AS PM WHERE PM.SEQ IN  (${prd_seqs}) `;

      logger.writeLog("info", `${logBase} : ${sql}`);

      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async viewDetailProduct(prd_seqs) {
    let logBase = `models/posModel.viewDetailProduct:`;
      try {
        const  sql = `  SELECT
        *
    FROM
        TBL_MOA_PRD_MAIN WHERE SEQ = '${prd_seqs}' LIMIT 1`;

      logger.writeLog("info", `${logBase} : ${sql}`);

      const [rows] = await pool.mysqlPool.query(sql);
      return rows[0]
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async searchProductImages(keyword, img_barcode, img_type, img_keyword, img_cate, dbConnect, posRegcode) {
    let logBase = `models/posModel.searchProductImages:`;
    try {
      let where = ` WHERE 1=1 `
      // img_keyword: search by 'tags' | 'name'
      if(keyword){
        if(img_keyword === 'tags'){
          where +=  ` AND TB2.IM_TAGS LIKE '%${keyword}%'  `
        }
        if(img_keyword === 'name'){
          where +=  ` AND TB2.IM_NAME LIKE '%${keyword}%'  `
        }
      }
      // img_barcode : 1 | 0  img use barcode
      if(img_barcode === 1){
        where += " AND TB2.IM_BARCODE  IS NOT NULL  "
      }else if (img_barcode == 0) {
        where += " AND TB2.IM_BARCODE IS NULL  ";
      }
      
      // img_type: all | main image | sub image
      if(img_type === 'main'){
        where += " AND TB2.IM_TYPE = 1  "
      }
      if (img_type == 'sub') {
        where += " AND TB2.IM_TYPE != 1  ";
      }
  
     // img_cate : number cate code of image
      let whereCate = ""
      if(img_cate){
        whereCate += ` AND TB1.CTGRY_LARGE_NO = ${img_Cate} `
      }

      
      let  sql = ``;
      if(img_cate){
        sql = `SELECT TB2.SEQ, TB2.IM_CODE, TB2.IM_NAME, TB2.IM_TYPE, TB2.IM_URI, TB1.CTGRY_LARGE_NO
        FROM
            (SELECT
                SUB.*
            FROM
                (SELECT
                    MOG.GOODS_CODE,
                    MOG.GOODS_NAME,
                    MOG.BRCD,
                    CONCAT(MOG.GOODS_CODE, MOG.GOODS_NAME, MOG.BRCD) AS PRDGROUP,
                    (SELECT CTGRY_LARGE_NO FROM ${dbConnect}.MART_CTGRY
                     WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO) AS CTGRY_LARGE_NO
            FROM ${dbConnect}.MART_ORDER_GOODS AS MOG
            JOIN ${dbConnect}.MART_CTGRY AS MMC ON MMC.CTGRY_SEQNO = MOG.CTGRY_SEQNO 
             AND MMC.MART_SEQNO = MOG.MART_SEQNO
            WHERE MOG.MART_SEQNO = '${posRegcode}' AND MOG.USE_YN = 'Y') SUB
            GROUP BY SUB.PRDGROUP) AS TB1
            RIGHT JOIN TBL_MOA_IMAGE_PRD AS TB2 ON TB1.BRCD = TB2.IM_BARCODE
            ${where} ${whereCate}   GROUP BY TB2.SEQ`
      }else{
        sql = `SELECT TB2.SEQ, TB2.IM_CODE, TB2.IM_NAME, TB2.IM_TYPE, TB2.IM_URI, NULL AS CTGRY_LARGE_NO
        FROM TBL_MOA_IMAGE_PRD AS TB2
        ${where} GROUP BY TB2.SEQ`
      }

      logger.writeLog("info", `${logBase} : ${sql}`);

      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }


  static async getArryCateOfImage(dbConnect, pos_regcode) {
    let logBase = `models/posModel.getArryCateOfImage:`;
      try {
        const  sql = ` SELECT TB1.CTGRY_LARGE_NO, (SELECT MCL.CTGRY_NAME FROM ${dbConnect}.MART_CTGRY MCL 
        WHERE TB1.CTGRY_LARGE_NO = MCL.CTGRY_LARGE_NO AND MCL.MART_SEQNO = '${pos_regcode}' 
        AND MCL.CTGRY_MEDIUM_NO = 0 AND MCL.CTGRY_SMALL_NO = 0 AND MCL.CTGRY_STATE = 1 LIMIT 1) AS P_CAT
        FROM (SELECT SUB.* FROM
        (SELECT MOG.GOODS_CODE, MOG.GOODS_NAME, MOG.BRCD, CONCAT(MOG.GOODS_CODE,MOG.GOODS_NAME,MOG.BRCD) AS PRDGROUP,
        (SELECT CTGRY_LARGE_NO FROM ${dbConnect}.MART_CTGRY
         WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO) AS CTGRY_LARGE_NO
        FROM ${dbConnect}.MART_ORDER_GOODS AS MOG JOIN ${dbConnect}.MART_CTGRY AS MMC ON MMC.CTGRY_SEQNO = MOG.CTGRY_SEQNO 
        AND MMC.MART_SEQNO = MOG.MART_SEQNO
        WHERE MOG.MART_SEQNO = '${pos_regcode}' 
        AND MOG.USE_YN='Y') SUB GROUP BY SUB.PRDGROUP) AS TB1
        JOIN TBL_MOA_IMAGE_PRD AS TB2 ON TB1.BRCD = TB2.IM_BARCODE 
        GROUP BY TB1.CTGRY_LARGE_NO `;

      logger.writeLog("info", `${logBase} : ${sql}`);

      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  
  
};
