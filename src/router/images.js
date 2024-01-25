var express = require("express");
const  controllerBannerCoupon  = require("../controller/images/bannerCoupon");
const  controllerProductBarcode  = require("../controller/images/productBarcode");
const  controllerProductNoBarcode  = require("../controller/images/productNoBarcode");

const  middleware  = require("../middleware/auth");
const { upload } = require("../service/uploadS3");

var router = express.Router();


router.post("/get_images",  middleware.verifyToken, controllerBannerCoupon.getImages);
router.post("/add",  middleware.verifyToken, upload.array('muti_file'), controllerBannerCoupon.addImages);
router.get("/cate_images",  middleware.verifyToken, controllerBannerCoupon.getCatesImages);
router.post("/get_list_images_with_barcode",  middleware.verifyToken, controllerProductBarcode.getListProductWithBarcode);
router.post("/get_list_images_without_barcode",  middleware.verifyToken, controllerProductNoBarcode.getListProductWithoutBarcode);

module.exports = router;
