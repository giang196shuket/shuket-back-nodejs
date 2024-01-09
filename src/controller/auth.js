const logger = require("../../config/logger");
const { generateToken } = require("../service/auth");
const authModel = require("../model/auth");
const { messageError, messageSuccess } = require("../helper/message");
const { responseSuccess, responseErrorData } = require("../helper/response");

module.exports = {    
   
    async login(req, res, next) {
        let logBase = `controller/auth/login: `;
        const id = req.body.id
        const password = req.body.pw

        const result = await authModel.checkLogin(id, password)

        if(result.status){
 
           let token =  await generateToken(result, req.headers['user-agent'])

           var data = {
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
            return  res.status(200).json(responseSuccess(200,  messageSuccess.Success, data));
       
        }else{
            if (result.msg === 'not_exist') {
               return  res.status(200).json(responseErrorData(1800, null , messageError.IdNotValid));
                //when account is suspended
            } else if (result.msg === 'suspend_id') {
                return  res.status(200).json(responseErrorData(1808, null , messageError.Suspened));
                //when pw is not matched
            } else if (result.msg === 'invalid_pw') {
                return  res.status(200).json(responseErrorData(1801, null , messageError.InvalidPassword));
            } else {
                return  res.status(500).send(messageError.ErrorServer);
            }
        }

         
    },

    async getListAccountSwitch (req,res, next){
        const  data = await authModel.getListAccountSwitch()
        return  res.status(200).json(responseSuccess(200,  messageSuccess.Success, data));

    }

}