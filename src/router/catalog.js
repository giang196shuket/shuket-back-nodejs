var express = require("express");
const  controller  = require("../controller/catalog/catalog");
const  middleware  = require("../middleware/auth");

var router = express.Router();


router.get("/get_list",  middleware.verifyToken, controller.getList);



module.exports = router;
