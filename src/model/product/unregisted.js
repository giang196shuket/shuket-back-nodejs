const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");
const { escapeLikeStr } = require("../../helper/funtion");


module.exports = class productUnregistedModel {
    static async updateProductDuplicate(martCode){
       let logBase = `productUnregistedModel.updateProductDuplicate: `;
       try {
       let  sql = ` UPDATE TBL_MOA_PRD_MAIN SET P_STATUS = 'D'
       WHERE TBL_MOA_PRD_MAIN.SEQ IN (
       SELECT MIN(SEQ) as id_update from (SELECT datart.SEQ,datart.P_CODE, datart.P_STATUS, datart.M_MOA_CODE, datart.P_BARCODE
       FROM TBL_MOA_PRD_MAIN as datart
       WHERE datart.P_BARCODE in (SELECT conditiona.P_BARCODE FROM TBL_MOA_PRD_MAIN as  conditiona 
       WHERE conditiona.M_MOA_CODE= '${martCode}' AND conditiona.P_STATUS != 'D'
                       GROUP BY conditiona.P_CODE, conditiona.P_BARCODE
                       HAVING COUNT(*) > 1) AND datart.M_MOA_CODE= '${martCode}'  AND datart.P_STATUS != 'D'
       ORDER BY datart.P_CODE desc ) AS tbupdate
       WHERE M_MOA_CODE = '${martCode}'
       GROUP BY P_CODE )
       AND TBL_MOA_PRD_MAIN.SEQ > 0`;

       logger.writeLog("info", `${logBase} : ${sql}`);
       const [rows] = await pool.mysqlPool.query(sql);
       return rows.affectedRows
     } catch (error) {
       logger.writeLog("error", `${logBase} : ${error.stack}`);
       return 0
     }
   }
    static async insertProduct(row, martId, userId, prdImages, prdTags, time, defaultMinStock, useMaxBRGN, defaultMaxBRGN,
         isMaxQuantity, isMinQuantity, minQuantity, maxQuantity){
        let logBase = `productUnregistedModel.insertProduct: `;
        try {
        let  sql = ` INSERT INTO TBL_MOA_PRD_MAIN
         (M_MOA_CODE, M_POS_REGCODE, P_CODE, P_NAME, P_CAT_CODE, P_CAT, P_CAT_SEQNO, P_CAT_SUB, P_UNIT, P_BARCODE, P_LIST_PRICE,
         P_PROVIDER, P_IMG, P_TAGS, P_STATUS, C_TIME, C_ID, P_MIN_STOCK, P_MIN_STOCK_DEFAULT, P_USE_MAXQTY_BRGN, P_MAXQTY_BRGN,
         P_MAXQTY_BRGN_DEFAULT, P_USE_MAXQTY_PD, P_USE_MINQTY_PD, P_VALUE_MINQTY_PD, P_VALUE_MAXQTY_PD )
          VALUES  ('${martId}','${row.M_POS_REGCODE}','${row.P_CODE}','${row.P_NAME}','${row.P_CAT_CODE}','${row.P_CAT}'
          ,'${row.P_CAT_SEQNO}','${row.P_CAT_SUB}','${row.P_UNIT}','${row.BARCODE}','${row.P_LIST_PRICE}','${row.P_PROVIDER}'
          ,'${prdImages}','${prdTags}','A','${time}','${userId}','${defaultMinStock}','${defaultMinStock}','${useMaxBRGN}'
          ,'${defaultMaxBRGN}','${defaultMaxBRGN}','${isMaxQuantity}','${isMinQuantity}','${minQuantity}','${maxQuantity}')`;

        logger.writeLog("info", `${logBase} : ${sql}`);
        const [rows] = await pool.mysqlPool.query(sql);
        return rows.affectedRows
      } catch (error) {
        logger.writeLog("error", `${logBase} : ${error.stack}`);
        return 0
      }
    }
    static async selectProductsToInsert(dbConnect, posRegcode, key) {
        let logBase = `models/productUnregistedModel.selectProductsToInsert:`;
            try {  
             let sql = `  SELECT DBRT.*
             FROM
             (
                 SELECT
                 JA.MART_SEQNO AS M_POS_REGCODE,
                 JA.GOODS_CODE AS P_CODE,
                 JA.GOODS_NAME AS P_NAME,
                 JB.CTGRY_CODE AS P_CAT_CODE,
                 (
                     SELECT
                         CTGRY_NAME
                     FROM
                         ${dbConnect}.MART_CTGRY
                     WHERE
                         MART_SEQNO = '${posRegcode}'
                         AND CTGRY_LARGE_NO = JB.CTGRY_CODE
                         AND CTGRY_MEDIUM_NO = 0
                         AND CTGRY_SMALL_NO = 0
                         AND CTGRY_STATE = 1
                     LIMIT 1
                 ) AS P_CAT,
                 JB.CTGRY_SEQNO AS P_CAT_SEQNO,
                 JB.CTGRY_NAME AS P_CAT_SUB,
                 JA.GOODS_STD AS P_UNIT,
                 JA.BRCD AS BARCODE,
                 JA.MART_ORDER_GOODS_SEQNO AS MART_ORDER_GOODS_SEQNO,
                 JA.EXPSR_PRICE AS P_LIST_PRICE,
                 JA.UPDT_DTM AS M_TIME,
                 JC.PRVDR_NAME AS P_PROVIDER,
                 CONCAT(JA.MART_SEQNO, JA.GOODS_CODE,JA.BRCD) AS NAMEGRBY
             FROM
             (
                 (
                     SELECT
                         MOG.MART_SEQNO AS MART_SEQNO,
                         MOG.GOODS_CODE AS GOODS_CODE,
                         MOG.GOODS_NAME AS GOODS_NAME,
                         MOG.CTGRY_SEQNO AS CTGRY_SEQNO,
                         MOG.GOODS_STD AS GOODS_STD,
                         MOG.BRCD AS BRCD,
                         MOG.EXPSR_PRICE AS EXPSR_PRICE,
                         MOG.PRVDR_SEQNO AS PRVDR_SEQNO,
                         MOG.UPDT_DTM AS UPDT_DTM,
                         MOG.RGST_DTM AS RGST_DTM,
                         MOG.MART_ORDER_GOODS_SEQNO
                     FROM
                         ${dbConnect}.MART_ORDER_GOODS AS MOG
                     WHERE
                         MOG.MART_SEQNO = '${posRegcode}'
                         AND MOG.USE_YN = 'Y'
                 ) JA
                 LEFT JOIN
                 (
                     SELECT
                         MC.MART_SEQNO AS MART_SEQNO,
                         MC.CTGRY_LARGE_NO AS CTGRY_CODE,
                         MC.CTGRY_SEQNO AS CTGRY_SEQNO,
                         MC.CTGRY_NAME AS CTGRY_NAME
                     FROM
                         ${dbConnect}.MART_CTGRY AS MC
                     WHERE
                         MC.MART_SEQNO = '${posRegcode}'
                         AND MC.CTGRY_STATE = 1
                 ) JB ON(JA.CTGRY_SEQNO = JB.CTGRY_SEQNO)
                 LEFT JOIN
                 (
                     SELECT
                         P.MART_SEQNO AS MART_SEQNO,
                         P.PRVDR_SEQNO AS PRVDR_SEQNO,
                         P.PRVDR_NAME AS PRVDR_NAME
                     FROM
                         ${dbConnect}.PRVDR AS P
                     WHERE
                         P.MART_SEQNO = '${posRegcode}'
                         AND P.PRVDR_STATE_CODE = 'Y'
                 ) JC ON (JA.PRVDR_SEQNO = JC.PRVDR_SEQNO)
                 LEFT JOIN
                 moa_platform.TBL_MOA_PRD_MAIN AS MPM
                 ON
                 (
                     MPM.M_POS_REGCODE = JA.MART_SEQNO
                     AND MPM.P_CODE = JA.GOODS_CODE
                     AND MPM.P_BARCODE = JA.BRCD
                     AND MPM.P_STATUS = 'A'
                 )
             )`
    
             let where = ` WHERE 1=1 `
             if(key){
                where += ` AND CONCAT(JA.GOODS_CODE,JA.BRCD) IN ('${key}') `
             }
            where += ' AND MPM.P_CODE IS NULL AND MPM.P_BARCODE IS NULL ORDER BY JA.MART_ORDER_GOODS_SEQNO DESC ) AS DBRT  GROUP BY DBRT.NAMEGRBY '
             sql = sql + where
            logger.writeLog("info", `${logBase} : ${sql}`);
             
            const [rows] = await pool.mysqlPool.query(sql);
            return rows[0]
            } catch (error) {
                logger.writeLog("error", `${logBase} : ${error.stack}`);
                return null
            }
        }
    static async selectProductsUnregisteredList({page, limit, orderBy, keywordType, keywordValue , optionSearchImage , categorySubCode, categoryCode},dbConnect, posRegcode, limitQuery) {
    let logBase = `models/productUnregistedModel.selectProductsUnregisteredList:`;
        try {
         let where = ` WHERE MPM.P_STATUS IS NULL AND DBRT.M_POS_REGCODE = '${posRegcode}' `

         if(keywordType && keywordValue){
            if(keywordType === 'code'){
                where += ` AND MPM.P_CODE = '${keywordValue}' AND DBRT.P_CODE =  '${keywordValue}' `
            }else if(keywordType === 'name'){
                where += ` AND MPM.P_NAME LIKE '%${keywordValue}%'  AND DBRT.P_NAME LIKE '%${keywordValue}%' `
            }else if(keywordType === 'barcode'){
                where += ` AND MPM.P_BARCODE LIKE '%${keywordValue}%'  AND DBRT.BARCODE LIKE '%${keywordValue}%'  `
            }
         }
         if(keywordType && keywordValue){
            if(keywordType === 'code'){
                where += ` AND DBRT.P_CODE =  '${keywordValue}' `
            }else if(keywordType === 'name'){
                where += `  AND DBRT.P_NAME LIKE '%${keywordValue}%' `
            }else if(keywordType === 'barcode'){
                where += `   AND DBRT.BARCODE LIKE '%${keywordValue}%'  `
            }
         }
         if(categoryCode){
            where += ` AND DBRT.P_CATE_CODE = '${categoryCode}' `
         }
         if(categorySubCode){
            where += ` AND DBRT.P_CAT_SEQNO = '${categorySubCode}' `
         }
         where += `  GROUP BY DBRT.NAMEGRBY  `
         if(optionSearchImage && optionSearchImage === 'Y'){
            where += ` HAVING DBRT.IMG_CNT > 0  `
         }

         if(orderBy){
            if(orderBy === 'oldest'){
                where += 'ORDER BY DBRT.M_TIME ASC'
            }else if(orderBy === 'newest'){
                where += 'ORDER BY DBRT.M_TIME DESC'
            }
         }else{
            where += 'ORDER BY DBRT.M_TIME DESC, DBRT.P_NAME'
         }

         const sql = ` SELECT DBRT.*
         FROM
         (
             SELECT
                 JA.MART_SEQNO AS M_POS_REGCODE,
                 JA.GOODS_CODE AS P_CODE,
                 JA.GOODS_NAME AS P_NAME,
                 JB.CTGRY_CODE AS P_CAT_CODE,
                 (
                     SELECT
                         CTGRY_NAME
                     FROM
                     ${dbConnect}.MART_CTGRY
                     WHERE
                         MART_SEQNO = '${posRegcode}'
                         AND CTGRY_LARGE_NO = JB.CTGRY_CODE
                         AND CTGRY_MEDIUM_NO = 0
                         AND CTGRY_SMALL_NO = 0
                         AND CTGRY_STATE = 1
                     LIMIT 1
                 ) AS P_CAT,
                 JB.CTGRY_SEQNO AS P_CAT_SEQNO,
                 JB.CTGRY_NAME AS P_CAT_SUB,
                 CONCAT(
                                 IF(JA.GOODS_STD IS NOT NULL, CONCAT(' ',JA.GOODS_STD),''),
                                 IF(JA.EXTNS_UNIT_COUNT IS NOT NULL AND JA.EXTNS_UNIT_COUNT != '' 
                                 AND JA.EXTNS_UNIT_COUNT > 1, CONCAT('*',JA.EXTNS_UNIT_COUNT),''),
                                 IF(JA.EXTNS_UNIT IS NOT NULL AND JA.EXTNS_UNIT != '', CONCAT(' (',JA.EXTNS_UNIT,')'),'')
                             ) AS P_UNIT,
                 JA.BRCD AS BARCODE,
                 JA.EXPSR_PRICE AS P_LIST_PRICE,
                 JA.UPDT_DTM AS M_TIME,
                 JC.PRVDR_NAME AS P_PROVIDER,
                 (
                     SELECT
                         COUNT(MIP.SEQ)
                     FROM
                         moa_platform.TBL_MOA_IMAGE_PRD AS MIP
                     WHERE
                         MIP.IM_BARCODE = JA.BRCD AND MIP.IM_STATUS = 'A'
                 )  AS IMG_CNT,
                 CONCAT(JA.MART_SEQNO, JA.GOODS_CODE,JA.BRCD) AS NAMEGRBY
             FROM
             (
                 (
                     SELECT
                         MOG.MART_SEQNO AS MART_SEQNO,
                         MOG.GOODS_CODE AS GOODS_CODE,
                         MOG.GOODS_NAME AS GOODS_NAME,
                         MOG.CTGRY_SEQNO AS CTGRY_SEQNO,
                         MOG.GOODS_STD AS GOODS_STD,
                         MOG.BRCD AS BRCD,
                         MOG.EXPSR_PRICE AS EXPSR_PRICE,
                         MOG.PRVDR_SEQNO AS PRVDR_SEQNO,
                         MOG.UPDT_DTM AS UPDT_DTM,
                         MOG.RGST_DTM AS RGST_DTM,
                         MOG.EXTNS_UNIT_COUNT as EXTNS_UNIT_COUNT,
                         MOG.EXTNS_UNIT as EXTNS_UNIT,
                         (SELECT MC.CTGRY_NAME FROM ${dbConnect}.MART_CTGRY AS MC 
                         WHERE MC.MART_SEQNO = MOG.MART_SEQNO AND MC.CTGRY_SEQNO = MOG.CTGRY_SEQNO) AS P_CAT_SUB
                     FROM
                     ${dbConnect}.MART_ORDER_GOODS AS MOG
                     WHERE
                         MOG.MART_SEQNO = '${posRegcode}'
                         AND MOG.USE_YN = 'Y'
                 ) JA
                 LEFT JOIN
                 (
                     SELECT
                         MC.MART_SEQNO AS MART_SEQNO,
                         MC.CTGRY_LARGE_NO AS CTGRY_CODE,
                         MC.CTGRY_SEQNO AS CTGRY_SEQNO,
                         MC.CTGRY_NAME AS CTGRY_NAME
                     FROM
                     ${dbConnect}.MART_CTGRY AS MC
                     WHERE
                         MC.MART_SEQNO = '${posRegcode}'
                         AND MC.CTGRY_STATE = 1
                 ) JB ON(JA.CTGRY_SEQNO = JB.CTGRY_SEQNO)
                 LEFT JOIN
                 (
                     SELECT
                         P.MART_SEQNO AS MART_SEQNO,
                         P.PRVDR_SEQNO AS PRVDR_SEQNO,
                         P.PRVDR_NAME AS PRVDR_NAME
                     FROM
                         ${dbConnect}.PRVDR AS P
                     WHERE
                         P.MART_SEQNO = '${posRegcode}'
                         AND P.PRVDR_STATE_CODE = 'Y'
                 ) JC ON (JA.PRVDR_SEQNO = JC.PRVDR_SEQNO)
             ) GROUP BY CONCAT(JA.MART_SEQNO, JA.GOODS_CODE,JA.BRCD)
         ) AS DBRT
         LEFT JOIN moa_platform.TBL_MOA_PRD_MAIN   AS MPM ON MPM.M_POS_REGCODE = DBRT.M_POS_REGCODE 
         AND MPM.P_BARCODE = DBRT.BARCODE AND MPM.P_CODE = DBRT.P_CODE ${where} ${limitQuery}`

    
        logger.writeLog("info", `${logBase} : ${sql}`);
    
        const [rows] = await pool.mysqlPool.query(sql);
        return rows
        } catch (error) {
            logger.writeLog("error", `${logBase} : ${error.stack}`);
            return null
        }
    }
    // static async selectProductsUnregisteredDetail({ barcode, code, name, posRegcode}) {
    //     let logBase = `models/productUnregistedModel.selectProductsUnregisteredDetail:`;
    //         try {
    //          let where = ` WHERE MPM.P_CODE IS NULL AND MPM.P_BARCODE IS NULL `
    
    //          if(code){
    //             where += ` AND JA.GOODS_CODE = '${escapeLikeStr(code)}'`
    //          }
    //          if(name){
    //             where += ` AND JA.GOODS_NAME = '${name}'`
    //          }
    //          if(barcode){
    //             where += ` AND JA.BRCD = '${escapeLikeStr(barcode)}'`
    //          }
    //         //  if(categoryCode){
    //         //     where += ` AND JA.CTGRY_CODE = '${categoryCode}'`
    //         //  }
    //         //  if(categorySubCode){
    //         //     where += ` AND JA.CTGRY_SEQNO = '${categorySubCode}'`
    //         //  }

    //          let sql = ` SELECT
    //          JA.MART_SEQNO AS M_POS_REGCODE,
    //          JA.GOODS_CODE AS P_CODE,
    //          JA.GOODS_NAME AS P_NAME,
    //          JB.CTGRY_CODE AS P_CAT_CODE,
    //          (
    //              SELECT
    //                  CTGRY_NAME
    //              FROM
    //                  GROUP_MAIN.MART_CTGRY
    //              WHERE
    //                  MART_SEQNO = '${posRegcode}'
    //                  AND CTGRY_LARGE_NO = JB.CTGRY_CODE
    //                  AND CTGRY_MEDIUM_NO = 0
    //                  AND CTGRY_SMALL_NO = 0
    //                  AND CTGRY_STATE = 1
    //              LIMIT 1
    //          ) AS P_CAT,
    //          JB.CTGRY_SEQNO AS P_CAT_SEQNO,
    //          JB.CTGRY_NAME AS P_CAT_SUB,
    //          JA.GOODS_STD AS P_UNIT,
    //          JA.BRCD AS BARCODE,
    //          JA.EXPSR_PRICE AS P_LIST_PRICE,
    //          JA.UPDT_DTM AS M_TIME,
    //          JC.PRVDR_NAME AS P_PROVIDER
    //      FROM
    //      (
    //          (
    //              SELECT
    //                  MOG.MART_SEQNO AS MART_SEQNO,
    //                  MOG.GOODS_CODE AS GOODS_CODE,
    //                  MOG.GOODS_NAME AS GOODS_NAME,
    //                  MOG.CTGRY_SEQNO AS CTGRY_SEQNO,
    //                  MOG.GOODS_STD AS GOODS_STD,
    //                  MOG.BRCD AS BRCD,
    //                  MOG.EXPSR_PRICE AS EXPSR_PRICE,
    //                  MOG.PRVDR_SEQNO AS PRVDR_SEQNO,
    //                  MOG.UPDT_DTM AS UPDT_DTM,
    //                  MOG.RGST_DTM AS RGST_DTM
    //              FROM
    //                  GROUP_MAIN.MART_ORDER_GOODS AS MOG
    //              WHERE
    //                  MOG.MART_SEQNO = '${posRegcode}'
    //                  AND MOG.USE_YN = 'Y'
    //          ) JA
    //          LEFT JOIN
    //          (
    //              SELECT
    //                  MC.MART_SEQNO AS MART_SEQNO,
    //                  MC.CTGRY_LARGE_NO AS CTGRY_CODE,
    //                  MC.CTGRY_SEQNO AS CTGRY_SEQNO,
    //                  MC.CTGRY_NAME AS CTGRY_NAME
    //              FROM
    //                  GROUP_MAIN.MART_CTGRY AS MC
    //              WHERE
    //                  MC.MART_SEQNO = '${posRegcode}'
    //                  AND MC.CTGRY_STATE = 1
    //          ) JB ON(JA.CTGRY_SEQNO = JB.CTGRY_SEQNO)
    //          LEFT JOIN
    //          (
    //              SELECT
    //                  P.MART_SEQNO AS MART_SEQNO,
    //                  P.PRVDR_SEQNO AS PRVDR_SEQNO,
    //                  P.PRVDR_NAME AS PRVDR_NAME
    //              FROM
    //                  GROUP_MAIN.PRVDR AS P
    //              WHERE
    //                  P.MART_SEQNO = '${posRegcode}'
    //                  AND P.PRVDR_STATE_CODE = 'Y'
    //          ) JC ON (JA.PRVDR_SEQNO = JC.PRVDR_SEQNO)
    //          LEFT JOIN
    //          moa_platform.TBL_MOA_PRD_MAIN AS MPM
    //          ON
    //          (
    //              MPM.M_POS_REGCODE = JA.MART_SEQNO
    //              AND MPM.P_CODE = JA.GOODS_CODE
    //              AND MPM.P_BARCODE = JA.BRCD
    //              AND MPM.P_STATUS = 'A'
    //          )
    //      )`
    //          sql = sql + where + ' ORDER BY JA.UPDT_DTM DESC LIMIT 1 '
    //         logger.writeLog("info", `${logBase} : ${sql}`);
        
    //         const [rows] = await pool.mysqlPool.query(sql);
    //         return rows[0]
    //         } catch (error) {
    //             logger.writeLog("error", `${logBase} : ${error.stack}`);
    //             return null
    //         }
    // }
    static async selectPrdoductRegisteredByCode({ barcode, code, name, martCode}) {
        let logBase = `models/productUnregistedModel.selectPrdoductRegisteredByCode:`;
            try {

             let sql = `  SELECT *  FROM
             TBL_MOA_PRD_MAIN AS PM
         WHERE
             PM.M_MOA_CODE = '${martCode}' AND PM.P_CODE = '${code}'`
            
             if(barcode){
                sql = sql + ` AND PM.P_BARCODE = '${barcode}' `
             }
             if(name){
                sql = sql + ` AND PM.P_NAME = '${name}' `
             }

            logger.writeLog("info", `${logBase} : ${sql}`);
        
            const [rows] = await pool.mysqlPool.query(sql);
            return rows[0]
            } catch (error) {
                logger.writeLog("error", `${logBase} : ${error.stack}`);
                return null
            }
    }
    
};
