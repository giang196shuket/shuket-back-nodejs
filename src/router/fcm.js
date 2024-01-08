var express = require("express");
const  controller  = require("../controller/fcm");
const  middleware  = require("../middleware/auth");

var router = express.Router();


router.get("/get_fcm_options",  middleware.verifyToken, controller.getPosOptions);


module.exports = router;
