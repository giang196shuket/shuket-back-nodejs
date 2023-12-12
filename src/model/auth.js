const pool = require("../../config/database");
const logger = require("../../config/logger");
const moment = require("moment");
const { password_verify } = require("../service/auth");

module.exports = class authModel {
  static async check_login(id, password) {
    let logBase = `models/authModel.check_login:  id(${id})  password(${password})`;
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
        rows[0].U_STATUS === "A" && await password_verify(password, rows[0].U_PWD)
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
};
