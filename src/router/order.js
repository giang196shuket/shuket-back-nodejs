var express = require("express");
const  controllerOrder  = require("../controller/order/order");
const  controllerProduct  = require("../controller/order/product");

const  middleware  = require("../middleware/auth");

var router = express.Router();

//order list
router.post("/get_order_list", middleware.verifyToken, controllerOrder.getOrderList);
router.get("/get_list_payment_cart", middleware.verifyToken, controllerOrder.getListPaymentCart);
router.get("/get_list_status_order", middleware.verifyToken, controllerOrder.getListStatusOrder);
router.get("/get_list_delivery_time", middleware.verifyToken, controllerOrder.getListDeliveryTime);
router.get("/get_mart_order_minimum", middleware.verifyToken, controllerOrder.getMartOrderMinimum);

//report product order
router.post("/search_product_order", middleware.verifyToken, controllerProduct.searchProductOrder);
router.get("/list_filter_cate", middleware.verifyToken, controllerProduct.getListCate);

module.exports = router;
