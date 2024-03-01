const { bannerDefault, bucketImage, textDeFault, martBGColorDefault } = require("../../helper/const");
const { getLimitQuery } = require("../../helper/funtion");
const { messageSuccess } = require("../../helper/message");
const queriesHelper = require("../../helper/queries");
const { responseSuccess, reponseAppInfo } = require("../../helper/response");
const appInfoModel = require("../../model/appInfo/appInfo");
const { loadImageAws } = require("../../service/loadImage");



module.exports = {

  async getMoaMartInfoApp(req, res, next) {
    const user = req.userInfo
    const row = await appInfoModel.getMoaMartInfoApp(user.u_martid)

    const bizhourArr = row.M_BIZHOUR.split(':')
    
    //custom list notice of mart : max 3 notice
    let isShowSlideNoti = 0  // not show time input set slide notice app when empty
    let noticeList = []
    if(!row.M_NOTICE_APP){
        noticeList.push({
            id: 'noti_app_1',
            name:''
        })
    }else{
       const dataNotice =  row['M_NOTICE_APP'].split("#noti_part#");
       dataNotice.forEach((itemNoti,index) => {
            noticeList.push({
                id: `noti_app_${index+1}`,
                name: itemNoti
            })
       });
       if(dataNotice.length > 0){
        isShowSlideNoti = 1  //  show time input set slide notice app 
       }
    }

    // tiến hành gán giá trị pick up cho mart
    let timePickUpStart = ""
    let timePickUpEnd = ""
    if(row.USE_PICKUP === 'Y'){
        timePickUpStart = row.M_PICKUP_START ? row.M_PICKUP_START : ""
        timePickUpEnd = row.M_PICKUP_END ? row.M_PICKUP_END : ""
    }
    //kết thúc gán giá trị pick up cho mart

    //GÁN CÁC GIÁ TRỊ CUSTOM
    let cateScreenCode = ""
    let reviewPush = 'N'
    let reviewPushHour =''
    let reviewPushDays = ''
    let reviewPushTime = '30'
    let reviewPushContent = ''
    let cartPush = 'N'
    let cartPushDays = ''
    let cartPushHour =''
    let cartPushTime = '30'
    let cartPushContent = ''
    let showMartCompanyInfo = 'N'
    const martName = row.MART_NAME
    const license = row.M_LICENSE
    const contactName = row.M_CONTACT_NAME
    const cs_line1 = row.CS_LINE1
    const cs_line2 = row.CS_LINE2

    if(row.SHOW_MART_INFO_COMPANY === 'Y'){
        showMartCompanyInfo = 'Y'
    }

    if(row.IS_CUSTOM_APP === 'Y'){
        //PUO =>REVIEW
        const dataReview = await queriesHelper.getRowDataWhere('TBL_MOA_MART_CONFIG_CUSTOM',
        ` TYPE = 'PUO' AND STATUS = 'A' AND M_MOA_CODE = '${user.u_martid}'`)
        if(dataReview.DATA_CONFIG){
            const data = JSON.parse(dataReview.DATA_CONFIG)
            reviewPush = data.reviewpush
            reviewPushDays = data.reviewpushdays
            reviewPushHour = data.reviewpushhour
            reviewPushTime = data.reviewPushTime
            reviewPushContent = data.reviewpushcontent
        }
        //PUC =>CART
        const dataCart = await queriesHelper.getRowDataWhere('TBL_MOA_MART_CONFIG_CUSTOM',
        ` TYPE = 'PUC' AND STATUS = 'A' AND M_MOA_CODE = '${user.u_martid}'`)
        if(dataCart.DATA_CONFIG){
            const data = JSON.parse(dataCart.DATA_CONFIG)
            cartPush = data.cartpush
            cartPushDays = data.cartpushdays
            cartPushHour = data.cartpushhour
            cartPushTime = data.cartpushtime
            cartPushContent = data.cartpushcontent
        }
        //MBT => SCREEN
        const dataScreen = await queriesHelper.getRowDataWhere('TBL_MOA_MART_CONFIG_CUSTOM',
        ` TYPE = 'MBT' AND STATUS = 'A' AND M_MOA_CODE = '${user.u_martid}'`)
        //RCT = > RECEIVE
        //DLC => ORDER
        //DLN => DELIVERY
        if(dataScreen.DATA_CONFIG){
            cateScreenCode = dataScreen.DATA_CONFIG
        }else{
            cateScreenCode = await appInfoModel.getScreenDefaultByMart(user.u_martid)
        }
    }
   
    const martInfo = {
        bizhourOpen : bizhourArr[0],
        bizhourClose : bizhourArr[1],
        bannerAppUrl : row.M_BANNER_APP ? await loadImageAws(row.M_BANNER_APP , bucketImage.bannerapp) : await loadImageAws(bannerDefault , bucketImage.bannerapp),
        logoAppUrl : row.M_LOGO_APP ? await loadImageAws(row.M_LOGO_APP , bucketImage.logoapp) : await loadImageAws(row.M_LOGO , bucketImage.logoapp),
        notice: noticeList, // list notice trên app
        ...reponseAppInfo(row, isShowSlideNoti, timePickUpStart, timePickUpEnd, cateScreenCode, reviewPush, reviewPushHour, reviewPushDays,
        reviewPushTime, reviewPushContent, cartPush, cartPushHour, cartPushDays, cartPushTime, cartPushContent, showMartCompanyInfo, martName,
        license, contactName, cs_line1, cs_line2)
    }
    
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, martInfo));
  },

};
