var express = require("express");
const  controller  = require("../controller/mart");
const  middleware  = require("../middleware/auth");

var router = express.Router();


router.post("/moa_search_list", middleware.verifyToken, controller.moaSearchList);
router.get("/get_detail_mart", middleware.verifyToken, controller.getDetailMart);



module.exports = router;
