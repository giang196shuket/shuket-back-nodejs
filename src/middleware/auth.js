const logger = require("../../config/logger");
const { messageError } = require("../helper/message");
const {  responseErrorData } = require("../helper/response");
const { validateToken } = require("../service/auth");

module.exports = {    
   
    async verifyToken (req, res, next) {
        const token = req.header('authorization');
        if(!token){
            return  res.status(200).json(responseErrorData(600, 'token', messageError.TokenEmpty));
        }else{
            const decoded = await validateToken(token.split(' ')[1])
            if(decoded){
                logger.writeLog("info", `${token} : --> Authentication successful`);
                req.userInfo = decoded
                console.log('user', decoded)
                next()
            }else{
                logger.writeLog("info", `${token} : --> Invalid token`);
                return  res.status(200).json(responseErrorData(1805, 'token', messageError.TokenInvalid));
            }    
        }
    },

}