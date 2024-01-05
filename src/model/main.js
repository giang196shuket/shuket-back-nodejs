const pool = require("../../config/database");
const logger = require("../../config/logger");
const moment = require("moment");
const { password_verify } = require("../service/auth");

module.exports = class mainModel {
  static async getUserProfile(user_id) {
    let logBase = `models/mainModel.getUserProfile:  user_id(${user_id})`;
      try {
      const sql = `SELECT
      MUA.SEQ AS U_SEQ, MUA.U_ID, MUA.U_ACC, MUA.U_GROUP, MUL.U_LEVEL_TYPE, MUA.U_LEVEL, MUA.U_NAME, MMB.M_NAME, MMB.M_LOGO, MMB.M_LOGO_PUSH, MUA.U_STATUS
      FROM
          TBL_MOA_USERS_ADMIN AS MUA
          LEFT JOIN TBL_MOA_USERS_LEVEL AS MUL ON MUL.U_LEVEL_CODE = MUA.U_LEVEL
          LEFT JOIN TBL_MOA_MART_BASIC AS MMB ON MMB.M_MOA_CODE = MUA.U_MARTID
      WHERE
      MUA.U_ID = ? `;

      const [rows] = await pool.mysqlPool.query(sql, [user_id]);
      return rows[0]
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async getMartInfoSwitch(mart_moa_code) {
    let logBase = `models/mainModel.getMartInfoSwitch: mart_moa_code(${mart_moa_code})`;
      try {
        const sql = `SELECT MB.M_LOGO, MB.M_NAME, MB.M_LOGO, MB.M_LOGO_PUSH
      FROM
    TBL_MOA_MART_BASIC AS MB
      WHERE
    MB.M_MOA_CODE =  ? `;

      const [rows] = await pool.mysqlPool.query(sql, [mart_moa_code]);
      return rows[0]
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async getListQaNotRelay(mart_id) {
    let logBase = `models/mainModel.getListQaNotRelay: mart_id(${mart_id})`;
      try {
        const  sql = `SELECT QNA_TITLE as qa_title, C_TIME as c_time, QNA_CODE as qa_seq
			FROM TBL_MOA_QNA_MAIN
			WHERE M_MOA_CODE = ? AND QNA_STATUS = 'A' AND ANS_STATUS!='T'  AND DEL_YN='N'
			ORDER BY SEQ DESC `;

      const [rows] = await pool.mysqlPool.query(sql, [mart_id]);
      return rows[0]
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async getMoaSettingConfig(mart_id) {
    let logBase = `models/mainModel.getMoaSettingConfig: mart_id(${mart_id})`;
      try {
        const  sql = `SELECT * FROM TBL_MOA_SITE_CONFIG WHERE CONFIG_NAME = 'BANNER_HOTLINE' AND IS_USE = 'Y' LIMIT 1 `;

      const [rows] = await pool.mysqlPool.query(sql, [mart_id]);
      return rows[0]
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async getTypeMart() {
    let logBase = `models/mainModel.getTypeMart:`;
      try {
        const  sql = `SELECT CA.C_CODE, CA.C_ENG AS NAME_EN, CA.C_KO AS NAME_KR
        FROM TBL_MOA_CODE_COMMON CA
  WHERE C_GRP = 'AT' AND C_USE = 'Y'
        GROUP BY CA.C_CODE
        ORDER BY C_CODE ASC`;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async getCityOptions() {
    let logBase = `models/mainModel.getCityOptions:`;
      try {
        const  sql = ` SELECT
        CA.CT_CODE, CA.CT_NAME_EN AS CT_NAME_EN, CA.CT_NAME_KR AS CT_NAME_KR
    FROM
        TBL_MOA_CODE_AREA CA
    GROUP BY CA.CT_CODE
    ORDER BY CT_NAME_KR ASC`;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async getDistrictOptions(ctCode) {
    let logBase = `models/mainModel.getCityOptions: ctCode: ${ctCode}`;
      try {
        const  sql = `  SELECT
        CA.DT_CODE, CA.DT_NAME_EN, CA.DT_NAME_KR
    FROM
        TBL_MOA_CODE_AREA CA WHERE CA.CT_CODE = '${ctCode}'  ORDER BY CA.DT_NAME_KR ASC`;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  
 
};
