var express = require("express");
const  controller  = require("../controller/main");
const  middleware  = require("../middleware/auth");

var router = express.Router();


router.get("/get_user_profile", middleware.verifyToken, controller.getUserProfile);
router.get("/get_moa_setting_config",  controller.getMoaSettingConfig);
router.get("/get_general_statistics",  middleware.verifyToken, controller.getGeneralStatistics);
router.get("/get_left_menu_bar",  middleware.verifyToken, controller.getLeftMenuBar);


module.exports = router;
