var express = require("express");
const  controller  = require("../controller/import");
const  middleware  = require("../middleware/auth");
const uploadStatic = require("../service/uploadStatic");

var router = express.Router();


router.post("/upload_file", middleware.verifyToken, uploadStatic.single('file'), controller.uploadFile);


module.exports = router;
