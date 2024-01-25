var express = require("express");
const  controller  = require("../controller/mart/mart");
const  middleware  = require("../middleware/auth");
const { upload } = require("../service/uploadS3");

var router = express.Router();


router.post("/moa_search_list", middleware.verifyToken, controller.moaSearchList);
router.get("/get_detail_mart", middleware.verifyToken, controller.getDetailMart);
router.post("/upload_mart_logo", middleware.verifyToken, upload.single('image'), controller.uploadMartLogo);
router.get("/get_mart_options", middleware.verifyToken, controller.getMartOptions);


module.exports = router;
