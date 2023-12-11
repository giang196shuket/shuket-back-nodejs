const logger = require("../../config/logger");
const { generate_token } = require("../../helper/auth");
const authModel = require("../model/auth");

module.exports = {    
   
    async login(req, res, next) {
        let logBase = `auth/login(): `;
        const id = req.body.id
        const password = req.body.pw
        logger.writeLog("info", `${logBase} Admin Login start with => : ${id}`);

        const data = await authModel.check_login(id, password)

        if( data != null && typeof data == "object"){
            generate_token(data)
        }else{
            return  res.status(200).json({
                data: data
            });
        }

         
    },

}