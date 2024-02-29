var express = require("express");
const  controller  = require("../controller/main/main");


const  middleware  = require("../middleware/auth");

var router = express.Router();

//for dashboard page
router.get("/get_user_profile", middleware.verifyToken, controller.getUserProfile);
router.get("/get_moa_setting_config",  controller.getMoaSettingConfig);
router.get("/get_general_statistics",  middleware.verifyToken, controller.getGeneralStatistics);
// GSK	G-SHUKET // N	Unused App // SG	SINGLE SHUKET // SK	SHUKET// YSK	Y-SHUKET
router.get("/get_type_mart",  middleware.verifyToken, controller.getTypeMart);
//for menu
router.get("/get_left_menu_bar",  middleware.verifyToken, controller.getLeftMenuBar);
//for address select list
router.get("/get_city_options",  middleware.verifyToken, controller.getCityOptions);
router.get("/get_district_options",  middleware.verifyToken, controller.getDistrictOptions);
//data for of filter search mart list
router.get("/get_db_connect", middleware.verifyToken, controller.getDBConnect);
//for partner
router.get("/get_partner_options",  middleware.verifyToken, controller.getPartnerOptions);
router.get("/get_partner_sales_team_options",  middleware.verifyToken, controller.getPartnerSalesTeamOptions);
//for pos
router.get("/get_pos_options",  middleware.verifyToken, controller.getPosOptions);
//for switch account auth
router.get("/get_list_account_switch",middleware.verifyToken , controller.getListAccountSwitch);
//for manager mart account page
router.get("/level_options",  middleware.verifyToken, controller.getLevelOptions);
router.get("/group_options",  middleware.verifyToken, controller.getGroupOptions);


module.exports = router;
