var express = require("express");
const  controller  = require("../controller/product/registed");
const  middleware  = require("../middleware/auth");

var router = express.Router();


router.post("/search_product_registered_list",  middleware.verifyToken, controller.searchProductRegisteredList);
router.post("/update_stock_item",  middleware.verifyToken, controller.updateStockItem);
router.post("/product_stock_status",  middleware.verifyToken, controller.productStockStatus);
router.post("/set_max_min_product",  middleware.verifyToken, controller.setMaxMinProduct);
router.get("/view_detail",  middleware.verifyToken, controller.viewDetailProduct);
router.post("/search_product_images",  middleware.verifyToken, controller.searchProductImages);

module.exports = router;
