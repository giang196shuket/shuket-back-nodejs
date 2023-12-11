const logger = require("../../config/logger");
const { generate_token } = require("../helper/auth");
const authModel = require("../model/auth");

module.exports = {    
   
    async login(req, res, next) {
        let logBase = `controller/auth/login: `;
        const id = req.body.id
        const password = req.body.pw

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
            return  res.status(200).json({
                status:'failure',
                code:1800,
                data: null
            });
            
        }
        
        }else{
            if (result.msg === 'not_exist') {
               return  res.status(200).json({
                status:'failure',
                code:1800,
                msg: result.msg
            });
                //when account is suspended
            } else if (result.msg === 'suspend_id') {
                return  res.status(200).json({
                    status:'failure',
                    code:1808,
                    msg:result.msg
                });
                //when pw is not matched
            } else if (result.msg === 'invalid_pw') {
                return  res.status(200).json({
                    status:'failure',
                    code:1801,
                    msg:result.msg
                });
            } else {
                return  res.status(500).send(null);
            }
        }

         
    },

}