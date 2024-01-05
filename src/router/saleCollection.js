var express = require("express");
const  controller  = require("../controller/saleCollection");
const  middleware  = require("../middleware/auth");

var router = express.Router();


router.post("/moa_search_list", middleware.verifyToken, controller.moaSearchList);
router.get("/get_detail_mart", middleware.verifyToken, controller.getDetailMart);
router.get("/get_mart_common_where", middleware.verifyToken, controller.getMartCommonWhere);


module.exports = router;
