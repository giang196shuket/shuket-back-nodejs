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
 
           let token =  await generateToken(result.data, req.headers['user-agent'])

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
    async userSwitchAccount (req,res, next){
        const id = req.params.id;
        const user = req.userInfo
        console.log('usezxczxczxr', user)

        const token = await generateToken({...user, is_change : 1, u_level: 301, u_martid: id}, req.headers['user-agent'])
        const dataResponse = {
            token: token,
            user_id: user.user_id,
            martid : req.params.id,
            name: user.u_name ? user.u_name : '',
            phone: user.u_phone,
            email: user.u_email,
            level: 301,
            menu_list: null,
            role_list: null
        }

        return  res.status(200).json(responseSuccess(200,  messageSuccess.Success, dataResponse));


    },
    async resetAccount(req, res, next){
        const user = req.userInfo
        console.log('usezxczxczxr', user)
            const token = await generateToken({...user, u_martid:"", level_id: user.old_ulevel,  is_change : 0}, req.headers['user-agent'])

            const dataResponse = {
                token: token,
                user_id: user.user_id,
                martid : '',
                name: user.u_name ? user.u_name : '',
                phone: user.u_phone,
                email: user.u_email,
                level: user.old_ulevel,
                menu_list: null,
                role_list: null
            }
        
        return  res.status(200).json(responseSuccess(200,  messageSuccess.Success,  dataResponse));

    },

}