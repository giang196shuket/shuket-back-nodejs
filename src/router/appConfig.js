var express = require("express");
const  controller  = require("../controller/appConfig/appConfig");
const  middleware  = require("../middleware/auth");

var router = express.Router();


router.get("/get_app_version_list",  middleware.verifyToken, controller.getAppVersionList);


module.exports = router;
