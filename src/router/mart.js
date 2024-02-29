var express = require("express");
const  controller  = require("../controller/mart/mart");
const  middleware  = require("../middleware/auth");
const { upload } = require("../service/uploadS3");
const  validation  = require("../validation/mart");

var router = express.Router();


router.post("/get_moa_mart_list", middleware.verifyToken, controller.getMoaMartList);
router.get("/get_detail_mart", middleware.verifyToken, controller.getDetailMart);
router.post("/upload_mart_logo", middleware.verifyToken, upload.single('image'), controller.uploadMartLogo);
router.get("/get_mart_options", middleware.verifyToken, controller.getMartOptions);
router.post("/update_mart", middleware.verifyToken,  validation.validationMartEdit, controller.updateMart);
router.get("/get_list_group_mart", middleware.verifyToken, controller.getListGroupMart);
router.post("/add_mart",  middleware.verifyToken, validation.validationMartAdd, controller.addMart);


module.exports = router;
