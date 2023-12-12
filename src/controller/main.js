const logger = require("../../config/logger");
const { generate_token } = require("../service/auth");
const { messageError, messageSuccess } = require("../helper/message");
const { responseSuccess, responseErrorData } = require("../helper/response");
const mainModel = require("../model/main");
const { load_image_aws } = require("../service/loadImage");
const userModel = require("../model/user");
const { mergeRoleList } = require("../helper/funtion");

module.exports = {    
   
    async get_user_profile(req, res, next) {
        const logBase = `controller/main/get_user_profile: `;
        let dataResponse = {}
        const user = req.body
        const userProfile = await mainModel.get_user_profile(user.user_id)
        if(userProfile){
            dataResponse.user_name = userProfile.U_NAME
            dataResponse.user_role = userProfile.U_LEVEL_TYPE
            dataResponse.user_level = userProfile.U_LEVEL
            dataResponse.user_status = userProfile.U_STATUS
            if (userProfile.M_LOGO !== "") {
                dataResponse.mart_logo = await load_image_aws(userProfile.M_LOGO, 'mart/logo');
              }
            if (userProfile.M_LOGO_PUSH !== "") {
                dataResponse.mart_logo_push = await load_image_aws(userProfile.M_LOGO_PUSH, 'mart/logo');
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
            const martSwitch = await mainModel.get_mart_info_switch(user.u_martid);
            if (martSwitch.M_LOGO !== "") {
                dataResponse.mart_logo = await load_image_aws(martSwitch.M_LOGO, 'mart/logo');
            }
            if (martSwitch.M_LOGO_PUSH !== "") {
                dataResponse.mart_logo_push = await load_image_aws(martSwitch.M_LOGO_PUSH, 'mart/logo');
            }
            dataResponse.mart_name = userProfile.M_NAME

        }
        if (user.u_martid != "") {
           const listQA = await mainModel.get_list_qa_not_relay(user.u_martid);
           dataResponse.count_qa = listQA?.total_cnt ? listQA.total_cnt : 0
           dataResponse.list_qa = listQA?.data ? listQA.data : []
        
          } else {
            dataResponse.count_qa = 0
            dataResponse.list_qa = []
          }
        return  res.status(200).json(responseSuccess(200, messageSuccess.Success, dataResponse));
    },

    async get_moa_setting_config(req, res, next){
        const logBase = `controller/main/get_moa_setting_config: `;
        let moaBannerHotline = '';
        let isUseBanner = 'N';
        const settingConfig = await mainModel.get_moa_setting_config()
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

    async get_general_statistics(req, res, next)
    {
      const logBase = `controller/main/get_general_statistics: `;
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
    async get_left_menu_bar(req, res, next)
    {
      const logBase = `controller/main/get_left_menu_bar: `;
      const user = req.body
      const currentUserProgs = await userModel.select_progs_role_by_user(user)
      const levelProgs = await userModel.select_progs_role_by_level(user.level_id)

     const arrCateCodes = levelProgs?.map((r) => r.U_CATE_CODE);

     const listProgs = await mergeRoleList(currentUserProgs, arrCateCodes);
     const data = {
        data: {
            left_menu: listProgs,
          },
     };


      return res.status(200).json(responseSuccess(200, messageSuccess.Success,data ))
    }
}