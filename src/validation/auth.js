const logger = require("../../config/logger");
const { messageError } = require("../helper/message");
const { responseErrorInput } = require("../helper/response");

module.exports = {    
   
    async validation_login(req, res, next) {

        let logBase = `validation/auth/validation_login: `;
        const id = req.body.id
        const password = req.body.pw
        logger.writeLog("info", `${logBase} Admin Login start with => : ${id}`);

        if(id === "" || password === "" ){
            //600
            let errors = []
            if(id === ""){
                errors.push( {
                    "code": 600,
                    "field": "id",
                    "error": messageError.IdNotEmpty
                })
            }
            if(password === ""){
                errors.push( {
                    "code": 600,
                    "field": "pw",
                    "error":  messageError.PwNotEmpty
                })
            }
            return  res.status(200).json(responseErrorInput(errors));
        }

        if(id.length > 40){
            //602
            return  res.status(200).json({
                status:'failure',
                errors: [ {
                    "code": 602,
                    "field": "id",
                    "error": "The id field is too long"
                }]
            });
        }

        if(password.length > 60){
            //602
            return  res.status(200).json({
                status:'failure',
                errors: [{
                    "code": 602,
                    "field": "password",
                    "error": "The password field is too long"
                }]
            });  }

        next()
         
    },

}