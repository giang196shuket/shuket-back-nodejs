const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");
const { bargainQueryGetCol, bargainQuery } = require("./common");

module.exports = class productInventoryModel {
  static async selectProductInventory(
    checkUseStock,
    dataConnect,
    status,
    {
      appStopSaleProduct,
      categoryCode,
      categorySubCode,
      defaultStock,
      initalStock,
      isUsingStock,
      optionCheckStock,
      stockSearchValue,
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
      let initialStock = 0;
      let isUsingStock = 0;

      //bắt đầu kiểm tra stock và thêm điều kiện
      if (!checkUseStock.IS_STOCK) {
        initialStock = 0;
        isUsingStock = 0;
      } else {
        if (checkUseStock.IS_STOCK === "Y") {
          // DÙNG STOCK
          initialStock = 1;       
          if (checkUseStock.IS_STOP_STOCK === "Y") {
            isUsingStock = 0;
            //DÙNG STOCK NHƯNG TẠM NGƯNG
          } else {
            //DÙNG STOCK
            isUsingStock = 1;
          }
        } else {
          //KO DÙNG STOCK
          initialStock = 0;
          isUsingStock = 0;
        }
      }
      //kiểm tra stock và thêm điều kiện xong
      // tiến hành thêm điều kiện cho câu truy vấn với những param seach từ request
      let where = " WHERE 1=1 ";
      let stringWhereIn = "";

      if (isUsingStock === 1) {
        if (status && status === "O") {
          //O: out of stock status
          //C: DEACTIVE
          //A: ACTIVE
          where +=
            " AND (STK_STOCK < P_MIN_STOCK OR STK_STOCK < P_MIN_STOCK_DEFAULT)  ";
        }
        //find with up : stock search  > stock of product
        if (
          optionCheckStock !== "" &&
          optionCheckStock === "U" &&
          stockSearchValue !== ""
        ) {
            stringWhereIn = ` AND STK_STOCK > ${stockSearchValue} `;
        }
        //find with down : stock search  < stock of product
        if (
            optionCheckStock !== "" &&
            optionCheckStock === "D" &&
            stockSearchValue !== ""
        ) {
            stringWhereIn = ` AND STK_STOCK < ${stockSearchValue} `;
        }
      }
      if(appStopSaleProduct){
        // find product đã hết hàng
        where += `AND (STK_STOCK < P_MIN_STOCK OR STK_STOCK < P_MIN_STOCK_DEFAULT) AND P_LIST_PRICE > 0  `
      }
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

      const sql = ` SELECT SUB.*,
      (
        SELECT MCL.CTGRY_NAME
        FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY MCL
        WHERE SUB.CTGRY_LARGE_NO = MCL.CTGRY_LARGE_NO
        AND SUB.M_POS_REGCODE = MCL.MART_SEQNO
        AND MCL.CTGRY_MEDIUM_NO = 0
          AND MCL.CTGRY_SMALL_NO = 0
          AND MCL.CTGRY_STATE = 1
      ) AS P_CAT,
      (
        SELECT MCL.CTGRY_NAME
        FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY MCL
        WHERE SUB.CTGRY_LARGE_NO = MCL.CTGRY_LARGE_NO
        AND SUB.M_POS_REGCODE = MCL.MART_SEQNO
        AND MCL.CTGRY_MEDIUM_NO = SUB.CTGRY_MEDIUM_NO
          AND MCL.CTGRY_SMALL_NO = 0
          AND MCL.CTGRY_STATE = 1
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
    FROM (SELECT PM.SEQ AS SEQ,
            PM.M_MOA_CODE AS M_MOA_CODE,
            PM.M_POS_REGCODE AS M_POS_REGCODE,
            PM.P_CODE AS P_CODE,
            PM.P_BARCODE AS P_BARCODE,
            P.PRVDR_NAME AS P_PROVIDER,
            PM.P_NAME AS P_NAME,
            PM.P_IMG AS P_IMG,
            PM.P_TAGS AS P_TAGS,
            IFNULL((select RTN.M_TIME from (select TBSTOCK.M_TIME,TBSTOCK.GOODS_CODE,TBSTOCK.M_MOA_CODE 
                from TBL_MOA_STOCK_TOGETHERS AS TBSTOCK
                INNER  join TBL_MOA_PRD_MAIN AS PM2
                ON
                (
                  TBSTOCK.M_MOA_CODE = PM2.M_MOA_CODE
                  AND TBSTOCK.GOODS_CODE = PM2.P_CODE
                )
                WHERE TBSTOCK.M_MOA_CODE = '${dataConnect.M_MOA_CODE}'
                group by CONCAT(TBSTOCK.GOODS_CODE,TBSTOCK.M_MOA_CODE)) AS RTN
                WHERE RTN.GOODS_CODE = PM.P_CODE AND RTN.M_MOA_CODE = PM.M_MOA_CODE
            ),'') as TIME_STOCK,
            PM.P_INV_TYPE as P_INV_TYPE,
            CONCAT(
                IF(MOG.GOODS_STD IS NOT NULL, CONCAT(' ',MOG.GOODS_STD),''),
                IF(MOG.EXTNS_UNIT_COUNT IS NOT NULL AND MOG.EXTNS_UNIT_COUNT != '' 
                AND MOG.EXTNS_UNIT_COUNT > 1, CONCAT('*',MOG.EXTNS_UNIT_COUNT),''),
                IF(MOG.EXTNS_UNIT IS NOT NULL AND MOG.EXTNS_UNIT != '', CONCAT(' (',MOG.EXTNS_UNIT,')'),'')
            ) AS P_UNIT,
            PM.P_STATUS AS P_STATUS,
            PM.C_TIME AS C_TIME,
            PM.M_TIME AS M_TIME,
            MOG.EXPSR_PRICE AS P_LIST_PRICE,
            'POS SALE' AS SALE_SRC,
            (${bargainQuery(dataConnect.M_DB_CONNECT)}) AS BRGN_STR,
            (SELECT OB.BRGN_GROUP_NAME  ${bargainQueryGetCol(dataConnect.M_DB_CONNECT)}) AS P_SALE_TITLE,
            (SELECT CTGRY_LARGE_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY 
                WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO LIMIT 1) AS CTGRY_LARGE_NO,
            (SELECT CTGRY_MEDIUM_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY 
                WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO LIMIT 1) AS CTGRY_MEDIUM_NO,
            (SELECT MC.CTGRY_NAME FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC 
                WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO LIMIT 1) AS P_CAT_SUB,
            (SELECT MC.CTGRY_SEQNO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC 
                WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO LIMIT 1) AS SEQ_P_CAT_SUB,
            (SELECT P.PRVDR_NAME FROM ${dataConnect.M_DB_CONNECT}.PRVDR AS P 
                WHERE P.MART_SEQNO = MOG.MART_SEQNO AND P.PRVDR_SEQNO = MOG.PRVDR_SEQNO AND P.PRVDR_STATE_CODE='Y' LIMIT 1) AS P_PRVDR_NAME,
            PM.P_MIN_STOCK,
            PM.P_MIN_STOCK_DEFAULT,
            CASE
              WHEN PM.C_ID = 'system' THEN 'System'
              WHEN PM.C_ID <> '' THEN (SELECT UA.U_NAME FROM moa_platform.TBL_MOA_USERS_ADMIN AS UA WHERE UA.U_ID = PM.C_ID)
              ELSE ''
            END C_NAME,
            CASE
              WHEN PM.M_ID = 'system' THEN 'System'
              WHEN PM.M_ID <> '' THEN (SELECT UA.U_NAME FROM moa_platform.TBL_MOA_USERS_ADMIN AS UA WHERE UA.U_ID = PM.M_ID)
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
            IFNULL((select RTN.STK_STOCK from (select TBSTOCK.STK_STOCK,TBSTOCK.GOODS_CODE,TBSTOCK.M_MOA_CODE 
                from TBL_MOA_STOCK_TOGETHERS AS TBSTOCK
                INNER  join TBL_MOA_PRD_MAIN AS PM2
                ON
                (
                  TBSTOCK.M_MOA_CODE = PM2.M_MOA_CODE
                  AND TBSTOCK.GOODS_CODE = PM2.P_CODE
                )
                WHERE TBSTOCK.M_MOA_CODE = '${dataConnect.M_MOA_CODE}'
                group by CONCAT(TBSTOCK.GOODS_CODE,TBSTOCK.M_MOA_CODE)) AS RTN
                WHERE RTN.GOODS_CODE = PM.P_CODE AND RTN.M_MOA_CODE = PM.M_MOA_CODE
            ),0) as STK_STOCK
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
                ) SUB  
                ${where} ${stringWhereIn} ${whereOrder} ${whereLimit} `;

      let sqlCount = ` SELECT COUNT(SUB.SEQ) AS CNT
      FROM (SELECT SUB1.*,CONCAT(SUB1.M_MOA_CODE, SUB1.P_CODE,SUB1.P_BARCODE) AS GPCODE
            FROM (SELECT PM.SEQ AS SEQ,
                    PM.M_MOA_CODE AS M_MOA_CODE,
                    PM.M_POS_REGCODE AS M_POS_REGCODE,
                    PM.P_CODE AS P_CODE,
                    PM.P_BARCODE AS P_BARCODE,
                    P.PRVDR_NAME AS P_PROVIDER,
                    PM.P_NAME AS P_NAME,
                    PM.P_IMG AS P_IMG,
                    PM.P_TAGS AS P_TAGS,
                    (SELECT CTGRY_LARGE_NO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY 
                        WHERE CTGRY_SEQNO = MOG.CTGRY_SEQNO AND MART_SEQNO = MOG.MART_SEQNO LIMIT 1) AS CTGRY_LARGE_NO,
                    (SELECT MC.CTGRY_NAME FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC 
                        WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO LIMIT 1) AS P_CAT_SUB,
                    (SELECT MC.CTGRY_SEQNO FROM ${dataConnect.M_DB_CONNECT}.MART_CTGRY AS MC 
                        WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO LIMIT 1) AS SEQ_P_CAT_SUB,
                    (SELECT P.PRVDR_NAME FROM ${dataConnect.M_DB_CONNECT}.PRVDR AS P 
                        WHERE P.MART_SEQNO = MOG.MART_SEQNO AND P.PRVDR_SEQNO = MOG.PRVDR_SEQNO AND P.PRVDR_STATE_CODE='Y' LIMIT 1) AS P_PRVDR_NAME,
                    PM.P_STATUS AS P_STATUS,
                    PM.C_TIME AS C_TIME,
                    PM.P_MIN_STOCK,
                    PM.P_MIN_STOCK_DEFAULT,
                    MOG.MART_ORDER_GOODS_SEQNO as PR_SEQ,
                    MOG.EXPSR_PRICE AS P_LIST_PRICE,
                    IFNULL((select RTN.M_TIME from (select TBSTOCK.M_TIME,TBSTOCK.GOODS_CODE,TBSTOCK.M_MOA_CODE 
                        from TBL_MOA_STOCK_TOGETHERS AS TBSTOCK
                        INNER  join TBL_MOA_PRD_MAIN AS PM2
                        ON
                        (
                          TBSTOCK.M_MOA_CODE = PM2.M_MOA_CODE
                          AND TBSTOCK.GOODS_CODE = PM2.P_CODE
                        )
                        WHERE TBSTOCK.M_MOA_CODE = '${dataConnect.M_MOA_CODE}'
                        group by CONCAT(TBSTOCK.GOODS_CODE,TBSTOCK.M_MOA_CODE)) AS RTN
                        WHERE RTN.GOODS_CODE = PM.P_CODE AND RTN.M_MOA_CODE = PM.M_MOA_CODE
                    ),'') as TIME_STOCK,
                    IFNULL((select RTN.STK_STOCK from (select TBSTOCK.STK_STOCK,TBSTOCK.GOODS_CODE,TBSTOCK.M_MOA_CODE 
                        from TBL_MOA_STOCK_TOGETHERS AS TBSTOCK
                        INNER  join TBL_MOA_PRD_MAIN AS PM2
                        ON
                        (
                          TBSTOCK.M_MOA_CODE = PM2.M_MOA_CODE
                          AND TBSTOCK.GOODS_CODE = PM2.P_CODE
                        )
                        WHERE TBSTOCK.M_MOA_CODE = '${dataConnect.M_MOA_CODE}'
                        group by CONCAT(TBSTOCK.GOODS_CODE,TBSTOCK.M_MOA_CODE)
                      ) AS RTN
                      WHERE RTN.GOODS_CODE = PM.P_CODE AND RTN.M_MOA_CODE = PM.M_MOA_CODE
                    ),0) as STK_STOCK
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
                  ORDER BY PR_SEQ desc
                ) SUB1
                WHERE SUB1.M_MOA_CODE = '${dataConnect.M_MOA_CODE}'
                GROUP BY GPCODE
        ) SUB  ${where} ${stringWhereIn} ${whereOrder} ${whereLimit}`;
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
