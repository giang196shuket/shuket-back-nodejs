var express = require("express");
const  controller  = require("../controller/images/banner_coupon");
const  middleware  = require("../middleware/auth");
const { upload } = require("../service/uploadS3");

var router = express.Router();


router.post("/get_images",  middleware.verifyToken, controller.getImages);
router.post("/add",  middleware.verifyToken, upload.array('muti_file'), controller.addImages);
router.get("/cate_images",  middleware.verifyToken, controller.getCatesImages);


module.exports = router;
