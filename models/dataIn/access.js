const cFun = require('../utils/commonFunc');
const deviceDal = require('../dals/e_deviceDal');
const AccessLogEntity = require('../entitys/e_access_logEntity');
const accessLogDal = require('../dals/e_access_logDal');
const accessDal = require('../dals/e_accessDal');
const faceLogDal = require('../dals/e_face_logDal');
const faceLogEntity = require('../entitys/e_face_logEntity');
var mqtt = require('mqtt');
const config = require('../config');
const peopleHouseDal = require('../dals/p_people_houseDal');
const doorStatusLogDal = require('../dals/e_door_statusDal');
const doorStatusEntity = require('../entitys/e_door_statusEntity');


var accessLogs = cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var deviceCodes = Array.from(new Set(reqBody.logs.map(x => x.deviceNo)));

        var accessInfos = [];
        for (let i = 0; i < deviceCodes.length; i++) {
                let deviceCode = deviceCodes[i];
                let accessInfo = await accessDal.getByMac(deviceCode);
                if (accessInfo != null) {
                        accessInfos.push(accessInfo);
                }
        }

        if (accessInfos == null || accessInfos.length == 0) {
                return res.json(cFun.responseStatus(-1, '无门禁设备'));
        }

        var deviceIDs = accessInfos.map(x => x.deviceID);
        var deviceList = await deviceDal.getByDeviceIDs(deviceIDs);

        var accessLogEntitys = [];
        for (let i = 0; i < reqBody.logs.length; i++) {
                let accessLog = reqBody.logs[i];

                let access = accessInfos.filter(x => x.mac == accessLog.deviceNo ||
                        x.faceGatewayMac == accessLog.deviceNo)[0];
                if (access == null) {
                        continue;
                }
                let device = deviceList.filter(x => x.deviceID == access.deviceID)[0];
                if (device == null) {
                        continue;
                }

                var accessLogEntity = new AccessLogEntity();
                accessLogEntity.accessLogID = cFun.guid();
                accessLogEntity.deviceID = device.deviceID;
                accessLogEntity.streetID = device.streetID;
                accessLogEntity.villageID = device.villageID;
                accessLogEntity.buildingID = device.buildingID;
                accessLogEntity.cardNo = accessLog.cardNo;
                accessLogEntity.credentialType = accessLog.credentialType;
                accessLogEntity.credentialNo = accessLog.credentialNo;
                accessLogEntity.openTime = accessLog.openTime;
                accessLogEntity.openType = accessLog.openType;

                accessLogEntitys.push(accessLogEntity);

                //更新开门时间
                peopleHouseDal.updateLastOpenDoorTime(accessLog.credentialType, accessLog.credentialNo, accessLog.openTime);

                //通知MQ
                let mqttClient = mqtt.connect(process.env.MQTT_HOST);
                console.log('/service/inner/e_access_log 开始推送');
                mqttClient.on('connect', function () {
                        console.log('/service/inner/e_access_log 推送');
                        mqttClient.publish('/service/inner/e_access_log', JSON.stringify(accessLogEntity));
                        mqttClient.end();
                });
        }

        if (accessLogEntitys.length > 0) {
                for (let i = 0; i < accessLogEntitys.length; i++) {
                        const accessLogEntity = accessLogEntitys[i];
                        accessLogDal.insert(accessLogEntity);
                }

                return res.json(cFun.responseStatus(0, 'success'));
        } else {
                return res.json(cFun.responseStatus(-1, '未找到门禁'));
        }
});
module.exports.accessLogs = accessLogs;

var visitorAccessLogs = cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var deviceCodes = Array.from(new Set(reqBody.logs.map(x => x.MacAddress)));

        var deviceInfos = await deviceDal.getByCodes(deviceCodes);


        if (deviceInfos == null || deviceInfos.length == 0) {
                return res.json(cFun.responseStatus(-1, '无门禁设备'));
        }

        var deviceIDs = deviceInfos.map(x => x.deviceID);
        var deviceList = await deviceDal.getByDeviceIDs(deviceIDs);

        var accessLogEntitys = [];
        for (let i = 0; i < reqBody.logs.length; i++) {
                let accessLog = reqBody.logs[i];

                var device = cFun.firstOrDefault(deviceList.filter(x => x.code == accessLog.MacAddress));
                if (device != null) {
                        var accessLogEntity = new AccessLogEntity();
                        accessLogEntity.accessLogID = cFun.guid();
                        accessLogEntity.deviceID = device.deviceID;
                        accessLogEntity.streetID = device.streetID;
                        accessLogEntity.villageID = device.villageID;
                        accessLogEntity.buildingID = device.buildingID;
                        // accessLogEntity.houseID = cFun.guid();
                        accessLogEntity.memo = accessLog.memo;
                        accessLogEntity.openTime = accessLog.openTime;
                        accessLogEntity.openType = accessLog.openType;

                        accessLogEntitys.push(accessLogEntity);
                }
        }

        if (accessLogEntitys.length > 0) {
                for (let i = 0; i < accessLogEntitys.length; i++) {
                        const accessLogEntity = accessLogEntitys[i];
                        accessLogDal.insert(accessLogEntity);
                }

                return res.json(cFun.responseStatus(0, 'success'));
        } else {
                return res.json(cFun.responseStatus(-1, '未找到门禁'));
        }
});
module.exports.visitorAccessLogs = visitorAccessLogs;



var accessFaceLogs = cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body.log;
        var mac = reqBody.macAddress;
        var pic = reqBody.pic;
        var passTime = reqBody.passTime;

        var faceInfos = await accessDal.query("select d.faceID,b.villageID,a.deviceId from e_access a, e_device b, e_camera c, e_face d where (a.faceGatewayMac = '" + mac + "' or  a.mac = '" + mac + "')  and b.deviceID = a.deviceID and a.inCameraID = c.cameraID and c.deviceID = d.deviceID");

        if (faceInfos == null || faceInfos.length == 0) {
                return res.json(cFun.responseStatus(-1, '无门禁设备或者门禁设备对应的内侧摄像机'));
        }

        var faceID = faceInfos[0].faceID;
        var villageID = faceInfos[0].villageID;
        var deviceId = faceInfos[0].deviceId;

        var entity = new faceLogEntity();
        entity.faceLogID = cFun.guid();
        entity.faceID = faceID;
        entity.faceUrl = pic;
        entity.credentialNo = '';
        entity.credentialType = '';
        entity.faceCapture = '';
        entity.faceCaptureTime = passTime;
        entity.faceSource = 2;

        var mqttClient = mqtt.connect(process.env.MQTT_HOST);
        var x = {
                Pic: pic, //图片
                passTime: passTime, //时间 yyyy-MM-dd HH:mm:ss
                Visitor: 0,
                deviceId: deviceId,
                villageID: villageID
        };

        mqttClient.on('connect', function () {
                mqttClient.publish('/web/event/map/accessfaceLog', JSON.stringify(x));
                mqttClient.end();
        });

        faceLogDal.insert(entity);
        return res.json(cFun.responseStatus(0, 'success'));
});
module.exports.accessFaceLogs = accessFaceLogs;


var accessFaceLogsForNet = cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body.log;
        var mac = reqBody.macAddress;
        var pic = reqBody.pic;
        var backGroundPic = reqBody.backGroundPic;
        var passTime = reqBody.passTime;
        var credentialNo = reqBody.credentialNo;

        var faceInfos = await accessDal.query("select d.faceID,b.villageID,b.streetID,b.villageID, b.buildingID,a.deviceId from e_access a, e_device b, e_camera c, e_face d where (a.faceGatewayMac = '" + mac + "' or  a.mac = '" + mac + "')  and b.deviceID = a.deviceID and a.inCameraID = c.cameraID and c.deviceID = d.deviceID");

        if (faceInfos == null || faceInfos.length == 0) {
                return res.json(cFun.responseStatus(-1, '无门禁设备或者门禁设备对应的内侧摄像机'));
        }

        var faceID = faceInfos[0].faceID;
        var villageID = faceInfos[0].villageID;
        var deviceId = faceInfos[0].deviceId;

        var entity = new faceLogEntity();
        entity.faceLogID = cFun.guid();
        entity.faceID = faceID;
        entity.faceUrl = pic;
        entity.bkgUrl = backGroundPic;
        entity.credentialNo = credentialNo;
        entity.credentialType = (credentialNo != null || credentialNo != '') ? 1 : 0;
        entity.faceCapture = '';
        entity.faceCaptureTime = passTime;
        entity.faceSource = 2;

        //e_access_log
        var accessLog = new AccessLogEntity();
        accessLog.accessLogID = cFun.guid();
        accessLog.deviceID = deviceId;
        accessLog.streetID = faceInfos[0].streetID;
        accessLog.villageID = faceInfos[0].villageID;
        accessLog.buildingID = faceInfos[0].buildingID;
        accessLog.houseID = '';
        accessLog.cardNo = '';
        accessLog.credentialType = (credentialNo != null || credentialNo != '') ? 1 : '';
        accessLog.credentialNo = credentialNo;
        accessLog.openTime = passTime;
        accessLog.openType = '100802';

        accessLogDal.insert(accessLog);


        var mqttClient = mqtt.connect(process.env.MQTT_HOST);
        var x = {
                Pic: pic, //图片
                passTime: passTime, //时间 yyyy-MM-dd HH:mm:ss
                Visitor: 0,
                deviceId: deviceId,
                villageID: villageID
        };

        mqttClient.on('connect', function () {
                mqttClient.publish('/web/event/map/accessfaceLog', JSON.stringify(x));
                mqttClient.publish('/service/inner/e_access_log', JSON.stringify(accessLog));
                mqttClient.end();
        });

        faceLogDal.insert(entity);
        return res.json(cFun.responseStatus(0, 'success'));
});
module.exports.accessFaceLogsForNet = accessFaceLogsForNet;


var doorStatusForNet = cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body.log;
        var deviceMAC = reqBody.deviceMAC;
        var timeStamp = reqBody.timeStamp;
        var state = reqBody.state;



        var entity = new doorStatusEntity();
        entity.doorStatusID = cFun.guid();
        entity.deviceMAC = deviceMAC;
        entity.timeStamp = timeStamp;
        entity.state = state;


        doorStatusLogDal.insert(entity);
        return res.json(cFun.responseStatus(0, 'success'));
});
module.exports.doorStatusForNet = doorStatusForNet;