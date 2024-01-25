var express = require("express");
const  controller  = require("../controller/order/order");
const  middleware  = require("../middleware/auth");

var router = express.Router();

router.post("/get_order_list",  middleware.verifyToken, controller.getOrderList);


module.exports = router;
