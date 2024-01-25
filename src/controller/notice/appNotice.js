const { getLimitQuery, limitcontent } = require("../../helper/funtion");
const { messageSuccess } = require("../../helper/message");
const queriesHelper = require("../../helper/queries");
const { responseSuccess } = require("../../helper/response");
const appNotice = require("../../model/notice/appNotice");
const { loadImageAws } = require("../../service/loadImage");
const moment = require("moment");



module.exports = {

  async getListNotice(req, res, next) {
    const {keywordType, keywordValue ,page, limit, status } = req.body
    //keywordType: T =>  search by title
    //keywordType: S =>  search by screen show notice
    const limitQuery = getLimitQuery(page, limit)
    const result = await appNotice.getListNotice(limitQuery,keywordType, keywordValue , status)

    let jsonResponseData = []
    for (const val of result) {
       // tách ngày giờ bắt đầu
       //START TIME
       let sdate = moment(val.NT_MSG_SDATE).format('YYYY-MM-DD HH:mm').split(' ') ;
       let startDate = sdate[0]
       let stime = sdate[1].split(':');
       let startHour = stime[0];
       let startMinute = stime[1];
       //END TIME
       let edate =  moment(val.NT_MSG_EDATE).format('YYYY-MM-DD HH:mm').split(' ');
       let endDate = edate[0]
       let etime = edate[1].split(':');
       let endHour = etime[0];
       let endMinute = etime[1];
       // tách ngày giờ kết thúc
       let linkTarget = ""
       let linkType = ""
       let martTargetName = ""
       let showPopupMart = ""

       if(val.NT_SCREEN_TARGET_OPTION === 'C'){
        //NOT USE
         linkTarget = 'N/A'
         linkType = 3
       }else if(val.NT_SCREEN_TARGET_OPTION === 'S'){
        // NOTICE OF SCREEN 
        linkType = 1
        linkTarget = val.NT_SCREEN_TARGET_DATA
       }else{
         // val.NT_SCREEN_TARGET_OPTION === 'U'
         // NOTICE OF URL 
         linkType = 2
         linkTarget = val.NT_SCREEN_TARGET_DATA
       }

       if(val.MART_TYPE === "DIRECT"){
        martTargetName = await queriesHelper.getRowDataFieldWhere('M_NAME','TBL_MOA_MART_BASIC', ` M_MOA_CODE = ${val.M_MOA_CODE}`)
        showPopupMart = 0   
       }else{
        //GSK //SG// SG,SK,YSK// SG,SK,YSK,GSK// SG,YSK// SK // SK,YSK// YSK// YSK,GSK //ALL ...
        martTargetName = val.MART_TYPE
        showPopupMart = 0   
       }
       jsonResponseData.push({
          seq: val.SEQ,
          notice_code: val.NT_MSG_CODE,
          m_moa_code: val.M_MOA_CODE,
          notice_title: val.NT_MSG_TITLE,
          notice_image: val.NT_MSG_IMAGES,
          notice_content: val.NT_MSG_DETAIL,
          notice_sdate: val.NT_MSG_SDATE,
          notice_edate: val.NT_MSG_EDATE,
          mart_display: val.NT_MSG_DISPLAY,
          start_date: startDate,
          start_hour: startHour,
          start_minus: startMinute,
          end_date: endDate,
          end_hour: endHour,
          end_minus: endMinute,
          notice_status : val.NT_MSG_STATUS,
          target_screen_option: val.NT_SCREEN_TARGET_OPTION,
          target_screen_url: linkTarget,
          link_type: linkType,
          c_time: val.C_TIME,
          m_time: val.M_TIME,
          target_mart: martTargetName,
          show_popup_mart: showPopupMart
       })

    }
    const dataResponse = {
      page_index : page,
      page_size : limit,
      page_count : Math.ceil(jsonResponseData.length / limit),
      list: jsonResponseData
    }
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },

};
