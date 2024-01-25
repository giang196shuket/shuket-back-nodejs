const userModel = require("../../model/user/user");
const { messageSuccess } = require("../../helper/message");
const { responseSuccess } = require("../../helper/response");

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
    
    //Add more data return to using for apply permissions of the owner/group current user
    const dataResponse = {
        pageIndex : page,
        pageSize : limit,
        pageCount : Math.ceil(result.length / limit),
        searchCount: result.length,
        currentUserId: user.user_id,
        currentUserLevel: user.level_id,
        currentUserMartId: user.u_martid,
        isCanAdd : user.level_id === 301 ? 1 : 0, //301 account of mart,
        list: result
    }
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
};
