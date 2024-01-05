var express = require("express");
const  controller  = require("../controller/partner");
const  middleware  = require("../middleware/auth");

var router = express.Router();


router.get("/get_partner_options",  middleware.verifyToken, controller.getPartnerOptions);
router.get("/get_partner_sales_team_options",  middleware.verifyToken, controller.getPartnerSalesTeamOptions);


module.exports = router;
