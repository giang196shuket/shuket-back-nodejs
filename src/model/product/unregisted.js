const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");


module.exports = class productUnregistedModel {
    static async selectProductsUnregistered({page, limit, orderBy, keywordType, keywordValue , allImageBarcode , categorySubCode, categoryCode},dbConnect, posRegcode, limitQuery) {
    let logBase = `models/productUnregistedModel.selectProductsUnregistered:`;
        try {
         let where = " WHERE 1=1 "
         if(keywordType && keywordValue){
            if(keywordType === 'code'){
                where += ` AND MPM.P_CODE = '${keywordValue}' AND DBRT.P_CODE =  '${keywordValue}' `
            }else if(keywordType === 'name'){
                where += ` AND MPM.P_NAME LIKE '%${keywordValue}%'  AND DBRT.P_NAME LIKE '%${keywordValue}%' `
            }else if(keywordType === 'barcode'){
                where += ` AND MPM.P_BARCODE LIKE '%${keywordValue}%'  AND DBRT.BARCODE LIKE '%${keywordValue}%'  `
            }
         }
         if(categoryCode){
            where += ` AND DBRT.P_CATE_CODE = '${categoryCode}' `
         }
         if(categorySubCode){
            where += ` AND DBRT.P_CAT_SEQNO = '${categorySubCode}' `
         }
         where += ` AND MPM.P_STATUS is null AND DBRT.M_POS_REGCODE = '${posRegcode}'  GROUP BY DBRT.NAMEGRBY  HAVING DBRT.IMG_CNT > 0 `

         if(orderBy){
            if(orderBy === 'oldest'){
                where += 'ORDER BY DBRT.M_TIME ASC'
            }else if(orderBy === 'newest'){
                where += 'ORDER BY DBRT.M_TIME DESC'
            }
         }else{
            where += 'ORDER BY DBRT.M_TIME DESC, DBRT.P_NAME'
         }

         const sql = `SELECT DBRT.*
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

    
};
