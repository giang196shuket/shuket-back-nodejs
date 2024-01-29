const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");

module.exports = class addressModel {
  static async getMartDeliveryAddressList(
    limitQuery,
    keywordType,
    keywordValue,
    martId
  ) {
    let logBase = `models/addressModel.getMartDeliveryAddressList:`;
    try {
      let where = "";
      if (keywordType === "zone") {
        where += ` AND ZONE_NO LIKE '%"${keywordValue}"%'`;
      }
      if (keywordType === "province") {
        where += ` AND PROVINCE LIKE '%"${keywordValue}"%'`;
      }
      if (keywordType === "city") {
        where += ` AND CITY LIKE '%"${keywordValue}"%'`;
      }
      if (keywordType === "address") {
        where += ` AND ADDRESS_NAME LIKE '%"${keywordValue}"%' OR ADDRESS_NAME2 LIKE '%"${keywordValue}"%'`;
      }
      const sql = ` SELECT * FROM (SELECT SEQ as seq,ADDRESS_NAME as address_name,ADDRESS_NAME2 as road_address_name,PROVINCE as region_1depth_name,CITY as region_2depth_name,
            ZONE_NO as zone_no,SETTING_FEE as delivery_fee, 'MART' as type, TIME_SET_DEFAULT_DELIVERY as time_reset,MAP_KAKAO_ID,C_TIME
            FROM moa_platform.TBL_MOA_MART_DELI_ADDRESS
            WHERE STATUS='A' AND M_MOA_CODE='${martId}' ${where}
            ) AS TBAFTER GROUP BY TBAFTER.MAP_KAKAO_ID  ORDER BY TBAFTER.SEQ DESC ${limitQuery}`;

      logger.writeLog("info", `${logBase} : ${sql}`);

      const [rows] = await pool.mysqlPool.query(sql);
      return rows;
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
  static async getAmountAndTimeDeliveryOfMart(martId) {
    let logBase = `models/addressModel.getAmountAndTimeDeliveryOfMart:`;
    const sql = `SELECT 
      IS_QUICK_DELIVERY,DEFAULT_NORMAL_DELIVERY,DEFAULT_QUICK_DELIVERY,USE_DELIVERY_ADDRESS,IS_FREE_DELIVERY,FREE_DELIVERY_AMOUNT,PRODUCT_DELIVERY,
      TIME_SET_DEFAULT_DELIVERY,IS_QUICK_DELIVERY
      FROM TBL_MOA_MART_BASIC AS MB
      JOIN TBL_MOA_MART_CONFIG AS MC ON MB.M_MOA_CODE = MC.M_MOA_CODE
      where MB.M_STATUS='A' AND MB.M_MOA_CODE = '${martId}' `;

    logger.writeLog("info", `${logBase} : ${sql}`);

    const [rows] = await pool.mysqlPool.query(sql);
    return rows[0];
  }
  catch(error) {
    logger.writeLog("error", `${logBase} : ${error.stack}`);
    return null;
  }
  static async getListDeliveryFee() {
    let logBase = `models/addressModel.getListDeliveryFee:`;
    const sql = `SELECT
        C_CODE, C_KO, C_ENG,C_DESC
    FROM TBL_MOA_CODE_COMMON
    WHERE C_GRP = 'DL'
    ORDER BY C_ORDER ASC`;

    logger.writeLog("info", `${logBase} : ${sql}`);

    const [rows] = await pool.mysqlPool.query(sql);
    return rows;
  }
  catch(error) {
    logger.writeLog("error", `${logBase} : ${error.stack}`);
    return null;
  }
  static async checkAddressExist(itemData, martId) {
    let logBase = `models/addressModel.checkAddressExist:`;
    const sql = `SELECT SEQ FROM TBL_MOA_MART_DELI_ADDRESS WHERE  ADDRESS_NAME = '${itemData.ADDRESS_NAME}' 
          AND  ADDRESS_NAME2 = '${itemData.ADDRESS_NAME2}' 
          AND  BUILDING_NAME = '${itemData.BUILDING_NAME}' 
          AND  MAIN_BUILDING_NO = '${itemData.MAIN_BUILDING_NO}' 
          AND  PROVINCE = '${itemData.PROVINCE}' 
          AND  CITY = '${itemData.CITY}' 
          AND  WARD = '${itemData.WARD} 
          AND  ROAD_NAME = ${itemData.ROAD_NAME}' 
          AND  SUB_BUILDING_NO = '${itemData.SUB_BUILDING_NO}' 
          AND  ZONE_NO = '${itemData.ZONE_NO}' 
          AND  ADDRESS_X = '${itemData.ADDRESS_X}' 
          AND  ADDRESS_Y = '${itemData.ADDRESS_Y}' 
          AND  PLACE_URL = '${itemData.PLACE_URL}' 
          AND  ADDRESS_NAME = '${itemData.ADDRESS_NAME} '
          AND  ADDRESS_X = '${itemData.ADDRESS_X}' 
          AND  MAP_KAKAO_ID = '${itemData.MAP_KAKAO_ID}' 
          AND  STATUS = 'A'
          AND  M_MOA_CODE = '${martId}'`;

    logger.writeLog("info", `${logBase} : ${sql}`);

    const [rows] = await pool.mysqlPool.query(sql);
    return rows;
  }
  catch(error) {
    logger.writeLog("error", `${logBase} : ${error.stack}`);
    return null;
  }
  static async insertAddress(insertDataAddress) {
    let logBase = `models/addressModel.insertAddress `;
    const connection = await pool.mysqlPool.getConnection(async (conn) => conn);
    await connection.beginTransaction();
    try {
      for (const data of insertDataAddress) {
        let sql = `INSERT INTO TBL_MOA_MART_DELI_ADDRESS
        (ADDRESS_NAME, ADDRESS_NAME2, BUILDING_NAME, MAIN_BUILDING_NO, PROVINCE, CITY, WARD, 
          ROAD_NAME, SUB_BUILDING_NO, ZONE_NO, ADDRESS_X, ADDRESS_Y, PLACE_URL, MAP_KAKAO_ID,
          SETTING_FEE, STATUS, C_TIME, C_ID, M_MOA_CODE) 
    VALUE 
        ('${data.ADDRESS_NAME}', '${data.ADDRESS_NAME2}' , '${data.BUILDING_NAME}' , '${data.MAIN_BUILDING_NO}' , 
        '${data.PROVINCE}' , '${data.CITY}' ,  '${data.WARD}',  '${data.ROAD_NAME}',  '${data.SUB_BUILDING_NO}',  '${data.ZONE_NO}',
        '${data.ADDRESS_X}','${data.ADDRESS_Y}','${data.PLACE_URL}','${data.MAP_KAKAO_ID}','${data.SETTING_FEE}',
        '${data.STATUS}','${data.C_TIME}','${data.C_ID}','${data.M_MOA_CODE}' )`;
         await connection.query(sql);
        logger.writeLog("info", `${logBase} ==> ${sql}`);

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
};
