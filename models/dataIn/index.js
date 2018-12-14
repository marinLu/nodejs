var express = require('express');
var router = express.Router();
module.exports = router;


const fence = require('./fence');
router.post("/fenceAlarm", fence.fenceAlarm);
router.post("/updateDevice", fence.updateDevice);

const access = require('./access');
router.post('/accessLogs', access.accessLogs)
router.post('/accessFaceLogs', access.accessFaceLogs)
router.post('/visitorAccessLogs', access.visitorAccessLogs)
router.post('/accessFaceLogsForNet', access.accessFaceLogsForNet)
router.post('/doorStatusForNet', access.doorStatusForNet)

const nbdevicealarm = require('./nbdevicealarm');
router.post('/nbdevicealarm', nbdevicealarm.nbdevicealarm);

const nbdevicestatus = require('./nbdevicestatus');
router.post('/nbdevicestatus', nbdevicestatus.nbdeviceOps);
router.post('/nbdevicealarmRecovery', nbdevicestatus.nbdevicealarmRecovery);
router.post('/dooralarmRecovery', nbdevicestatus.dooralarmRecovery);

const thirdParty = require('./thirdParty');
const verifySign=require('../user/verifySign');
router.post('/infoReport',thirdParty.infoReport);

const parking = require("./parking");
router.post("/carParking" , parking.carParking);


const dahuaFance = require('./dahuaFace/index');
router.post("/dahuaFace/login", dahuaFance.login);
router.post("/dahuaFace/dahuaCallback" , dahuaFance.notifyCallBack);


const x3Face = require("./x3Face/index");
router.post("/x3Face/accessFace" , x3Face.accessFace);

const taoanFace = require("./taoanFace/index");
router.post("/taoanFace/accessFace" , taoanFace.accessFace)

// const dnkFaceGW = require("./dnkFace/index").faceGW;
// router.post("/faceGW/doorStatus" , dnkFaceGW.doorStatus);
// router.post("/faceGW/heartbeat" , dnkFaceGW.heartbeat);
// router.post("/faceGW/openVideo" , dnkFaceGW.openVideo);
// router.post("/faceGW/register" , dnkFaceGW.register);
// router.get("/faceGW/version" , dnkFaceGW.version);

// const dnkFace = require("./dnkFace/index").face;
// router.post("/dnk/face/pic/addormodify" , dnkFace.eigenValueAddOrModify);
// router.post("/dnk/face/delete" , dnkFace.delete);


const cnFace = require("./cnFace/index").face;
router.post("/face/pic/addormodify" , cnFace.eigenValueAddOrModify);
router.post("face/delete" , cnFace.delete);

const dnkFaceTopic = require("./dnkFace/index").getTopic;
router.post("/dnkFace/getTopic" , dnkFaceTopic)