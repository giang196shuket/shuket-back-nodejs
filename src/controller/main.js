const logger = require("../../config/logger");
const { generate_token } = require("../service/auth");
const { messageError, messageSuccess } = require("../helper/message");
const { responseSuccess, responseErrorData } = require("../helper/response");
const mainModel = require("../model/main");
const { loadImageAws } = require("../service/loadImage");
const userModel = require("../model/user");



async function mergeRoleList(menuUser) {

  let list = [];
  menuUser.forEach((ele) => {
    if (ele.U_CATE_DEPT === 1) {
      list.push({
        group_code: ele.U_CATE_CODE,
        group_route: ele.URL,
        group_sort: ele.SORT_ORDER,
        group_names: {
          vn: ele.U_CATE_NAME,
          en: ele.U_CATE_NAME_EN,
          kr: ele.U_CATE_NAME_KR,
        },
        group_items: menuUser
          .filter((cu) => cu.U_CATE_PCD === ele.U_CATE_CODE)
          .map(function (cate) {
            //cate la depp2
            if (cate.U_CATE_DEPT !== 1) {
              return {
                code: cate.U_CATE_CODE,
                route: cate.URL,
                sort2: cate.SORT_ORDER,
                name: {
                  vn: cate.U_CATE_NAME,
                  en: cate.U_CATE_NAME_EN,
                  kr: cate.U_CATE_NAME_KR,
                },
                sub_items: menuUser
                  .filter((c) => c.U_CATE_PCD === cate.U_CATE_CODE)
                  .map(function (c) {
                    //c la depp3
                    return {
                      code: c.U_CATE_CODE,
                      route: c.URL,
                      sort3: c.SORT_ORDER,
                      name: {
                        vn: c.U_CATE_NAME,
                        en: c.U_CATE_NAME_EN,
                        kr: c.U_CATE_NAME_KR,
                      },
                    };
                  }),
              };
            }
          })
          .filter((gi) => gi !== undefined),
      });
    }
  });
  return list;
}

module.exports = {
  async getUserProfile(req, res, next) {
    const logBase = `controller/main/getUserProfile: `;
    let dataResponse = {};
    const user = req.userInfo;
    const userProfile = await mainModel.getUserProfile(user.user_id);
    if (userProfile) {
      dataResponse.user_name = userProfile.U_NAME;
      dataResponse.user_role = userProfile.U_LEVEL_TYPE;
      dataResponse.user_level = userProfile.U_LEVEL;
      dataResponse.user_status = userProfile.U_STATUS;
      if (userProfile.M_LOGO !== "") {
        dataResponse.mart_logo = await loadImageAws(
          userProfile.M_LOGO,
          "mart/logo"
        );
      }
      if (userProfile.M_LOGO_PUSH !== "") {
        dataResponse.mart_logo_push = await loadImageAws(
          userProfile.M_LOGO_PUSH,
          "mart/logo"
        );
      }
      dataResponse.mart_name = userProfile.M_NAME;
    }
    if (user.is_change === 0) {
      dataResponse.is_change = 0;
      dataResponse.old_userid = user.old_userid;
      dataResponse.old_martid = "";
      dataResponse.old_ulevel = user.old_ulevel;
      dataResponse.sw_level = user.old_ulevel;
      dataResponse.user_status = userProfile.U_STATUS;
    } else {
      dataResponse.is_change = 1;
      dataResponse.old_userid = user.old_userid;
      dataResponse.old_martid = user.old_martid;
      dataResponse.old_ulevel = user.old_ulevel;
      dataResponse.old_user_role = userProfile.U_LEVEL_TYPE;
      dataResponse.old_user_name = userProfile.U_NAME;
      dataResponse.sw_level = user.old_ulevel;
      dataResponse.user_status = "A";
      const martSwitch = await mainModel.getMartInfoSwitch(user.u_martid);
      if (martSwitch.M_LOGO !== "") {
        dataResponse.mart_logo = await loadImageAws(
          martSwitch.M_LOGO,
          "mart/logo"
        );
      }
      if (martSwitch.M_LOGO_PUSH !== "") {
        dataResponse.mart_logo_push = await loadImageAws(
          martSwitch.M_LOGO_PUSH,
          "mart/logo"
        );
      }
      dataResponse.mart_name = userProfile.M_NAME;
    }
    if (user.u_martid != "") {
      const listQA = await mainModel.getListQaNotRelay(user.u_martid);
      dataResponse.count_qa = listQA.total_cnt ? listQA.total_cnt : 0;
      dataResponse.list_qa = listQA.data ? listQA.data : [];
    } else {
      dataResponse.count_qa = 0;
      dataResponse.list_qa = [];
    }
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },

  async getMoaSettingConfig(req, res, next) {
    const logBase = `controller/main/getMoaSettingConfig: `;
    let moaBannerHotline = "";
    let isUseBanner = "N";
    const settingConfig = await mainModel.getMoaSettingConfig();
    console.log("settingConfig", settingConfig);
    if (settingConfig.IS_USE === "Y") {
      moaBannerHotline = settingConfig.CONFIG_VALUE;
    } else {
      moaBannerHotline = "customer_banner.png";
    }
    isUseBanner = "Y";
    const result = {
      data: {
        moa_banner: moaBannerHotline,
        use_banner_hotline: isUseBanner,
      },
    };
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, result));
  },

  async getGeneralStatistics(req, res, next) {
    const logBase = `controller/main/getGeneralStatistics: `;
    const user = req.userInfo;

    let dataRes = {
      user: {
        active_this_month: "0%",
        new_this_month: 0,
      },
      display: {
        product: 0,
        leaflet: 0,
      },
      push: {
        sent: 0,
        read: "0%",
      },
      coupon: {
        issued: 0,
        use_this_month: "0%",
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
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataRes));
  },
  async getLeftMenuBar(req, res, next) {
    const logBase = `controller/main/getLeftMenuBar: `;
    console.time('GET');
    const user = req.userInfo;
    // const currentUserProgs = await userModel.selectProgsRoleByUser(user);
    // const levelProgs = await userModel.selectProgsRoleByLevel(user.level_id);
    const menuUser = await userModel.getMenuByUser(user)
    console.timeEnd('GET');

    const listProgs = await mergeRoleList(menuUser);
    const data = {
      left_menu: listProgs,
    };

    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, data));
  },
  async getTypeMart(req, res, next) {
    const data = await mainModel.getTypeMart();
    const listType = await data.map((item) => ({
      code: item.C_CODE,
      name: {
        en: item.NAME_EN,
        kr: item.NAME_KR,
      },
    }));
    const dataResponse = {
      list_type_mart: listType,
    };
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
  async getCityOptions(req, res, next) {
    const data = await mainModel.getCityOptions()
    const listCity = await data.map((item) => ({
      code: item.CT_CODE,
      name: {
        en: item.CT_NAME_EN,
        kr: item.CT_NAME_KR,
      },
    }));
    const dataResponse = {
      list_cities: listCity,
    };
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },

  async getDistrictOptions(req, res, next) {
    const ctCode = req.query.ct_code
    const data = await mainModel.getDistrictOptions(ctCode)
    const listDistricts = await data.map((item) => ({
      code: item.DT_CODE,
      name: {
        en: item.DT_NAME_EN,
        kr: item.DT_NAME_KR,
      },
    }));
    const dataResponse = {
      list_districts: listDistricts,
    };
    return res
    .status(200)
    .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },

};
