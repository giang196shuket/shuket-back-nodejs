var express = require("express");
const  controller  = require("../controller/auth");
const  validation  = require("../validation/auth");

var router = express.Router();


router.get("/login", validation.validation_login, controller.login);


module.exports = router;
