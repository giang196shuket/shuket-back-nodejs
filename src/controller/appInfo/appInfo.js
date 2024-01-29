const { bannerDefault, bucketImage, textDeFault, martBGColorDefault } = require("../../helper/const");
const { getLimitQuery } = require("../../helper/funtion");
const { messageSuccess } = require("../../helper/message");
const queriesHelper = require("../../helper/queries");
const { responseSuccess } = require("../../helper/response");
const appConfigModel = require("../../model/appConfig/appConfig");
const appInfoModel = require("../../model/appInfo/appInfo");
const catalogModel = require("../../model/catalog/catalog");
const mainModel = require("../../model/main/main");
const martModel = require("../../model/mart/mart");
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
        moaCode : row.M_MOA_CODE,
        bizhourOpen : bizhourArr[0],
        bizhourClose : bizhourArr[1],
        bannerAppUrl : row.M_BANNER_APP ? loadImageAws(row.M_BANNER_APP , bucketImage.bannerapp) : loadImageAws(bannerDefault , bucketImage.bannerapp),
        logoAppUrl : row.M_LOGO_APP ? loadImageAws(row.M_LOGO_APP , bucketImage.logoapp) : loadImageAws(row.M_LOGO , bucketImage.logoapp),
        phone: row.M_PHONE,
        martIntroApp : row.M_INTRO_APP ? row.M_INTRO_APP : row.M_NAME + textDeFault.intro1 + row.M_NAME + textDeFault.intro2,
        notice: noticeList, // list notice trên app
        isUploadLogo: 0,
        isUploadBanner : 0,
        isShowSlideNoti: isShowSlideNoti, // ẩn hay hiện slide notice
        martBGClorApp : row.M_COLOR_APP ? row.M_COLOR_APP : martBGColorDefault,
        timeSlideNoti: row.M_TIME_SET_SLIDE_APP ? row.M_TIME_SET_SLIDE_APP : 3, // thời gian chuyển slide 
        cTime: row.C_TIME ? row.C_TIME : '',
        mTime: row.M_TIME ? row.M_TIME :"",
        cName: row.C_NAME ? row.C_NAME : "",
        mName: row.M_NAME ? row.M_NAME : "",
        address: row.M_ADDRESS,
        city:{
            code: row.CT_CODE,
            name: row.CT_NAME_KR
        },
        district : {
            code: row.DT_CODE,
            name: row.DT_NAME_KR
        },
        setDelivery: row.USE_DELIVERY,
        pickupSetHour: row.USE_PICKUP,
        pickupCod : row.USE_PICKUP_COD,
        pickupStartHour: timePickUpStart,
        pickupEndHour: timePickUpEnd,
        setIntro: row.USE_INTRO,
        cateScreenCode: cateScreenCode,
        reviewPush: reviewPush,
        reviewPushHour: reviewPushHour,
        reviewPushDays: reviewPushDays,
        reviewPushTime: reviewPushTime,
        reviewPushContent: reviewPushContent,
        cartPush: cartPush,
        cartPushHour: cartPushHour,
        cartPushDays: cartPushDays,
        cartPushTime: cartPushTime,
        cartPushContent: cartPushContent,
        showMartCompanyInfo: showMartCompanyInfo,
        martName: martName,
        license: license,
        contactName: contactName,
        csLine1 :cs_line1,
        csLine2: cs_line2
    }
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, martInfo));
  },

};
