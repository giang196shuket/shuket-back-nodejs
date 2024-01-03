const logger = require("../../config/logger");
const { generate_token } = require("../service/auth");
const { messageError, messageSuccess } = require("../helper/message");
const { responseSuccess, responseErrorData } = require("../helper/response");
const mainModel = require("../model/main");
const { loadImageAws } = require("../service/loadImage");
const userModel = require("../model/user");
const { mergeRoleList } = require("../helper/funtion");

module.exports = {    
   
    async getUserProfile(req, res, next) {
        const logBase = `controller/main/getUserProfile: `;
        let dataResponse = {}
        const user = req.body
        const userProfile = await mainModel.getUserProfile(user.user_id)
        if(userProfile){
            dataResponse.user_name = userProfile.U_NAME
            dataResponse.user_role = userProfile.U_LEVEL_TYPE
            dataResponse.user_level = userProfile.U_LEVEL
            dataResponse.user_status = userProfile.U_STATUS
            if (userProfile.M_LOGO !== "") {
                dataResponse.mart_logo = await loadImageAws(userProfile.M_LOGO, 'mart/logo');
              }
            if (userProfile.M_LOGO_PUSH !== "") {
                dataResponse.mart_logo_push = await loadImageAws(userProfile.M_LOGO_PUSH, 'mart/logo');
            }
            dataResponse.mart_name = userProfile.M_NAME

        }
        if(user.is_change === 0){
            dataResponse.is_change = 0
            dataResponse.old_userid = user.old_userid
            dataResponse.old_martid = ''
            dataResponse.old_ulevel = user.old_ulevel
            dataResponse.sw_level = user.old_ulevel
            dataResponse.user_status = userProfile.U_STATUS
        }else{
            dataResponse.is_change = 1
            dataResponse.old_userid = user.old_userid
            dataResponse.old_martid = user.old_martid
            dataResponse.old_ulevel = user.old_ulevel
            dataResponse.old_user_role = userProfile.U_LEVEL_TYPE
            dataResponse.old_user_name = userProfile.U_NAME
            dataResponse.sw_level = user.old_ulevel
            dataResponse.user_status = 'A'
            const martSwitch = await mainModel.getMartInfoSwitch(user.u_martid);
            if (martSwitch.M_LOGO !== "") {
                dataResponse.mart_logo = await loadImageAws(martSwitch.M_LOGO, 'mart/logo');
            }
            if (martSwitch.M_LOGO_PUSH !== "") {
                dataResponse.mart_logo_push = await loadImageAws(martSwitch.M_LOGO_PUSH, 'mart/logo');
            }
            dataResponse.mart_name = userProfile.M_NAME

        }
        if (user.u_martid != "") {
           const listQA = await mainModel.getListQaNotRelay(user.u_martid);
           dataResponse.count_qa = listQA.total_cnt ? listQA.total_cnt : 0
           dataResponse.list_qa = listQA.data ? listQA.data : []
        
          } else {
            dataResponse.count_qa = 0
            dataResponse.list_qa = []
          }
        return  res.status(200).json(responseSuccess(200, messageSuccess.Success, dataResponse));
    },

    async getMoaSettingConfig(req, res, next){
        const logBase = `controller/main/getMoaSettingConfig: `;
        let moaBannerHotline = '';
        let isUseBanner = 'N';
        const settingConfig = await mainModel.getMoaSettingConfig()
        console.log('settingConfig', settingConfig)
        if(settingConfig.IS_USE === 'Y'){
            moaBannerHotline = settingConfig.CONFIG_VALUE
        }else{
            moaBannerHotline = 'customer_banner.png';
        }
        isUseBanner = 'Y';
        const result = { data :{
            moa_banner: moaBannerHotline,
            use_banner_hotline : isUseBanner
        } }
        return res.status(200).json(responseSuccess(200, messageSuccess.Success,result ))
    },

    async getGeneralStatistics(req, res, next)
    {
      const logBase = `controller/main/getGeneralStatistics: `;
      const user = req.body

      let dataRes = {
        user: {
            active_this_month: '0%',
            new_this_month: 0,
        },
        display: {
          product: 0,
          leaflet: 0,
        },
        push: {
          sent: 0,
          read: '0%',
        },
        coupon: {
          issued: 0,
          use_this_month: '0%',
        },
        shopping: {
          sale_revenue: 0,
          delivery_today: 0,
        },
        payment: {
          success: 0,
          fail: 0,
        },
      };
      
      if (user.level_id < 300) {
        dataRes.mart = {
            active_this_month: 0,
            new_this_month: 0,
            canceled_this_month: 0,
        };
      }
      return res.status(200).json(responseSuccess(200, messageSuccess.Success,dataRes ))
    },
    async getLeftMenuBar(req, res, next)
    {
      const logBase = `controller/main/getLeftMenuBar: `;
      const user = req.body
      const currentUserProgs = await userModel.selectProgsRoleByUser(user)
      const levelProgs = await userModel.selectProgsRoleByLevel(user.level_id)
      let arrCateCodes = []
       arrCateCodes = await levelProgs.sort(function(item1, item2) {
        if (item1.SORT_ORDER > item2.SORT_ORDER) return 1;
        if (item1.SORT_ORDER < item2.SORT_ORDER) return -1;
        return 0
    });
    arrCateCodes = arrCateCodes.map(x => x.U_CATE_CODE)
    console.log('arrCateCodes', arrCateCodes)
     const listProgs = await mergeRoleList(currentUserProgs, arrCateCodes);
     const data = {
            left_menu: listProgs,
     };


      return res.status(200).json(responseSuccess(200, messageSuccess.Success,data ))
    }
}