var express = require("express");
const  controllerMoaNotice  = require("../controller/notice/moaNotice");
const  controllerAppNotice  = require("../controller/notice/appNotice");

const  middleware  = require("../middleware/auth");

var router = express.Router();

// moa 
router.get("/get_notice_list",  middleware.verifyToken, controllerMoaNotice.getNoticeList);

// app
router.post("/get_list_noti_msg",  middleware.verifyToken, controllerAppNotice.getListNotice);


module.exports = router;
