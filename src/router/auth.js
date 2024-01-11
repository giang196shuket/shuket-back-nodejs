var express = require("express");
const  controller  = require("../controller/auth");
const  validation  = require("../validation/auth");
const  middleware  = require("../middleware/auth");

var router = express.Router();


router.post("/login", validation.validationLogin, controller.login);
router.get("/get_list_account_switch",middleware.verifyToken , controller.getListAccountSwitch);
router.get("/user_switch_account/:id",middleware.verifyToken , controller.userSwitchAccount);
router.get("/reset_account",middleware.verifyToken , controller.resetAccount);


module.exports = router;
