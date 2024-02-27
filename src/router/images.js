var express = require("express");
const  controllerBannerCoupon  = require("../controller/images/bannerCoupon");
const  controllerProductBarcode  = require("../controller/images/productBarcode");
const  controllerProductNoBarcode  = require("../controller/images/productNoBarcode");
const  controller = require("../controller/images/common");

const  middleware  = require("../middleware/auth");
const { upload } = require("../service/uploadS3");

var router = express.Router();

//bannerCoupon
router.post("/get_images",  middleware.verifyToken, controllerBannerCoupon.getImages);
router.post("/add",  middleware.verifyToken, upload.array('muti_file'), controllerBannerCoupon.addImages);
router.get("/cate_images",  middleware.verifyToken, controllerBannerCoupon.getCatesImages);
router.post("/upd_banner_status_imgs",  middleware.verifyToken, controllerBannerCoupon.updateBannerStatusImgs);

//productBarcode
router.post("/get_list_images_with_barcode",  middleware.verifyToken, controllerProductBarcode.getListProductWithBarcode);
router.post("/update_status_imgs",  middleware.verifyToken, controller.updateStatusImgs);
router.post("/update_multi_status_imgs",  middleware.verifyToken, controller.updateMultiStatusImgs);

//productNoBarcode
router.post("/get_list_images_without_barcode",  middleware.verifyToken, controllerProductNoBarcode.getListProductWithoutBarcode);

module.exports = router;
