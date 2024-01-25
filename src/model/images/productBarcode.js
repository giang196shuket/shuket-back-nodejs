const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");

module.exports = class productNoBarcodeModel {
 
  static async getListProductWithoutBarcode(limitQuery,  orderBy, keywordType, keywordValue, dateStart, dateEnd , status) {
    let logBase = `models/productNoBarcodeModel.getListProductWithoutBarcode`;
    
    try {
      let where = ' '
      if(keywordType === 'tags'){
        where +=  ` AND MIP.IM_TAGS LIKE '%${keywordValue}%'  `
      }
      if(keywordType === 'code'){
        where +=  ` AND MIP.IM_CODE LIKE '%${keywordValue}%'  `
      }
      if(keywordType === 'name'){
        where +=  ` AND MIP.IM_NAME LIKE '%${keywordValue}%'  `
      }
      if(dateEnd && dateStart){
        where += ` AND DATE_FORMAT(MIP.C_TIME, '%Y-%m-%d') >= DATE_FORMAT('${dateStart}', '%Y-%m-%d') 
        AND DATE_FORMAT(MIP.C_TIME, '%Y-%m-%d') <= DATE_FORMAT('${dateEnd}', '%Y-%m-%d') `
      }
      //status : all, image used,  image unused
      if(status === 'used'){
        where += ` AND MIP.IM_STATUS = "A" `
      }
      if(status === 'unused'){
        where += ` AND MIP.IM_STATUS = "C" `
      }

      if(orderBy !== 'oldest'){
        where += ` ORDER BY MIP.C_TIME DESC `
      }else if(orderBy === 'oldest'){
        where += ` ORDER BY MIP.C_TIME ASC `
      }


      let sql = ` SELECT
      MIP.IM_CODE AS code
      ,MIP.IM_NAME as name
      ,MIP.IM_URI as uri
      ,MIP.IM_UNIT as unit
      ,MIP.IM_TAGS as tags
      ,MIP.SEQ 
      ,MIP.IM_TYPE as type
      ,MIP.IM_PROVIDER as provider
      ,MIP.IM_BARCODE as barcode
      ,date_format(MIP.C_TIME, '%Y-%m-%d %H:%i') AS createdTime
      ,date_format(MIP.M_TIME, '%Y-%m-%d %H:%i') AS modifiedTime
      ,MIP.IM_STATUS as status
  FROM TBL_MOA_IMAGE_PRD MIP
      LEFT JOIN moa_platform.TBL_MOA_USERS_ADMIN CMUA
      ON CMUA.U_ID = MIP.C_ID
      LEFT JOIN moa_platform.TBL_MOA_USERS_ADMIN MMUA
      ON MMUA.U_ID = MIP.M_ID
  WHERE MIP.IM_BARCODE IS NOT NULL ${where}  ${limitQuery}`

  const sqlCount = ' SELECT COUNT(SEQ) AS CNT FROM moa_platform.TBL_MOA_IMAGE_PRD  WHERE IM_BARCODE IS NOT NULL'

  logger.writeLog("info", `${logBase} : ${sql}`);

      const [rows] = await pool.mysqlPool.query(sql);
      const [total] = await pool.mysqlPool.query(sqlCount);

      return {list: rows, total: total[0].CNT }
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
};
