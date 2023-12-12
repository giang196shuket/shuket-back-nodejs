
const UserAgent = require('user-agents');
const ip = require('ip');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const logger = require("../../config/logger");

const jwt_key = 'eyJ0eXAiOiJKV1QiLOcMgo2o!)@)#)I1NiJ9IiRkYXRhIg'
const jwt_expires = 3600

module.exports = {    

  async password_verify(password, hash) {

    const compare = bcrypt.compareSync(password, hash)

    if (hash.length !== 60) {
      return false;
    }
    if(compare){
      return true
    }else{
      false
    }

  },
  async validate_token (token) {
    try {
      var decoded = jwt.verify(token, jwt_key)
      if(decoded && decoded.user_id){
        return decoded
      }else{
        return null
      }
    } catch(err) {
      return null
    }
  },
  async generate_token(userData, userAgent) {
    const logBase = 'helper/auth/generate_token';
    try {
        let token_data = {
          user_id : userData.data.user_id,
          u_martid : userData.data.u_martid,
          u_phone : userData.data.u_phone ? userData.data.u_phone : '',
          u_email : userData.data.u_email ? userData.data.u_email : '',
          level_id : userData.data.u_level,
          ctime : userData.data.ctime,
          is_change : userData.data.is_change,
          old_userid : userData.data.old_userid,
          old_martid : userData.data.old_martid,
          old_ulevel : userData.data.old_ulevel,
          user_agent : userAgent,
          user_ip : ip.address(),
          time:  parseInt((new Date().getTime() + jwt_expires).toString().slice(0,10))
        };
        

        logger.writeLog("info", `${logBase} : Begin generate JWT: ${JSON.stringify(token_data)}`);

        //Generate JWT Token
        const token =  jwt.sign(token_data, jwt_key, { expiresIn: jwt_expires, algorithm:"HS256" , noTimestamp: true });

        if (token) {
          logger.writeLog("info", `${logBase} :  Generate JWT is successful =>: ${JSON.stringify(token_data)}`);
        }
        return token

    } catch (error) {
        console.error(error);
    }
}


}