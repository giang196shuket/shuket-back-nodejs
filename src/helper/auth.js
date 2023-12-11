
const user_agent = require('user_agent');
const ip = require('ip');
const jwt = require('jsonwebtoken');
const logger = require("../../config/logger");

const jwt_key = 'eyJ0eXAiOiJKV1QiLOcMgo2o!)@)#)I1NiJ9IiRkYXRhIg'

module.exports = {    
  password_verify(password, hash) {
    if (hash.length !== 60 || crypt(password, hash).length !== 60) {
      return false;
    }
  
    let compare = 0;
    for (let i = 0; i < 60; i++) {
      compare |= (password.charCodeAt(i) ^ hash.charCodeAt(i));
    }
  
    return compare === 0;
  },
  generate_token(user_data) {
    const logBase = 'helper/auth/generate_token';
    try {
        let token_data = {};
        token_data.user_id = user_data.user_id;
        token_data.u_martid = user_data.u_martid;
        token_data.u_phone = user_data.u_phone ? user_data.u_phone : '';
        token_data.u_email = user_data.u_email ? user_data.u_email : '';
        token_data.level_id = user_data.u_level;
        token_data.ctime = user_data.ctime;
        token_data.is_change = user_data.is_change;
        token_data.old_userid = user_data.old_userid;
        token_data.old_martid = user_data.old_martid;
        token_data.old_ulevel = user_data.old_ulevel;
        token_data.user_agent = user_agent.agent_string();
        token_data.user_ip = ip.address()

        logger.writeLog("info", `${logBase} : Begin generate JWT: ${JSON.stringify(token_data)}`);

        //Generate JWT Token
        const token =  jwt.sign(token_data, jwt_key, { expiresIn: 3600, algorithm:"HS256" });

        if (token) {
          logger.writeLog("info", `${logBase} :  Generate JWT is successful =>: ${JSON.stringify(token_data)}`);
        }

    } catch (error) {
        console.error(error);
    }
}


}