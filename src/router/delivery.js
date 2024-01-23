var express = require("express");
const  controller  = require("../controller/delivery/address");
const  middleware  = require("../middleware/auth");

var router = express.Router();


router.post("/check_address",  middleware.verifyToken, controller.checkAddress);
router.get("/get_mart_delivery_address_list",  middleware.verifyToken, controller.getMartDeliveryAddressList);
router.post("/add_muti_address",  middleware.verifyToken, controller.addMutiAddress);


module.exports = router;
