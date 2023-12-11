const logger = require("../../config/logger");
const { generate_token } = require("../helper/auth");
const authModel = require("../model/auth");

module.exports = {    
   
    async login(req, res, next) {
        let logBase = `auth/login(): `;
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
                    "error": "The id field can not empty"
                })
            }
            if(password === ""){
                errors.push( {
                    "code": 600,
                    "field": "pw",
                    "error": "The pw field can not empty"
                })
            }
            return  res.status(200).json({
                status:'failure',
                errors: errors
            });
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

        const result = await authModel.check_login(id, password)

        if(result.status){
           const token =  generate_token(result)
           if (result.data.u_martid !== 'M000000571') {
            var json_response_data = {
                token: token,
                user_id: result.data.user_id,
                martid: result.data.u_martid,
                name: result.data.u_name,
                phone: result.data.u_phone,
                email: result.data.u_email,
                level: result.data.u_level,
                menu_list: null,
                role_list: null
            };
            return  res.status(200).json({
                status:'success',
                message: "Your request is successful",
                data: json_response_data
            });

        } else {
            //1800
            return  res.status(200).send(null);

        }
        
        }else{
            if (result.msg === 'not_exist') {
               //1800
               return  res.status(200).send(msg);
                //when account is suspended
            } else if (result.msg === 'suspend_id') {
                //1808
                return  res.status(200).send(msg);
                //when pw is not matched
            } else if (result.msg === 'invalid_pw') {
                //1801
                return  res.status(200).send(msg);
            } else {
                return  res.status(500).send(null);
            }
        }

         
    },

}