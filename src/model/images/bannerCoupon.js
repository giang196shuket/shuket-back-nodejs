const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");
const { generateBannerCodeForMart } = require("../../helper/upload");

module.exports = class imagesBannerCouponModel {
  static async getImages(
    limitQuery, orderBy, status, imageType, imageCategory, keywordType, keywordValue
  ) {
    let logBase = `models/imagesBannerCouponModel.getImages:`;
    try {
      let where = "";
      if (status) {
        //A : ACTIVE, C: DEACTIVE, D: DELETE
        where += ` AND MIC.CI_STATUS = '${status}'  AND MIC.CI_STATUS!='D' `;
      } else {
        where += ` AND MIC.CI_STATUS!='D' `;
      }
      if (imageType) {
        where += ` AND MIC.CI_TYPE = '${imageType}'  `;
      }
      if (keywordType) {
        //search theo tên image
        if (keywordType === "br_name" && keywordValue != "") {
          where += ` AND MIC.CI_NAME LIKE  '%"${keywordValue}"%'  `;
        }
        // search theo tên file của image
        if (keywordType === "ig_name" && keywordValue != "") {
          where += ` AND MIC.CI_FILE LIKE  '%"${keywordValue}"%'  `;
        }
      }
      if (imageCategory) {
        //search theo thể loại của image
        where += ` AND MIC.CI_THEME = '${imageCategory}'  `;
      }

      if (orderBy === "oldest") {
        //asc
        where += ` ORDER BY MIC.SEQ ASC `;
      } else if (orderBy === "newest") {
        //desc
        where += ` ORDER BY MIC.SEQ DESC `;
      } else {
        where += ` ORDER BY MIC.SEQ DESC `;
      }

      const sql = ` SELECT
        MIC.SEQ,
        MIC.CI_TYPE,
        MIC.CI_THEME,
        MCC.C_KO,
        MCC.C_ENG,
        MIC.CI_NAME,
        MIC.CI_URI,
        MIC.CI_FILE,
        MIC.CI_STATUS,
        MIC.C_TIME,
        MIC.M_TIME,
        IF(MIC.C_ID != 'SYSTEM', (SELECT U_NAME FROM TBL_MOA_USERS_ADMIN WHERE U_ID = MIC.C_ID), 'SYSTEM') AS C_ID,
        IF(MIC.M_ID != 'SYSTEM', (SELECT U_NAME FROM TBL_MOA_USERS_ADMIN WHERE U_ID = MIC.M_ID), 'SYSTEM') AS M_ID
        FROM
            TBL_MOA_IMAGES_COMMON MIC
                JOIN
            TBL_MOA_CODE_COMMON MCC ON MIC.CI_THEME = MCC.C_CODE AND MCC.C_USE ='Y'
        WHERE MIC.SEQ > 0  ${where}  ${limitQuery}`;

    logger.writeLog("info", `${logBase} : ${sql}`);
      const [rows] = await pool.mysqlPool.query(sql);

      return rows;
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
  
  static async getCateListData() {
    let logBase = `models/imagesBannerCouponModel.getCateListData:`;
      try {
        const  sql = ` SELECT C_CODE as cate_code,C_KO as cate_name, C_ENG as cate_name_en,
        CASE C_GRP
                WHEN 'BIT' THEN 'B'
                WHEN 'CIT' THEN 'C'
        END TYPE_IMAGE
    FROM TBL_MOA_CODE_COMMON
    WHERE C_USE = 'Y' AND (C_GRP = 'BIT' or C_GRP = 'CIT')
    ORDER BY C_ORDER asc `;
    logger.writeLog("info", `${logBase} : ${sql}`);

      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async addImageBannerCoupon(imageType, imageCate, imageName, imageUrl, imageFileName, imageStatus, cId) {
    let logBase = `models/imagesBannerCouponModel.addImageBannerCoupon`;
        try {
        let sql =  `INSERT INTO TBL_MOA_IMAGES_COMMON
        (CI_TYPE, CI_THEME, CI_NAME, CI_URI, CI_FILE, CI_STATUS, C_ID) 
    VALUE 
        ('${imageType}', '${imageCate}' , '${imageName}' , '${imageUrl}' , '${imageFileName}' , '${imageStatus}' ,  '${cId}' )`
        // logger.writeLog("info", `${logBase} ${sql}`);

        const [rows] = await  pool.mysqlPool.query(sql);
        return rows.insertId;
        } catch (error) {
          logger.writeLog("error", `${logBase}  \nStacktrace: ${error.stack}`);
          return 0
        } 
  }
  static async addImageBannerCouponForMart(listMart, cate, name, url , widthImage, heightImage, platform, status, cId) {
    let logBase = `models/imagesBannerCouponModel.addImageBannerCouponForMart`;
    const connection = await pool.mysqlPool.getConnection(async (conn) => conn);
    await connection.beginTransaction();

        try {
          for (const mart of listMart) {
            const code = generateBannerCodeForMart()
            let sql =  `INSERT INTO TBL_MOA_BNR_MAIN
            (M_MOA_CODE, T_BNR_CODE, T_BNR_THEME, T_BNR_NAME, T_BNR_IMAGE, T_BNR_IMAGE_WD, T_BNR_IMAGE_HT, T_BNR_PLATFM, T_BNR_STATUS, C_ID) 
        VALUE 
            ('${mart.M_MOA_CODE}', '${code}' , '${cate}' , '${name}' , '${url}' , '${widthImage}' ,  '${heightImage}',  '${platform}',  '${status}',  '${cId}' )`
            const [rows] = await connection.query(sql);
          }
        // logger.writeLog("info", `${logBase} ${sql}`);
        await connection.commit();
        return 1
        } catch (error) {
          await connection.rollback();
          logger.writeLog("error", `${logBase}  \nStacktrace: ${error.stack}`);
          return 0
        } finally{
          connection.release();

        }
  }
};
