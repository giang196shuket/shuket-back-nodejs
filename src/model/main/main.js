const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");
const { password_verify } = require("../../service/auth");

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
      return rows[0];
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
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
      return rows[0];
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
  static async getListQaNotRelay(mart_id) {
    let logBase = `models/mainModel.getListQaNotRelay: mart_id(${mart_id})`;
    try {
      const sql = `SELECT QNA_TITLE as qa_title, C_TIME as c_time, QNA_CODE as qa_seq
			FROM TBL_MOA_QNA_MAIN
			WHERE M_MOA_CODE = ? AND QNA_STATUS = 'A' AND ANS_STATUS!='T'  AND DEL_YN='N'
			ORDER BY SEQ DESC `;

      const [rows] = await pool.mysqlPool.query(sql, [mart_id]);
      return rows[0];
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
  static async getMoaSettingConfig(mart_id) {
    let logBase = `models/mainModel.getMoaSettingConfig: mart_id(${mart_id})`;
    try {
      const sql = `SELECT * FROM TBL_MOA_SITE_CONFIG WHERE CONFIG_NAME = 'BANNER_HOTLINE' AND IS_USE = 'Y' LIMIT 1 `;

      const [rows] = await pool.mysqlPool.query(sql, [mart_id]);
      return rows[0];
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
  static async getTypeMart() {
    let logBase = `models/mainModel.getTypeMart:`;
    try {
      const sql = `SELECT CA.C_CODE, CA.C_ENG AS NAME_EN, CA.C_KO AS NAME_KR
        FROM TBL_MOA_CODE_COMMON CA
  WHERE C_GRP = 'AT' AND C_USE = 'Y'
        GROUP BY CA.C_CODE
        ORDER BY C_CODE ASC`;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows;
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
  static async getCityOptions() {
    let logBase = `models/mainModel.getCityOptions:`;
    try {
      const sql = ` SELECT
        CA.CT_CODE, CA.CT_NAME_EN AS CT_NAME_EN, CA.CT_NAME_KR AS CT_NAME_KR
    FROM
        TBL_MOA_CODE_AREA CA
    GROUP BY CA.CT_CODE
    ORDER BY CT_NAME_KR ASC`;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows;
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
  static async getDistrictOptions(ctCode) {
    let logBase = `models/mainModel.getCityOptions: ctCode: ${ctCode}`;
    try {
      const sql = `  SELECT
        CA.DT_CODE, CA.DT_NAME_EN, CA.DT_NAME_KR
    FROM
        TBL_MOA_CODE_AREA CA WHERE CA.CT_CODE = '${ctCode}'  ORDER BY CA.DT_NAME_KR ASC`;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows;
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }

  static async getPartnerOptions() {
    let logBase = `models/partnerModel.getPartnerOptions:`;
    try {
      const sql = ` SELECT
        SB.SEQ, SB.SP_CODE, SB.SP_NAME, SB.SP_LICENSE, SB.SP_LEVEL, SB.SP_STATUS
    FROM
        TBL_SP_BASIC SB `;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows;
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }

  static async getPartnerSalesTeamOptions(spCode) {
    let logBase = `models/partnerModel.getPartnerSalesTeamOptions:`;
    try {
      const sql = ` SELECT
        SST.SEQ, SST.SP_CODE, SST.SPT_CODE, SST.SPT_NAME
    FROM
        TBL_SP_SALES_TEAM AS SST
    WHERE
        SST.SPT_STATUS = 'A' AND SST.SP_CODE = '${spCode}'`;
      const [rows] = await pool.mysqlPool.query(sql);
      return rows;
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }

  static async getPosOptions() {
    let logBase = `models/posModel.getPosOptions:`;
    try {
      const sql = ` SELECT
        CP.SEQ, CP.POS_CODE, CP.POS_NAME, CP.POS_STATUS
      FROM
        TBL_MOA_CODE_POS CP `;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows;
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }

 
  //GROUP_MAIN, TOGETHER
  static async getDBConnect() {
    let logBase = `models/martModel.getDBConnect:`;

    const sql = `SELECT
      C_CODE, C_KO, C_ENG
      FROM
      TBL_MOA_CODE_COMMON
      WHERE C_GRP = 'DB'
      AND C_USE = 'Y'
      ORDER BY C_ORDER ASC`;
    const [rows] = await pool.mysqlPool.query(sql);
    return rows;
  }

  static async getListMartImport() {
    let logBase = `models/posModel.getListMartImport:`;
    try {
      const sql = ` SELECT MB.M_MOA_CODE as mart_code, MB.M_NAME as mart_name, MBC.M_DB_CONNECT as mart_db
          FROM TBL_MOA_MART_BASIC AS MB
          LEFT JOIN TBL_MOA_MART_CONFIG AS MBC ON MBC.M_MOA_CODE = MB.M_MOA_CODE
          WHERE MB.M_STATUS = 'A' `;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows;
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
  static async getAccountImport(userId) {
    let logBase = `models/posModel.getAccountImport:`;
    try {
      const sql = ` SELECT
          MUA.SEQ AS U_SEQ, MUA.U_ID, MUA.U_ACC, MUA.U_GROUP, MUA.U_LEVEL, MUA.U_NAME
      FROM
          TBL_MOA_USERS_ADMIN AS MUA
      WHERE
          MUA.U_ID = '${userId}'`;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows[0];
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null;
    }
  }
  static async getListAccountSwitch() {
    const sql = `SELECT
				M_MOA_CODE as user_acc,
				M_NAME as user_name
			FROM TBL_MOA_MART_BASIC MART_BASIC
			WHERE MART_BASIC.M_STATUS='A' `;
    const [rows] = await pool.mysqlPool.query(sql);
    return rows;
  }

  static async getLevelOptions() {
    let logBase = `models/userModel.getLevelOptions:`;
      try {
        const  sql = ` SELECT
        UL.SEQ AS SEQ, UL.U_LEVEL_CODE AS code, UL.U_LEVEL_TITLE AS name
    FROM
        TBL_MOA_USERS_LEVEL UL WHERE UL.U_LEVEL_STATUS = 'A' `;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async getGroupOptions() {
    let logBase = `models/userModel.getGroupOptions:`;
      try {
        const  sql = ` SELECT
        UG.SEQ AS SEQ, UG.U_GROUP_CODE AS code, UG.U_GROUP_TITLE AS name
    FROM
        TBL_MOA_USERS_GROUP UG WHERE UG.U_GROUP_STATUS = 'A' `;

      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
};
