const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");

module.exports = class userModel {


  static async getUserSearchList(mart, levelId, group, level, orderBy, keywordType, keywordValue, dateStart, dateEnd , page, limit, offset) {
    let logBase = `models/userModel.getUserSearchList:`;
      try {
        let  sql = ` SELECT
        UA.SEQ AS U_SEQ, UA.U_ID, UA.U_ACC, UA.U_NAME, UA.U_PHONE, UA.U_EMAIL, UA.U_GROUP, UA.U_LEVEL, UA.U_COMPANY,
        UL.U_LEVEL_TITLE, UG.U_GROUP_TITLE, UA.U_MARTID, MB.M_NAME
    FROM
        TBL_MOA_USERS_ADMIN AS UA
        JOIN TBL_MOA_USERS_LEVEL AS UL ON UA.U_LEVEL = UL.U_LEVEL_CODE
        JOIN TBL_MOA_USERS_GROUP AS UG ON UA.U_GROUP = UG.U_GROUP_CODE
        LEFT JOIN TBL_MOA_MART_BASIC AS MB ON UA.U_MARTID = MB.M_MOA_CODE `;
    
     let where = ` WHERE UA.U_STATUS = 'A' `
     if(keywordType && keywordValue){
        if(keywordType === 'phone'){
            where += ` AND UA.PHONE LIKE '%${keywordValue}%' `
        }
        if(keywordType === 'email'){
            where += ` AND UA.U_EMAIL LIKE '%${keywordValue}%' `
        }
        if(keywordType === 'name'){
            where += ` AND UA.U_NAME LIKE '%${keywordValue}%' `
        }
        if(keywordType === 'seq'){
            where += ` AND UA.SEQ LIKE '%${keywordValue}%' `
        }
     }
     if(dateStart){
        where += ` AND  DATE_FORMAT(UA.C_TIME, '%Y-%m-%d') >= DATE_FORMAT('${dateStart}', '%Y-%m-%d') `
     }
     if(dateEnd){
        where += ` AND  DATE_FORMAT(UA.C_TIME, '%Y-%m-%d') <= DATE_FORMAT('${dateEnd}', '%Y-%m-%d') `
     }
     if(levelId){
        where += ` AND  UA.U_LEVEL >= '${levelId}' `
     }
     if(mart){
        where += ` AND  UA.U_MARTID = '${mart}' `
     }
     if(group){
        where += ` AND  UA.U_GROUP = '${group}' `
     }
     if(level){ 
        where += ` AND  UA.U_LEVEL = '${level}' `
     }
     if(orderBy){
        if(orderBy === 'oldest'){
            where += ` ORDER BY UA.SEQ ASC `
         }
         if( orderBy === 'newest'){
            where += ` ORDER BY UA.SEQ DESC `
         }
     }else{
        where += ` ORDER BY UA.SEQ DESC `
     }
     if(offset && limit){
        where += ` LIMIT ${offset},${limit} `
     }
     sql += where

     logger.writeLog("info", `${logBase} : ${sql}`);
      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  //MENU USER
  
  static async selectProgsRoleByUser(user, is_null = false) {
    let logBase = `models/userModel.selectProgsRoleByUser:  user(${user})`;
      try {
        // if (!user.level_id || !user.user_id) {
        //     return null;
        //   }
          const level_id = user.level_id ? user.level_id : user.old_ulevel;
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
        ULP.U_LEVEL_CODE = '${level_id}'  ORDER BY UC.SORT_ORDER ASC`;
    
      // logger.writeLog("info", `${logBase} : ${sql}`);
      const [rows] = await pool.mysqlPool.query(sql);
      return rows
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  static async getMenuByUser(user){
    let logBase = `models/userModel.getMenuByUser`;
    try {
      //is_change admin dùng mart đăng nhập
      let sql = ""
      if("is_change" in user === false){
        sql =   `SELECT UC.U_CATE_CODE, UC.U_CATE_NAME, UC.U_CATE_NAME_EN, UC.U_CATE_NAME_KR, UC.URL, UC.ICON, UC.U_CATE_DEPT, UC.U_CATE_PCD, UC.U_CATE_TYPE,
        UC.SORT_ORDER
        FROM TBL_MOA_USERS_CATE AS UC
        LEFT JOIN TBL_MOA_USERS_PGRM AS UP ON UP.U_CATE_CODE = UC.U_CATE_CODE AND UP.U_ID = '${user.U_ID}'
        WHERE UC.IS_USE = 'T'  AND UC.U_CATE_CODE < 30000 AND UC.U_CATE_CODE>=10000
        AND (case when UC.U_CATE_DEPT=3 AND (UC.URL is null OR UC.URL='') then '' else 'aa' end) !=''
        ORDER BY  UC.U_CATE_DEPT asc, UC.SORT_ORDER  ASC` 
      }
      if(user.u_martid && "is_change" in user === true && user.is_change === 0){
        sql =   `SELECT UC.U_CATE_CODE, UC.U_CATE_NAME, UC.U_CATE_NAME_EN, UC.U_CATE_NAME_KR, UC.URL, UC.ICON, UC.U_CATE_DEPT, UC.U_CATE_PCD, UC.U_CATE_TYPE,
        UC.SORT_ORDER
        FROM TBL_MOA_USERS_CATE AS UC
        LEFT JOIN TBL_MOA_USERS_PGRM AS UP ON UP.U_CATE_CODE = UC.U_CATE_CODE AND UP.U_ID = '${user.user_id}'
        WHERE UC.IS_USE = 'T'  AND UC.U_CATE_CODE >= 30000 
        AND (case when UC.U_CATE_DEPT=3 AND (UC.URL is null OR UC.URL='') then '' else 'aa' end) !=''
        ORDER BY  UC.U_CATE_DEPT asc, UC.SORT_ORDER  ASC`
      }else if (user.u_martid && "is_change" in user === true && user.is_change === 1){
        sql = `SELECT UC.U_CATE_CODE, UC.U_CATE_NAME, UC.U_CATE_NAME_EN, UC.U_CATE_NAME_KR, UC.URL, UC.ICON, UC.U_CATE_DEPT, UC.U_CATE_PCD, UC.U_CATE_TYPE,
          UC.SORT_ORDER
          FROM TBL_MOA_USERS_CATE AS UC
          LEFT JOIN TBL_MOA_USERS_PGRM AS UP ON UP.U_CATE_CODE = UC.U_CATE_CODE AND UP.U_ID = '${user.user_id}'
          WHERE UC.IS_USE = 'T' AND UC.U_CATE_CODE>=10000
          AND (case when UC.U_CATE_DEPT=3 AND (UC.URL is null OR UC.URL='') then '' else 'aa' end) !=''
          ORDER BY  UC.U_CATE_DEPT asc, UC.SORT_ORDER  ASC`
      }else if (!user.u_martid && "is_change" in user === true && user.is_change === 0){
        sql = `SELECT UC.U_CATE_CODE, UC.U_CATE_NAME, UC.U_CATE_NAME_EN, UC.U_CATE_NAME_KR, UC.URL, UC.ICON, UC.U_CATE_DEPT, UC.U_CATE_PCD, UC.U_CATE_TYPE,
           UC.SORT_ORDER
           FROM TBL_MOA_USERS_CATE AS UC
           LEFT JOIN TBL_MOA_USERS_PGRM AS UP ON UP.U_CATE_CODE = UC.U_CATE_CODE AND UP.U_ID = '${user.user_id}'
           WHERE UC.IS_USE = 'T'  AND UC.U_CATE_CODE < 30000 AND UC.U_CATE_CODE>=10000
           AND (case when UC.U_CATE_DEPT=3 AND (UC.URL is null OR UC.URL='') then '' else 'aa' end) !=''
           ORDER BY  UC.U_CATE_DEPT asc, UC.SORT_ORDER  ASC`
      }
 
          logger.writeLog("info", `${logBase} ${sql}`);

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
