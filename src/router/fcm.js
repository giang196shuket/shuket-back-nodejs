var express = require("express");
const  controller  = require("../controller/fcm/fcm");
const  middleware  = require("../middleware/auth");

var router = express.Router();

router.post("/fcm_list",  middleware.verifyToken, controller.fcmList);

router.get("/get_fcm_options",  middleware.verifyToken, controller.getFcmOptions);
router.post("/post_notification",  middleware.verifyToken, controller.postNotification);
router.post("/post_notification_by_topic",  middleware.verifyToken, controller.postNotificationByTopic);
router.post("/subcribe_topic",  middleware.verifyToken, controller.subcribeTopic);
router.post("/unsubcribe_topic",  middleware.verifyToken, controller.unsubcribeTopic);


module.exports = router;
