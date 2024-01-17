var express = require("express");
const  controller  = require("../controller/appBuilder/appBuilder");
const  middleware  = require("../middleware/auth");

var router = express.Router();


router.get("/get_screen_builder",  middleware.verifyToken, controller.getScreenBuilder);
router.get("/get_app_screen_detail",  middleware.verifyToken, controller.getAppScreenDetail);


module.exports = router;
