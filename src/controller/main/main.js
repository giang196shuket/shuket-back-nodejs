const logger = require("../../../config/logger");
const { generate_token } = require("../../service/auth");
const { messageError, messageSuccess } = require("../../helper/message");
const { responseSuccess, responseErrorData } = require("../../helper/response");
const mainModel = require("../../model/main/main");
const { loadImageAws } = require("../../service/loadImage");
const userModel = require("../../model/user/user");
const { bucketImage } = require("../../helper/const");

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
        dataResponse.mart_logo = loadImageAws(
          userProfile.M_LOGO,
          bucketImage.martlogo
        );
      }
      if (userProfile.M_LOGO_PUSH !== "") {
        dataResponse.mart_logo_push =  loadImageAws(
          userProfile.M_LOGO_PUSH,
          bucketImage.martlogo
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
        dataResponse.mart_logo = loadImageAws(
          martSwitch.M_LOGO,
          bucketImage.martlogo
        );
      }
      if (martSwitch.M_LOGO_PUSH !== "") {
        dataResponse.mart_logo_push = loadImageAws(
          martSwitch.M_LOGO_PUSH,
          bucketImage.martlogo
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
    console.time("GET");
    const user = req.userInfo;
    // const currentUserProgs = await userModel.selectProgsRoleByUser(user);
    // const levelProgs = await userModel.selectProgsRoleByLevel(user.level_id);
    const menuUser = await userModel.getMenuByUser(user);
    console.timeEnd("GET");

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
    const data = await mainModel.getCityOptions();
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
    const ctCode = req.query.ct_code;
    const data = await mainModel.getDistrictOptions(ctCode);
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

  async getPartnerOptions(req, res, next) {
    const data = await mainModel.getPartnerOptions();
    const listPartners = await data.map((item) => ({
      seq: item.SEQ,
      code: item.SP_CODE,
      name: item.SP_NAME,
    }));
    const dataResponse = {
      list_partners: listPartners,
    };
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },

  async getPartnerSalesTeamOptions(req, res, next) {
    spCode = req.query.sp_code;
    const data = await mainModel.getPartnerSalesTeamOptions(spCode);
    const listSalestTeam = await data.map((item) => ({
      seq: item.SEQ,
      code: item.SPT_CODE,
      name: item.SPT_NAME,
    }));
    const dataResponse = {
      list_sales_team: listSalestTeam,
    };
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },

  async getPosOptions(req, res, next) {
    const data = await mainModel.getPosOptions();
    const listPos = await data.map((item) => ({
      seq: item.SEQ,
      code: item.POS_CODE,
      name: item.POS_NAME,
    }));
    const dataResponse = {
      list_pos: listPos,
    };
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },

  // GROUP_MAIN, TOGETHER
  async getMartCommonWhere(req, res, next) {
    const data = await mainModel.getMartCommonWhere();
    const listDBPos = await data.map((item) => ({
      moa_common_code: item.C_CODE,
      moa_common_name_ko: item.C_KO,
      moa_common_name_en: item.C_ENG,
    }));
    const dataResponse = listDBPos;
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },


  //for import product
  async getListMartImport(req, res, next) {
    const user = req.userInfo;
    let userId = null;
    const rows = await mainModel.getListMartImport();
    if (user.is_change === 1) {
      userId = user.old_userid;
    } else {
      userId = user.user_id;
    }
    const account = await mainModel.getAccountImport(userId);
    const dataResponse = {
      total_cnt: rows.length,
      listmart: rows,
      account: account.U_NAME,
    };
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },

  //list switch account
  async getListAccountSwitch(req, res, next) {
    const data = await mainModel.getListAccountSwitch();
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, data));
  },
  //for manager mart account page
  async getLevelOptions(req, res, next) {
    const result = await mainModel.getLevelOptions();

    const dataResponse = {
      list: result,
    };
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },

  async getGroupOptions(req, res, next) {
    const result = await mainModel.getGroupOptions();
    const dataResponse = {
        list: result,
    };
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
  async getLevelSearchList(req, res, next) {
    const result = await mainModel.getLevelSearchList();
    const dataResponse = {
        list: result,
    };
    return res
      .status(200)
      .json(responseSuccess(200, messageSuccess.Success, dataResponse));
  },
};
