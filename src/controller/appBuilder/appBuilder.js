const logger = require("../../../config/logger");
const { generate_token } = require("../../service/auth");
const { messageError, messageSuccess } = require("../../helper/message");
const { responseSuccess, responseErrorData } = require("../../helper/response");
const appBuilderModel = require("../../model/appBuilder");
const moment = require("moment");
const queriesHelper = require("../../helper/queries");
const templateViewModel = require("../../model/templateView/templateView");
const { stringLimitWords } = require("../../helper/funtion");
const { loadImageAws } = require("../../service/loadImage");
const { composeTypeOneTemplateData } = require("./teamplate/one");
const { composeTypeEightTemplateData } = require("./teamplate/eight");
const { composeTypeTenTemplateData } = require("./teamplate/ten");
const { composeTypeFiveteenTemplateData } = require("./teamplate/fiveteen");
const { composeTypeTwoTemplateData } = require("./teamplate/two");

async function getTemplateNotUse(martId, sreenCode) {
  // appBuilderModel
  const screenData = await appBuilderModel.getAllTemplateAlreadySet(
    martId,
    sreenCode
  );
  const listTemplateCodeCheck = [
    "AP00000001",
    "AP00000004",
    "AP00000008",
    "AP00000009",
    "AP00000012",
    "AP00000018",
    "AP00000017",
  ];
  let arrayTemplateShow = [];
  let arrayTemplateHide = [];

  screenData.forEach((val) => {
    if (listTemplateCodeCheck.includes(val.T_SC_DT_TMPL_CODE)) {
      if ((val.T_SC_DT_TMPL_CODE = "AP00000001")) {
        //AP00000001 template của 1 cái banner
        let templateBannerData = JSON.parse(val.T_SC_DT_TMPL_DATA);
        if (
          templateBannerData.tmpl_sdate &&
          templateBannerData.tmpl_edate &&
          templateBannerData.tmp_period_type === "Use"
        ) {
          // template có thời gian hiển thị
          if (
            moment(templateBannerData.tmpl_sdate).isBefore(moment(), "day") &&
            moment(templateBannerData.tmpl_sdate).isAfter(moment(), "day")
          ) {
            // nếu thời gian bắt đầu hiển thị trước hiện tại và thời gian kết thúc hiển thị sau hiện tại
            arrayTemplateShow.push(
              `${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`
            );
          } else {
            arrayTemplateHide.push(
              `${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`
            );
          }
        }
      }
      if (val.T_SC_DT_TMPL_CODE !== "AP00000001") {
        let templateProductData = JSON.parse(val.T_SC_DT_TMPL_DATA);
        if (templateProductData.tmpl_sdate && templateProductData.tmpl_edate) {
          if (
            moment(templateProductData.tmpl_sdate).isBefore(moment(), "day") &&
            moment(templateProductData.tmpl_sdate).isAfter(moment(), "day")
          ) {
            // nếu thời gian bắt đầu hiển thị trước hiện tại và thời gian kết thúc hiển thị sau hiện tại
            arrayTemplateShow.push(
              `${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`
            );
          } else {
            arrayTemplateHide.push(
              `${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`
            );
          }
        } else {
          arrayTemplateShow.push(
            `${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`
          );
        }
      }
    } else {
      arrayTemplateShow.push(
        `${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`
      );
    }
  });

  return {
    arrayTemplateHide: arrayTemplateHide,
    arrayTemplateShow: arrayTemplateShow,
    totalData: screenData.length,
  };
}
async function getTemplateNotUseApp(martId, targetCode) {
  // templateViewModel
  const screenData = await templateViewModel.getAllTemplateAlreadySet(
    martId,
    sreenCode
  );
  const listTemplateCodeCheck = [
    "AP00000001",
    "AP00000004",
    "AP00000008",
    "AP00000009",
    "AP00000012",
    "AP00000018",
    "AP00000017",
  ];
  let arrayTemplateShow = [];
  let arrayTemplateHide = [];

  screenData.forEach((val) => {
    if (listTemplateCodeCheck.includes(val.T_SC_DT_TMPL_CODE)) {
      if ((val.T_SC_DT_TMPL_CODE = "AP00000001")) {
        //AP00000001 template của 1 cái banner
        let templateBannerData = JSON.parse(val.T_SC_DT_TMPL_DATA);
        if (
          templateBannerData.tmpl_sdate &&
          templateBannerData.tmpl_edate &&
          templateBannerData.tmp_period_type === "Use"
        ) {
          // template có thời gian hiển thị
          if (
            moment(templateBannerData.tmpl_sdate).isBefore(moment(), "day") &&
            moment(templateBannerData.tmpl_sdate).isAfter(moment(), "day")
          ) {
            // nếu thời gian bắt đầu hiển thị trước hiện tại và thời gian kết thúc hiển thị sau hiện tại
            arrayTemplateShow.push(
              `${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`
            );
          } else {
            arrayTemplateHide.push(
              `${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`
            );
          }
        }
      }
      if (val.T_SC_DT_TMPL_CODE !== "AP00000001") {
        let templateProductData = JSON.parse(val.T_SC_DT_TMPL_DATA);
        if (templateProductData.tmpl_sdate && templateProductData.tmpl_edate) {
          if (
            moment(templateProductData.tmpl_sdate).isBefore(moment(), "day") &&
            moment(templateProductData.tmpl_sdate).isAfter(moment(), "day")
          ) {
            // nếu thời gian bắt đầu hiển thị trước hiện tại và thời gian kết thúc hiển thị sau hiện tại
            arrayTemplateShow.push(
              `${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`
            );
          } else {
            arrayTemplateHide.push(
              `${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`
            );
          }
        } else {
          arrayTemplateShow.push(
            `${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`
          );
        }
      }
    } else {
      arrayTemplateShow.push(
        `${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`
      );
    }
  });

  return {
    arrayTemplateHide: arrayTemplateHide,
    arrayTemplateShow: arrayTemplateShow,
    totalData: screenData.length,
  };
}
function getStyleOfTemplate(templateStyle) {
  let styleTitle = {};
  if (!templateStyle && !Array.isArray(templateStyle)) {
    styleTitle.font_size = 18;
    styleTitle.font_weight = "normal";
    styleTitle.font_color = "#000000";
    styleTitle.align = "left";
    styleTitle.padding = {
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
    };
    styleTitle.margin = {
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
    };
    return styleTitle;
  } else {
    templateStyle?.font_size.forEach((itemFont) => {
      if (itemFont.is_selected === 1) {
        styleTitle.font_size = 18;
      }
    });
    templateStyle?.font_weight.forEach((itemWeight) => {
      if (itemWeight.is_selected === 1) {
        if (["Bold", "굵게"].includes(itemWeight.value)) {
          styleTitle.font_weight = "bold";
        }
        if (["Normal", "보통"].includes(itemWeight.value)) {
          styleTitle.font_weight = "normal";
        }
      }
    });

    styleTitle.font_color = templateStyle.font_color;
    templateStyle?.align.forEach((itemAlign) => {
      if (itemAlign.is_selected === 1) {
        if (["Left", "왼쪽"].includes(itemAlign.value)) {
          styleTitle.align = "left";
        }
        if (["Center", "가운데"].includes(itemAlign.value)) {
          styleTitle.align = "center";
        }
        if (["Right", "오른쪽"].includes(itemAlign.value)) {
          styleTitle.align = "right";
        }
      }
    });

    styleTitle.padding = {
      top: templateStyle.padding[0],
      right: templateStyle.padding[1],
      bottom: templateStyle.padding[2],
      left: templateStyle.padding[3],
    };
    styleTitle.margin = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };
    return styleTitle;
  }
}

function composeTypeThirteenTemplateData(templateDate, martId) {
  return {
    typeCode: 13,
    contentsCount: 1,
    contentsTitle: templateDate?.tmpl_data.title,
    contentsData: [],
  };
}
function composeTypeFourteenTemplateData(templateDate, martId) {
  return {
    typeCode: 14,
    contentsCount: 1,
    contentsTitle: templateDate?.tmpl_data.title,
    contentsData: [],
  };
}
//banner 01

//list product for cart

//list icon category

module.exports = {
  async getScreenBuilder(req, res, next) {
    const user = req.userInfo;
    let jsonMainData = [];
    let jsonSubData = [];
    let sortPositionMain = 1;
    let sortPositionSub = 1;
    const result = await appBuilderModel.getScreenBuilder(user.u_martid);

    result.forEach((val) => {
      let isShowEmpty = 0;
      if (val.T_SC_STATUS === "A") {
        //active template
        const dataCheck = getTemplateNotUse(user.u_martid, val.T_SC_CODE);
        if (dataCheck.totalData === dataCheck.arrayTemplateHide?.length) {
          isShowEmpty = 1;
          logger.writeLog("info", "Hide template " + val.T_SC_CODE);
        }
      }
      if (val.T_SC_TYPE === "M") {
        //main screen
        const scIdLength = val.T_SC_CODE.length;
        jsonMainData.push({
          sc_code: val.T_SC_CODE,
          sc_id: val.T_SC_CODE.substring(10, scIdLength),
          sc_label: val.T_SC_LABEL,
          sc_count: parseInt(val.T_SC_TMPL_CNT),
          sc_status: val.T_SC_STATUS,
          is_show_empty: isShowEmpty,
          sort_option: val.T_SC_POSITION
            ? parseInt(val.T_SC_POSITION)
            : sortPositionMain,
          sc_seq: val.SEQ,
        });
        if (!val.T_SC_POSITION) {
          // TĂNG POSITION MẶC ĐỊNH CHO SREEN NÀO KO CÓ POSITION ĐỂ GÁN CHO NÓ
          sortPositionMain++;
        }
      } else if (val.T_SC_TYPE === "S") {
        //sub screen
        const scIdLength = val.T_SC_CODE.length;
        jsonSubData.push({
          sc_code: val.T_SC_CODE,
          sc_id: val.T_SC_CODE.substring(10, scIdLength),
          sc_label: val.T_SC_LABEL,
          sc_count: parseInt(val.T_SC_TMPL_CNT),
          sc_status: val.T_SC_STATUS,
          is_show_empty: isShowEmpty,
          sort_option: val.T_SC_POSITION
            ? parseInt(val.T_SC_POSITION)
            : sortPositionSub,
          sc_seq: val.SEQ,
        });
        if (!val.T_SC_POSITION) {
          // TĂNG POSITION MẶC ĐỊNH CHO SREEN NÀO KO CÓ POSITION ĐỂ GÁN CHO NÓ
          sortPositionSub++;
        }
      }
    });

    const dataResponse = {
      ms_list_data: jsonMainData,
      ss_list_data: jsonSubData,
    };

    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
  async getAppScreenDetail(req, res, next) {
    const scCode = req.query.sc_code;
    const user = req.userInfo;
    const where = `M_MOA_CODE = '${scCode}' AND T_SC_CODE = '${scCode}' AND T_SC_STATUS != 'D'`;
    const isExistData = await queriesHelper.getDataCountWhere(
      "TBL_MOA_APP_SCREENS",
      where
    );
    if (isExistData == 0) {
      //return error
    } else {
    }
    let haveCondition = 1;
    const appInfo = await appBuilderModel.getAppScreenInfo(
      scCode,
      user.u_martid
    );
    const appDetailList = await appBuilderModel.getAppScreenDetailList(
      scCode,
      user.u_martid,
      haveCondition
    );
    let jsonDetailData = [];

    for await (const val of appDetailList) {
      //banner 01
      if (val.T_SC_DT_TMPL_CODE == "AP00000001") {
        let titleBanner = "";
        let title = "";
        let showTitle = "No";

        const dataStyle = JSON.parse(val.T_SC_DT_TMPL_DATA);
        if (dataStyle.tmpl_title) {
          titleBanner = dataStyle.tmpl_title;
        }

        if (dataStyle.tmpl_option_title_display) {
          title = dataStyle.tmpl_title;
          showTitle = "Yes";
        }

        const styleData = getStyleOfTemplate(dataStyle.tmpl_style_title);
        const dataApp = await composeTypeOneTemplateData(
          JSON.parse(val.T_SC_DT_TMPL_DATA),
          user.u_martid,
          scCode
        );
        jsonDetailData.push({
          tmpl_code: val.T_SC_DT_TMPL_CODE,
          tmpl_name: val.T_TMPL_LABEL,
          tmpl_type: val.T_TMPL_TYPE,
          tmpl_order: parseInt(val.T_SC_DT_TMPL_ORDER),
          tmpl_smp_img: val.T_TMPL_IMG,
          tmpl_user_type: val.T_SC_DT_USER_TYPE,
          tmpl_template_title: titleBanner,
          data_app: dataApp,
          title: title,
          showTitle: showTitle,
          styleTitle: styleData,
          isActive: val.IS_YN === "Y" ? true : false,
          templateSEQ: val.SEQ,
        });
      }else  if (val.T_SC_DT_TMPL_CODE == "AP00000002") {
        //event and blog
        const dataStyle = JSON.parse(val.T_SC_DT_TMPL_DATA)
        const style = getStyleOfTemplate(dataStyle?.tmpl_style_title)
        let showTitle = "No"
        let title = ''
        if(dataStyle.tmpl_option_title_display){
          showTitle  = 'Yes'
          title = dataTemplate.tmpl_data.title;
        }
        const dataApp = await composeTypeTwoTemplateData(JSON.parse(val.T_SC_DT_TMPL_DATA), user.u_martid)
        jsonDetailData.push({
          tmpl_code: val.T_SC_DT_TMPL_CODE,
          tmpl_name: val.T_TMPL_LABEL,
          tmpl_type: val.T_TMPL_TYPE,
          tmpl_order: parseInt(val.T_SC_DT_TMPL_ORDER),
          tmpl_smp_img: val.T_TMPL_IMG,
          tmpl_user_type: val.T_SC_DT_USER_TYPE,
          tmpl_template_title: '',
          tmpl_template_type: JSON.parse(val.T_SC_DT_TMPL_DATA).tmpl_type, // dùng cho FE phân biệt blog và event
          data_app: dataApp,
          Title: title,
          showTitle: showTitle,
          isActive: val.IS_YN === 'Y' ? true : false,
          styleTitle: style,
          templateSEQ: val.SEQ,

        })

      } else if (val.T_SC_DT_TMPL_CODE == "AP00000008") {
        //product list for cart
        let titleTemplate = "";
        dataTemplate = JSON.parse(val.T_SC_DT_TMPL_DATA);
        if (dataTemplate.tmpl_data?.title) {
          titleTemplate = dataTemplate.tmpl_data.title;
        }
        const dataApp = await composeTypeEightTemplateData(
          JSON.parse(val.T_SC_DT_TMPL_DATA),
          user.u_martid
        );

        jsonDetailData.push({
          tmpl_code: val.T_SC_DT_TMPL_CODE,
          tmpl_name: val.T_TMPL_LABEL,
          tmpl_type: val.T_TMPL_TYPE,
          tmpl_order: parseInt(val.T_SC_DT_TMPL_ORDER),
          tmpl_smp_img: val.T_TMPL_IMG,
          tmpl_user_type: val.T_SC_DT_USER_TYPE,
          tmpl_template_title: titleTemplate,
          isActive: val.IS_YN === "Y" ? true : false,
          data_app: dataApp,
          templateSEQ: val.SEQ,

        });
      } else if (val.T_SC_DT_TMPL_CODE == "AP00000010") {
        //category list icon
        const dataStyle = JSON.parse(val.T_SC_DT_TMPL_DATA);
        let title = "";
        let showTitle = "No";
        let styleData = getStyleOfTemplate(dataStyle.tmpl_style_title);
        if (dataStyle.tmpl_option_title_display) {
          title = dataStyle.tmpl_title;
          showTitle = "Yes";
        }
        const dataApp = await composeTypeTenTemplateData(
          JSON.parse(val.T_SC_DT_TMPL_DATA),
          user.u_martid
        );

        jsonDetailData.push({
          tmpl_code: val.T_SC_DT_TMPL_CODE,
          tmpl_name: val.T_TMPL_LABEL,
          tmpl_type: val.T_TMPL_TYPE,
          tmpl_order: parseInt(val.T_SC_DT_TMPL_ORDER),
          tmpl_smp_img: val.T_TMPL_IMG,
          tmpl_user_type: val.T_SC_DT_USER_TYPE,
          tmpl_template_title: "",
          data_app: dataApp,
          title: title,
          showTitle: showTitle,
          styleTitle: styleData,
          isActive: val.IS_YN === "Y" ? true : false,
          templateSEQ: val.SEQ,
        });
      } else if (val.T_SC_DT_TMPL_CODE == "AP00000013") {
        // search
        const dataApp = composeTypeThirteenTemplateData(
          JSON.parse(val.T_SC_DT_TMPL_DATA),
          user.u_martid
        );
        jsonDetailData.push({
          tmpl_code: val.T_SC_DT_TMPL_CODE,
          tmpl_name: val.T_TMPL_LABEL,
          tmpl_type: val.T_TMPL_TYPE,
          tmpl_order: parseInt(val.T_SC_DT_TMPL_ORDER),
          tmpl_smp_img: val.T_TMPL_IMG,
          tmpl_user_type: val.T_SC_DT_USER_TYPE,
          tmpl_template_title: "",
          data_app: dataApp,
          templateSEQ: val.SEQ,

        });
      }else if (val.T_SC_DT_TMPL_CODE == "AP00000014") {
        // mã vạch
        const dataApp = composeTypeFourteenTemplateData(
          JSON.parse(val.T_SC_DT_TMPL_DATA),
          user.u_martid
        );
        jsonDetailData.push({
          tmpl_code: val.T_SC_DT_TMPL_CODE,
          tmpl_name: val.T_TMPL_LABEL,
          tmpl_type: val.T_TMPL_TYPE,
          tmpl_order: parseInt(val.T_SC_DT_TMPL_ORDER),
          tmpl_smp_img: val.T_TMPL_IMG,
          tmpl_user_type: val.T_SC_DT_USER_TYPE,
          tmpl_template_title: "",
          data_app: dataApp,
          templateSEQ: val.SEQ,

        });
      }else if (val.T_SC_DT_TMPL_CODE == "AP00000015") {
        // coupon
        const dataApp = await composeTypeFiveteenTemplateData(
          JSON.parse(val.T_SC_DT_TMPL_DATA),
          user.u_martid
        );
        jsonDetailData.push({
          tmpl_code: val.T_SC_DT_TMPL_CODE,
          tmpl_name: val.T_TMPL_LABEL,
          tmpl_type: val.T_TMPL_TYPE,
          tmpl_order: parseInt(val.T_SC_DT_TMPL_ORDER),
          tmpl_smp_img: val.T_TMPL_IMG,
          tmpl_user_type: val.T_SC_DT_USER_TYPE,
          tmpl_template_title: "",
          data_app: dataApp,
          templateSEQ: val.SEQ,

        });
      }
    }
    const scIdLength = appInfo.T_SC_CODE.length;
    const jsonData = {
      sc_code: appInfo.T_SC_CODE,
      sc_id: appInfo.T_SC_CODE.substring(10, scIdLength),
      sc_type: appInfo.T_SC_TYPE,
      sc_label: appInfo.T_SC_LABEL,
      sc_detail_data: jsonDetailData,
    };

    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, jsonData));
  },
};
