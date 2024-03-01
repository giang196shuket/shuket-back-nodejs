var express = require("express");
const  controllerRegisted  = require("../controller/product/registed");
const  controllerUnregisted  = require("../controller/product/unregisted");
const  controllerInventory = require("../controller/product/inventory");
const  controllerPrice = require("../controller/product/price");
const  controller = require("../controller/product/common");

const  middleware  = require("../middleware/auth");

var router = express.Router();

//registed
router.post("/search_product_registered_list",  middleware.verifyToken, controllerRegisted.searchProductRegisteredList);
router.post("/update_stock_item",  middleware.verifyToken, controllerRegisted.updateStockItem);
router.post("/product_stock_status",  middleware.verifyToken, controllerRegisted.productStockStatus);
router.post("/set_max_min_product",  middleware.verifyToken, controllerRegisted.setMaxMinProduct);
router.get("/view_detail",  middleware.verifyToken, controllerRegisted.viewDetailProduct);
router.post("/search_product_images",  middleware.verifyToken, controllerRegisted.searchProductImages);

//unregisted
router.post("/search_product_unregistered_list",  middleware.verifyToken, controllerUnregisted.searchProductUnregisteredList);

//inventory
router.post("/search_product_inventory_list",  middleware.verifyToken, controllerInventory.searchProductInventoryList);

//price
router.post("/search_product_price_list",  middleware.verifyToken, controllerPrice.searchProductPriceList);

//COMMON
router.post("/update_status",  middleware.verifyToken, controller.updateStatus);
router.post("/get_product_categories",  middleware.verifyToken, controller.getProductCategory);

module.exports = router;
