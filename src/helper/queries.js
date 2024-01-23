const logger = require("../../config/logger");
const pool = require("../../config/database");

module.exports = class queriesHelper {
  static async getDBconnect(martId) {
    let logBase = `queriesHelper.getDBconnect: martId: ${martId}`;
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
    static async getDataCountWhere(table, where) {
        let logBase = `queriesHelper.getDataCountWhere: `;
          try {
          let  sql = `SELECT COUNT(SEQ) AS COUNT FROM ${table} WHERE ${where}`;

          // logger.writeLog("info", `${logBase} : ${sql}`);
          const [row] = await pool.mysqlPool.query(sql);
          return row[0].COUNT
        } catch (error) {
          logger.writeLog("error", `${logBase} : ${error.stack}`);
          return null
        }
      }

      static async getRowDataWhere(table, where) {
        let logBase = `queriesHelper.getRowDataWhere: `;
          try {
          let  sql = `SELECT *  FROM ${table} WHERE ${where}`;

          logger.writeLog("info", `${logBase} : ${sql}`);
          const [rows] = await pool.mysqlPool.query(sql);
          return rows[0]
        } catch (error) {
          logger.writeLog("error", `${logBase} : ${error.stack}`);
          return null
        }
      }
      static async getRowDataFieldWhere(field, table, where) {
        let logBase = `queriesHelper.getListDataWhere: `;
          try {
          let  sql = `SELECT ${field}  FROM ${table} WHERE ${where}`;

          // logger.writeLog("info", `${logBase} : ${sql}`);
          const [rows] = await pool.mysqlPool.query(sql);
          return rows[0]
        } catch (error) {
          logger.writeLog("error", `${logBase} : ${error.stack}`);
          return null
        }
      }
      static async getListDataFieldWhere(field, table, where) {
        let logBase = `queriesHelper.getListDataFieldWhere: `;
          try {
          let  sql = `SELECT ${field}  FROM ${table} WHERE ${where}`;

          logger.writeLog("info", `${logBase} : ${sql}`);
          const [rows] = await pool.mysqlPool.query(sql);
          return rows
        } catch (error) {
          logger.writeLog("error", `${logBase} : ${error.stack}`);
          return null
        }
      }

      static async getListDataWhere(table, where) {
        let logBase = `queriesHelper.getListDataWhere: `;
          try {
          let  sql = `SELECT *  FROM ${table} WHERE ${where}`;

          // logger.writeLog("info", `${logBase} : ${sql}`);
          const [rows] = await pool.mysqlPool.query(sql);
          return rows
        } catch (error) {
          logger.writeLog("error", `${logBase} : ${error.stack}`);
          return null
        }
      }

      static async getDataFieldFrom(field, table) {
        let logBase = `queriesHelper.getListDataWhere: `;
          try {
          let  sql = `SELECT ${field}  FROM ${table}`;

          // logger.writeLog("info", `${logBase} : ${sql}`);
          const [rows] = await pool.mysqlPool.query(sql);
          return rows
        } catch (error) {
          logger.writeLog("error", `${logBase} : ${error.stack}`);
          return null
        }
      }
      static async updateTableWhere(table, set, where){
        let logBase = `queriesHelper.updateTableWhere: `;
        try {
        let  sql = `UPDATE ${table}  SET  ${set} WHERE ${where}`;

        logger.writeLog("info", `${logBase} : ${sql}`);
        const [rows] = await pool.mysqlPool.query(sql);
        return rows.affectedRows
      } catch (error) {
        logger.writeLog("error", `${logBase} : ${error.stack}`);
        return 0
      }
      }
      static async insertTableWhere(table, fields, values){
        let logBase = `queriesHelper.insertTableWhere: `;
        try {
        let  sql = `INSERT INTO ${table} (${fields}) VALUES  (${values})`;

        logger.writeLog("info", `${logBase} : ${sql}`);
        const [rows] = await pool.mysqlPool.query(sql);
        return rows.affectedRows
      } catch (error) {
        logger.writeLog("error", `${logBase} : ${error.stack}`);
        return 0
      }
      }
}