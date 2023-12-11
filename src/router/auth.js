var express = require("express");
const  auth  = require("../controller/auth");
var router = express.Router();


router.get("/login", auth.login);


module.exports = router;
