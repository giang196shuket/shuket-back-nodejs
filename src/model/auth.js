const pool = require("../../config/database");
const logger = require("../../config/logger");
const moment = require("moment");
const { passwordVerify } = require("../service/auth");

module.exports = class authModel {
  static async checkLogin(id, password) {
    let logBase = `models/authModel.checkLogin:  id(${id})  password(${password})`;
    try {
      let sql = `SELECT U_ID, U_ACC, U_PWD, U_MARTID, U_COMPANY, U_NAME, U_NAME, U_STATUS, U_PHONE, U_EMAIL, U_GROUP, U_LEVEL, U_LLOGIN, C_TIME
            FROM TBL_MOA_USERS_ADMIN
            WHERE BINARY U_ACC = ?
            AND U_STATUS IN ('A', 'S')`;
      const [rows] = await pool.mysqlPool.query(sql, [id]);

      if (!rows[0]) {

        return { status: false, msg: "not_exist" };

      } else if (rows[0].U_STATUS === "S") {

        return { status: false, msg: "suspend_id" };

      } else if (
        rows[0].U_STATUS === "A" && await passwordVerify(password, rows[0].U_PWD)
      ) {

        sql = `UPDATE TBL_MOA_USERS_ADMIN
                    SET U_LLOGIN = ?, M_TIME = ?, M_ID = ?
                    WHERE U_ACC = ? `;
        const time = moment().format("YYYY-MM-DD hh:mm:ss");

        await pool.mysqlPool.query(sql, [time, time, "SYSTEM", id]);

        return {
          status: true,
          data: {
            user_id: rows[0].U_ID,
            u_acc: rows[0].U_ACC,
            u_martid: rows[0].U_MARTID,
            u_name: rows[0].U_NAME,
            u_phone: rows[0].U_PHONE,
            u_email: rows[0].U_EMAIL,
            u_level: rows[0].U_LEVEL,
            ctime: moment(rows[0].C_TIME).format("YYYY-MM-DD hh:mm:ss"),
            is_change: 0,
            old_userid: rows[0].U_ID,
            old_uacc: rows[0].U_ACC,
            old_martid: "",
            old_ulevel: rows[0].U_LEVEL,
          },
        };
      } else {
        return { status: false, msg: "invalid_pw" };
      }
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return { status: false, msg: error.stack };
    }
  }
  static async getDBconnect(martId) {
    let logBase = `authModel.getDBconnect: martId: ${martId}`;
      try {
      let  sql = `SELECT CASE
      WHEN M_DB_CONNECT = 'TGT' THEN 'TOGETHERS'
      WHEN  M_DB_CONNECT = 'GPM' THEN 'GROUP_MAIN'
     END AS M_DB_CONNECT, T_POS_CODE, M_POS_REGCODE,M_MOA_CODE  FROM TBL_MOA_MART_CONFIG WHERE M_MOA_CODE = '${martId}'`;

      const [row] = await pool.mysqlPool.query(sql);

      return row[0]
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
};
