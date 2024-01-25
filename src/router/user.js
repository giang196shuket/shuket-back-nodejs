var express = require("express");
const  controller  = require("../controller/user/user");
const  middleware  = require("../middleware/auth");

var router = express.Router();


router.post("/search_list",  middleware.verifyToken, controller.getUserSearchList);


module.exports = router;
