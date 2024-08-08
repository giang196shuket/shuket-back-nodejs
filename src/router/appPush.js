var express = require("express");
const  controllerAddPush  = require("../controller/appPush/addPush");

const  middleware  = require("../middleware/auth");
const uploadStaticApp = require("../service/uploadStaticApp");

var router = express.Router();


router.post("/insertImageEditor/ckfinder/core/connector/php/connector.php",  uploadStaticApp.single('upload'), controllerAddPush.insertImageEditor);

module.exports = router;
