const pool = require("../../config/database");
const logger = require("../../config/logger");
const moment = require("moment");
const { password_verify } = require("../service/auth");

module.exports = class userModel {

  static async selectProgsRoleByUser(user, is_null = false) {
    let logBase = `models/userModel.selectProgsRoleByUser:  user(${user})`;
      try {
        if (!user.level_id || !user.user_id) {
            return null;
          }
          const level_id = user.level_id;
          const user_id = user.user_id;
          const is_change = user.is_change || 0;
          const old_userid = user.old_userid || null;
          const old_ulevel = user.old_ulevel || null;
          let sql = ""
          if (level_id == 101 && is_change == 0) {
            sql = `
                   SELECT
                       UC.U_CATE_CODE, UC.U_CATE_NAME, UC.U_CATE_NAME_EN, UC.U_CATE_NAME_KR, UC.URL, UC.ICON, UC.U_CATE_DEPT, UC.U_CATE_PCD, UC.U_CATE_TYPE, UC.SORT_ORDER
                   FROM
                       TBL_MOA_USERS_CATE AS UC
                       LEFT JOIN TBL_MOA_USERS_PGRM AS UP ON UP.U_CATE_CODE = UC.U_CATE_CODE AND UP.U_ID = '${user_id}'
                   WHERE
                       UC.IS_USE = 'T'
                       AND URL <> '' AND UC.U_CATE_CODE < 30000
               `;
         } else if (old_ulevel == 101 && is_change == 1) {
            sql = `
                   SELECT
                       UC.U_CATE_CODE, UC.U_CATE_NAME, UC.U_CATE_NAME_EN, UC.U_CATE_NAME_KR, UC.URL, UC.ICON, UC.U_CATE_DEPT, UC.U_CATE_PCD, UC.U_CATE_TYPE, UC.SORT_ORDER
                   FROM
                       TBL_MOA_USERS_CATE AS UC
                       LEFT JOIN TBL_MOA_USERS_PGRM AS UP ON UP.U_CATE_CODE = UC.U_CATE_CODE AND UP.U_ID = '${old_userid}'
                   WHERE
                       UC.IS_USE = 'T'
                       AND URL <> '' AND UC.U_CATE_CODE > 0
               `;
         } else if (old_ulevel == 301 && is_change == 1) {
            sql = `
                    SELECT
                       UC.U_CATE_CODE, UC.U_CATE_NAME, UC.U_CATE_NAME_EN, UC.U_CATE_NAME_KR, UC.URL, UC.ICON, UC.U_CATE_DEPT, UC.U_CATE_PCD, UC.U_CATE_TYPE, UC.SORT_ORDER
                   FROM
                       TBL_MOA_USERS_LEVEL_PGRM AS ULP
                       JOIN TBL_MOA_USERS_LEVEL AS UL ON UL.U_LEVEL_CODE = ULP.U_LEVEL_CODE
                       JOIN TBL_MOA_USERS_CATE AS UC ON UC.U_CATE_CODE = ULP.U_CATE_CODE
                       LEFT JOIN TBL_MOA_USERS_PGRM AS UP ON UP.U_CATE_CODE = ULP.U_CATE_CODE AND UP.U_ID = '${user_id}'
                   WHERE
                       ULP.U_LEVEL_CODE = '${level_id}'
               `;
         }else {
            sql = `
                   SELECT
                       UC.U_CATE_CODE, UC.U_CATE_NAME, UC.U_CATE_NAME_EN, UC.U_CATE_NAME_KR, UC.URL, UC.ICON, UC.U_CATE_DEPT, UC.U_CATE_PCD, UC.U_CATE_TYPE, UC.SORT_ORDER
                   FROM
                       TBL_MOA_USERS_LEVEL_PGRM AS ULP
                       JOIN TBL_MOA_USERS_LEVEL AS UL ON UL.U_LEVEL_CODE = ULP.U_LEVEL_CODE
                       JOIN TBL_MOA_USERS_CATE AS UC ON UC.U_CATE_CODE = ULP.U_CATE_CODE
                       LEFT JOIN TBL_MOA_USERS_PGRM AS UP ON UP.U_CATE_CODE = ULP.U_CATE_CODE AND UP.U_ID = '${user_id}'
                   WHERE
                       ULP.U_LEVEL_CODE = ${level_id}
   
               `;
         }
         if (!is_null) {
            sql += `
                    AND UP.U_CATE_CODE IS NULL
               `;
         } else {
            sql += `
                    AND UP.U_CATE_CODE IS NOT NULL
               `;
         }
    
      // logger.writeLog("info", `${logBase} : ${sql}`);
      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async selectProgsRoleByLevel(level_id) {
    let logBase = `models/userModel.selectProgsRoleByLevel: level_id(${level_id})`;
      try {
        const  sql = ` SELECT
        UC.U_CATE_CODE, UC.U_CATE_NAME, UC.U_CATE_NAME_EN, UC.U_CATE_NAME_KR, UC.URL, UC.ICON, UC.U_CATE_DEPT, UC.U_CATE_PCD, UC.U_CATE_TYPE, UC.SORT_ORDER
    FROM
        TBL_MOA_USERS_LEVEL_PGRM AS ULP
        JOIN TBL_MOA_USERS_LEVEL AS UL ON UL.U_LEVEL_CODE = ULP.U_LEVEL_CODE
        JOIN TBL_MOA_USERS_CATE AS UC ON UC.U_CATE_CODE = ULP.U_CATE_CODE
    WHERE
        ULP.U_LEVEL_CODE = '${level_id}' `;
    
      // logger.writeLog("info", `${logBase} : ${sql}`);
      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async selectProgByCode(cate_code) {
    let logBase = `models/userModel.selectProgByCode: cate_code(${cate_code})`;
      try {
        const  sql = `SELECT
        UC.U_CATE_CODE, UC.U_CATE_NAME, UC.U_CATE_NAME_EN, UC.U_CATE_NAME_KR, UC.URL, UC.ICON, UC.U_CATE_DEPT, UC.U_CATE_PCD, UC.U_CATE_TYPE, UC.SORT_ORDER
        FROM
            TBL_MOA_USERS_CATE AS UC
        WHERE
            UC.U_CATE_CODE = '${cate_code}'`;
    
      // logger.writeLog("info", `${logBase} : ${sql}`);
      const [rows] = await pool.mysqlPool.query(sql);
      return rows[0]
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  
};
