const logger = require("../../config/logger");
const { generate_token } = require("../service/auth");
const { messageError, messageSuccess } = require("../helper/message");
const { responseSuccess, responseErrorData } = require("../helper/response");
const appBuilderModel = require("../model/appBuilder");
const moment = require("moment");
const queriesHelper = require("../helper/queries");
const templateViewModel = require("../model/templateView");


async function  getTemplateNotUse(martId, sreenCode) {
  const screenData = await appBuilderModel.getAllTemplateAlreadySet(martId, sreenCode)
  const listTemplateCodeCheck = ['AP00000001', 'AP00000004', 'AP00000008', 'AP00000009', 'AP00000012', 'AP00000018', 'AP00000017']
  let arrayTemplateShow = []
  let arrayTemplateHide = []

  screenData.forEach(val => {
    if(listTemplateCodeCheck.includes(val.T_SC_DT_TMPL_CODE)){
        if(val.T_SC_DT_TMPL_CODE = 'AP00000001'){
          //AP00000001 template của 1 cái banner
          let templateBannerData = JSON.parse(val.T_SC_DT_TMPL_DATA)
          if(templateBannerData.tmpl_sdate && templateBannerData.tmpl_edate && templateBannerData.tmp_period_type === 'Use'){
            // template có thời gian hiển thị
            if(moment(templateBannerData.tmpl_sdate).isBefore(moment(), "day") && moment(templateBannerData.tmpl_sdate).isAfter(moment(), "day")){
              // nếu thời gian bắt đầu hiển thị trước hiện tại và thời gian kết thúc hiển thị sau hiện tại
              arrayTemplateShow.push(`${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`)
            }else{
              arrayTemplateHide.push(`${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`)
            }
            
          }
        }
        if(val.T_SC_DT_TMPL_CODE !== 'AP00000001'){
          let templateProductData = JSON.parse(val.T_SC_DT_TMPL_DATA)
           if(templateProductData.tmpl_sdate && templateProductData.tmpl_edate){
            if(moment(templateProductData.tmpl_sdate).isBefore(moment(), "day") && moment(templateProductData.tmpl_sdate).isAfter(moment(), "day")){
              // nếu thời gian bắt đầu hiển thị trước hiện tại và thời gian kết thúc hiển thị sau hiện tại
              arrayTemplateShow.push(`${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`)
            }else{
              arrayTemplateHide.push(`${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`)
            }
           }else{
            arrayTemplateShow.push(`${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`)

           }
        }
    }else{
      arrayTemplateShow.push(`${val.T_SC_CODE}_${val.T_SC_DT_TMPL_CODE}_${val.T_TMPL_TYPE}_${val.T_SC_DT_TMPL_ORDER}`)
    }
  });

  return {
    arrayTemplateHide: arrayTemplateHide,
    arrayTemplateShow: arrayTemplateShow,
    totalData: screenData.length
  }

}
function  getStyleOfTemplate(templateStyle) {
  let styleTitle = null
  if(!templateStyle && !Array.isArray(templateStyle)){
    styleTitle.font_size = 18
    styleTitle.font_weight = 'normal'
    styleTitle.font_color =  '#000000'
    styleTitle.align = 'left'
    styleTitle.padding = {
      top : '0',
      right : '0',
      bottom : '0',
      left : '0',
    }
    styleTitle.margin = {
      top : '0',
      right : '0',
      bottom : '0',
      left : '0',
    }
    return styleTitle
  }else{
    templateStyle?.font_size.forEach(itemFont => {
      if(itemFont.is_selected === 1){
        styleTitle.font_size = 18
      }
    });
    templateStyle?.font_weight.forEach(itemWeight => {
        if(itemWeight.is_selected === 1){
          if(['Bold', '굵게'].includes(itemWeight.value)){
            styleTitle.font_weight = 'bold'
          }
          if(['Normal', '보통'].includes(itemWeight.value)){
            styleTitle.font_weight = 'normal'
          }
        }
    });

    styleTitle.font_color = templateStyle.font_color
    templateStyle?.align.forEach(itemAlign => {
      if(itemAlign.is_selected === 1){
        if(['Left', '왼쪽'].includes(itemAlign.value)){
          styleTitle.align = 'left'
        }
        if(['Center', '가운데'].includes(itemAlign.value)){
          styleTitle.align = 'center'
        }
        if(['Right', '오른쪽'].includes(itemAlign.value)){
          styleTitle.align = 'right'
        }
      }
    });

    styleTitle.padding = {
      top : templateStyle.padding[0],
      right : templateStyle.padding[1],
      bottom : templateStyle.padding[2],
      left : templateStyle.padding[3],
    }
    styleTitle.margin = {
      top : 0,
      right : 0,
      bottom : 0,
      left : 0,
    }
    return styleTitle
  }
}

function composeTypeOneTemplateData(templateData, martId, sreenCode){
  let templateDataArr = []
  let iRun = 0
   if(templateData.tmp_period_type && templateData.tmp_period_type != 'CustomUse'){
     let activeClass = ""
     templateData?.tmpl_data.forEach(async val => {
      if('tmpl_dt_cd' in val){
        //field tmpl_dt_cd tồn tại trong object val
        const actualData = await templateViewModel.getTypeOneData(val.tmpl_dt_cd,martId)

      }
      
     });
   }
}

module.exports = {
 
  async getScreenBuilder(req, res, next) {
    const user = req.userInfo 
    let jsonMainData = []
    let jsonSubData = []
    let sortPositionMain = 1;
    let sortPositionSub = 1;
    const result = await appBuilderModel.getScreenBuilder(user.u_martid)  
    
    result.forEach(val => {
      let isShowEmpty = 0
      if(val.T_SC_STATUS === 'A'){
        //active template
        const dataCheck = getTemplateNotUse(user.u_martid, val.T_SC_CODE)
        if(dataCheck.totalData === dataCheck.arrayTemplateHide?.length){
          isShowEmpty = 1
          logger.writeLog('info', 'Hide template ' + val.T_SC_CODE)
        }
      }
      if(val.T_SC_TYPE === 'M'){
        //main screen
        jsonMainData.push({
          sc_code : val.T_SC_CODE,
          sc_id:  val.T_SC_CODE.substring(10, val.T_SC_CODE.length),
          sc_label: val.T_SC_LABEL,
          sc_count: parseInt(val.T_SC_TMPL_CNT),
          sc_status: val.T_SC_STATUS, 
          is_show_empty : isShowEmpty,
          sort_option : val.T_SC_POSITION ? parseInt(val.T_SC_POSITION) : sortPositionMain,
          sc_seq : val.SEQ
        })
        if(!val.T_SC_POSITION){
          // TĂNG POSITION MẶC ĐỊNH CHO SREEN NÀO KO CÓ POSITION ĐỂ GÁN CHO NÓ
          sortPositionMain++ 
        }
      } else if (val.T_SC_TYPE === 'S'){
        //sub screen
        jsonSubData.push({
          sc_code : val.T_SC_CODE,
          sc_id:  val.T_SC_CODE.substring(10, val.T_SC_CODE.length),
          sc_label: val.T_SC_LABEL,
          sc_count: parseInt(val.T_SC_TMPL_CNT),
          sc_status: val.T_SC_STATUS, 
          is_show_empty : isShowEmpty,
          sort_option : val.T_SC_POSITION ? parseInt(val.T_SC_POSITION) : sortPositionSub,
          sc_seq : val.SEQ
        })
        if(!val.T_SC_POSITION){
          // TĂNG POSITION MẶC ĐỊNH CHO SREEN NÀO KO CÓ POSITION ĐỂ GÁN CHO NÓ
          sortPositionSub++ 
        }
      }
    });

    const dataResponse = {
      ms_list_data : jsonMainData,
      ss_list_data : jsonSubData
    }

    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
  async getAppScreenDetail(req, res, next) {
    const scCode = req.query.sc_code
    const user = req.userInfo
    const where = `M_MOA_CODE = '${scCode}' AND T_SC_CODE = '${scCode}' AND T_SC_STATUS != 'D'`
    const isExistData = await queriesHelper.getDataCountWhere('TBL_MOA_APP_SCREENS',where)
    console.log('isExistData', isExistData)
    if(isExistData == 0){
      //return error
    }else{

    }
    let haveCondition = 1
    const appInfo = await appBuilderModel.getAppScreenInfo(scCode, user.u_martid)
    const appDetailList = await appBuilderModel.getAppScreenDetailList(scCode,  user.u_martid, haveCondition )
    let jsonDetailData = []

    appDetailList.forEach(val => {
      if(val.T_SC_DT_TMPL_CODE == 'AP00000001'){
        let titleBanner = ""
        let title = ""
        let showTitle = 'No'

        const dataJson = JSON.parse(val.T_SC_DT_TMPL_DATA)
        if(dataJson.tmpl_title){
          titleBanner = dataJson.tmpl_title
        }

        if(dataJson.tmpl_option_title_display){
          title = dataJson.tmpl_title
          showTitle = 'Yes'
        }
        console.log(dataJson)

        const styleData  = getStyleOfTemplate(dataJson.tmpl_style_title)
        jsonDetailData.push({
          tmpl_code : val.T_SC_DT_TMPL_CODE,
          tmpl_name: val.T_TMPL_LABEL,
          tmpl_type: val.T_TMPL_TYPE,
          tmpl_order: parseInt(val.T_SC_DT_TMPL_ORDER),
          tmpl_smp_img: val.T_TMPL_IMG,
          tmpl_user_type: val.T_SC_DT_USER_TYPE,
          tmpl_template_title: titleBanner,
          data_app: composeTypeOneTemplateData(JSON.parse(val.T_SC_DT_TMPL_DATA), user.u_martid, scCode)


        })
      
      }
      
    });

    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success,  messageSuccess.Success));
  }
  

};
