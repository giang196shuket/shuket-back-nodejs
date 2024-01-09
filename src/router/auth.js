var express = require("express");
const  controller  = require("../controller/auth");
const  validation  = require("../validation/auth");
const  middleware  = require("../middleware/auth");

var router = express.Router();


router.post("/login", validation.validationLogin, controller.login);
router.get("/get_list_account_switch",middleware.verifyToken , controller.getListAccountSwitch);


module.exports = router;
