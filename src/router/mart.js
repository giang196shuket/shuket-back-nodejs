var express = require("express");
const  controller  = require("../controller/mart");
const  middleware  = require("../middleware/auth");

var router = express.Router();


router.get("/moa_search_list", middleware.verifyToken, controller.moaSearchList);



module.exports = router;
