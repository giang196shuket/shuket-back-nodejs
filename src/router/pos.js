var express = require("express");
const  controller  = require("../controller/pos");
const  middleware  = require("../middleware/auth");

var router = express.Router();


router.get("/get_pos_options",  middleware.verifyToken, controller.getPosOptions);


module.exports = router;
