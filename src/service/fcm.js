
const { listFcm } = require("../../config/firebase/fcm");
var admin = require("firebase-admin");


const adminFCM1 = admin.initializeApp({
    credential: admin.credential.cert(listFcm.fcm1)
  },'adminFCM1');
  
const adminFCM2 = admin.initializeApp({
    credential: admin.credential.cert(listFcm.fcm2)
  },'adminFCM2');


  module.exports = { adminFCM1, adminFCM2}