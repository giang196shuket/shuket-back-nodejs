const pool = require("../../../config/database");
const logger = require("../../../config/logger");
const moment = require("moment");

module.exports = class orderModel {

  static async getOrderList(cate_code) {
    let logBase = `models/orderModel.getOrderList: cate_code(${cate_code})`;
      try {
        const  sql = ``;
    
      // logger.writeLog("info", `${logBase} : ${sql}`);
      const [rows] = await pool.mysqlPool.query(sql);
      return rows[0]
    } catch (error) {
      logger.writeLog("error", `${logBase} : ${error.stack}`);
      return null
    }
  }
  
};
