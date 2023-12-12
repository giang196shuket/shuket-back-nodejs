var express = require("express");
const  controller  = require("../controller/main");
const  middleware  = require("../middleware/auth");

var router = express.Router();


router.get("/get_user_profile", middleware.verify_token, controller.get_user_profile);
router.get("/get_moa_setting_config",  controller.get_moa_setting_config);
router.get("/get_general_statistics",  middleware.verify_token, controller.get_general_statistics);
router.get("/get_left_menu_bar",  middleware.verify_token, controller.get_left_menu_bar);


module.exports = router;
