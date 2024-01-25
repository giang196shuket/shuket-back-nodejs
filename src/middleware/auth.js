const logger = require("../../config/logger");
const { messageError } = require("../helper/message");
const { responseErrorData } = require("../helper/response");
const authModel = require("../model/auth");
const { validateToken } = require("../service/auth");

module.exports = {
  async verifyToken(req, res, next) {
    const token = req.header("authorization");
    const exprireTime = new Date().getTime().toString().slice(0, 10);

    if (!token) {
      return res
        .status(200)
        .json(responseErrorData(600, "token", messageError.TokenEmpty));
    } else {
      const decoded = await validateToken(token.split(" ")[1]);
      if (decoded) {
        // console.log('decoded', decoded)
        if (decoded.exp <= exprireTime) {
          logger.writeLog("info", `${token} : --> Token expired`);
          return res
            .status(200)
            .json(responseErrorData(1806, "token", messageError.TokenExpried));
        } else {
          logger.writeLog("info", `${token} : --> Authentication successful`);
          if(decoded.u_martid){
            const dataConnect = await authModel.getDBconnect(decoded.u_martid)
            console.log('dataConnect', dataConnect)
            req.dataConnect = dataConnect
          }
          req.userInfo = decoded;
          console.log("userInfo", decoded);
          next();
        }
      } else {
        logger.writeLog("info", `${token} : --> Invalid token`);
        return res
          .status(200)
          .json(responseErrorData(1805, "token", messageError.TokenInvalid));
      }
    }
  },
};
