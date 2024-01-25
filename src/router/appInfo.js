var express = require("express");
const  controller  = require("../controller/appInfo/appInfo");
const  middleware  = require("../middleware/auth");

var router = express.Router();


router.get("/get_moa_mart_info_app",  middleware.verifyToken, controller.getMoaMartInfoApp);


module.exports = router;
