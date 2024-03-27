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
router.post("/update_product",  middleware.verifyToken, controllerRegisted.updateProduct);

//unregisted
router.post("/search_product_unregistered_list",  middleware.verifyToken, controllerUnregisted.searchProductUnregisteredList);
router.post("/register_product",  middleware.verifyToken, controllerUnregisted.registerProduct);
router.post("/register_product_multi",  middleware.verifyToken, controllerUnregisted.registerProductMulti);

//inventory
router.post("/search_product_inventory_list",  middleware.verifyToken, controllerInventory.searchProductInventoryList);

//price
router.post("/search_product_price_list",  middleware.verifyToken, controllerPrice.searchProductPriceList);
router.post("/set_price_for_product",  middleware.verifyToken, controllerPrice.setPriceForProduct);
router.post("/delete_price_product",  middleware.verifyToken, controllerPrice.deletePriceProduct);



//COMMON
router.post("/setting_all_max_min_product",  middleware.verifyToken, controller.settingAllMaxMinProduct); // cho toàn bộ product
router.post("/setting_all_stock_product",  middleware.verifyToken, controller.settingAllStockProduct); // cho toàn bộ product

router.post("/update_status",  middleware.verifyToken, controller.updateStatus);
router.post("/update_multi_prd",  middleware.verifyToken, controller.updateStatusMulti);
router.post("/get_product_categories",  middleware.verifyToken, controller.getProductCategory);

module.exports = router;
