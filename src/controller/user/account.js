const userModel = require("../../model/user/account");
const { messageSuccess, messageOrther } = require("../../helper/message");
const { responseSuccess, responseDataList } = require("../../helper/response");
const { assignSequentialNumbers } = require("../../helper/funtion");
const queriesHelper = require("../../helper/queries");
const { mergeRoleList } = require("../main/common");

module.exports = {
  


  async getUserSearchList(req, res, next) {
    let {group, level, orderBy, keywordType, keywordValue, dateStart, dateEnd , page, limit} = req.body
    //orderBy : newest | oldest
    const offset = page * limit - limit
    const user = req.userInfo
    let mart = ""

    //admin 
    if(user.is_change == 1 && user.old_ulevel === 101){
        mart = ""
    }else{
    //mart
        mart = user.u_martid
    }
    const levelId = user.level_id

    const result = await userModel.getUserSearchList(mart, levelId, group, level, orderBy, keywordType, keywordValue, dateStart, dateEnd , page, limit, offset)
    
        
    const dataResponse = {
       ...responseDataList(page, limit, result.length, result)
    }
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
  async checkUserAdminId(req, res, next) {
    let {u_id} = req.body

    const user = await queriesHelper.getRowDataWhere('TBL_MOA_USERS_ADMIN',` U_ACC = '${u_id}' AND U_STATUS != 'C' `)
    if(user){
      return res
      .status(200)
      .json(responseSuccess(200, messageOrther.IdExist, true));
    }else{
      return res
      .status(200)
      .json(responseSuccess(200, messageOrther.IdNotExist, false));
    }

  },
  async getProgsRoleById(req, res, next) {
    let {user_id} = req.query

    const user = await queriesHelper.getRowDataWhere('TBL_MOA_USERS_ADMIN',` U_ID = '${user_id}' AND U_STATUS = 'A' `)
    console.log(user)
    const menuUser = await userModel.getMenuByUser(user);

    const listProgs = await mergeRoleList(menuUser);
    const data = {
      left_menu: listProgs,
    };


    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, data));
  },
};
