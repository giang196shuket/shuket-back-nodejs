const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class queriesHelper {

    static async getDataCountWhere(table, where) {
        let logBase = `queriesHelper.getDataCountWhere: `;
          try {
          let  sql = `SELECT COUNT(SEQ) AS COUNT FROM ${table} WHERE ${where}`;

          logger.writeLog("info", `${logBase} : ${sql}`);
          const [row] = await pool.mysqlPool.query(sql);
          return row[0].COUNT
        } catch (error) {
          logger.writeLog("error", `${logBase} : ${error.stack}`);
          return null
        }
      }
    
}