var express = require("express");
const  controllerAccount  = require("../controller/user/account");
const  controllerLevel  = require("../controller/user/level");

const  middleware  = require("../middleware/auth");

var router = express.Router();


router.post("/search_list",  middleware.verifyToken, controllerAccount.getUserSearchList);
router.get("/get_progs_role_by_id",  middleware.verifyToken, controllerAccount.getProgsRoleById);
router.get("/search_level_list",  middleware.verifyToken, controllerLevel.getLevelSearchList);


module.exports = router;
