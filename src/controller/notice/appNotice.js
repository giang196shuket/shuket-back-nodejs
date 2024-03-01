const { getLimitQuery, limitcontent } = require("../../helper/funtion");
const { LINK_BACKEND_DEV } = require("../../helper/link");
const { messageSuccess } = require("../../helper/message");
const queriesHelper = require("../../helper/queries");
const { responseSuccess, responseDataList, responseNoticeAppList } = require("../../helper/response");
const appNotice = require("../../model/notice/appNotice");
const { loadImageAws } = require("../../service/loadImage");
const moment = require("moment");

module.exports = {
  async getListNotice(req, res, next) {
    const { keywordType, keywordValue, page, limit, status } = req.body;
    //keywordType: T =>  search by title
    //keywordType: S =>  search by screen show notice
    const limitQuery = getLimitQuery(page, limit);
    const result = await appNotice.getListNotice(
      limitQuery,
      keywordType,
      keywordValue,
      status
    );

    let jsonResponseData = [];
    for (const val of result) {
      // tách ngày giờ bắt đầu
      //START TIME
      let sdate = moment(val.NT_MSG_SDATE)
        .format("YYYY-MM-DD HH:mm")
        .split(" ");
      let startDate = sdate[0];
      let stime = sdate[1].split(":");
      let startHour = stime[0];
      let startMinute = stime[1];
      //END TIME
      let edate = moment(val.NT_MSG_EDATE)
        .format("YYYY-MM-DD HH:mm")
        .split(" ");
      let endDate = edate[0];
      let etime = edate[1].split(":");
      let endHour = etime[0];
      let endMinute = etime[1];
      // tách ngày giờ kết thúc
      let linkTarget = "";
      let linkType = "";
      let martTargetName = "";
      let showPopupMart = "";

      if (val.NT_SCREEN_TARGET_OPTION === "C") {
        //NOT USE
        linkTarget = "N/A";
        linkType = 3;
      } else if (val.NT_SCREEN_TARGET_OPTION === "S") {
        // NOTICE OF SCREEN
        linkType = 1;
        linkTarget = val.NT_SCREEN_TARGET_DATA;
      } else {
        // val.NT_SCREEN_TARGET_OPTION === 'U'
        // NOTICE OF URL
        linkType = 2;
        linkTarget = val.NT_SCREEN_TARGET_DATA;
      }

      if (val.MART_TYPE === "DIRECT") {
        martTargetName = await queriesHelper.getRowDataFieldWhere(
          "M_NAME",
          "TBL_MOA_MART_BASIC",
          ` M_MOA_CODE = ${val.M_MOA_CODE}`
        );
        showPopupMart = 0;
      } else {
        //GSK //SG// SG,SK,YSK// SG,SK,YSK,GSK// SG,YSK// SK // SK,YSK// YSK// YSK,GSK //ALL ...
        martTargetName = val.MART_TYPE;
        showPopupMart = 0;
      }
      jsonResponseData.push({     
        startSate: startDate,
        startHour: startHour,
        start_Minus: startMinute,
        endDate: endDate,
        endHour: endHour,
        endMinus: endMinute,
        targetScreenUrl: linkTarget,
        linkType: linkType,
        targetMart: martTargetName,
        showPopupMart: showPopupMart,
        ...responseNoticeAppList(val)
      });
    }
    responseDataList;
    const dataResponse = {
      ...responseDataList(
        page,
        limit,
        jsonResponseData.length,
        jsonResponseData
      ),
    };
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
};
