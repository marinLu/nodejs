const faceDal = require('../dals/e_faceDal');
const faceLogDal = require('../dals/e_face_logDal');
const cFun = require('../utils/commonFunc');
const peopleDal = require('../dals/p_peopleDal');
const resourceDal = require('../dals/s_resourceDal');
const deviceHelper = require('./helper');
const cameraDal = require('../dals/e_cameraDal');
const deviceDal = require('../dals/e_deviceDal');
const peopleHouseDal = require('../dals/p_people_houseDal');
const accessDal = require('../dals/e_accessDal');
const statisticSql = require('../statistic/statisticSql');

var getFaceLogs =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;
        var resBody = {
            faceLogs: []
        };

        var faceInfo = await faceDal.getByDeviceID(reqBody.deviceID);
        if (faceInfo == null) {
            return res.json(cFun.responseStatus(-1, '不存在人脸卡口'));
        }

        var camera = await cameraDal.getByDeviceID(faceInfo.deviceID);
        if (camera == null) {
            return res.json(cFun.responseStatus(-1, '不存在人脸卡口'));
        }

        var faceLogs = await faceLogDal.getByFaceID(faceInfo.faceID);
        if (faceLogs == null || faceLogs.length == 0) {
            return res.json(cFun.responseStatus(0, '无人脸通行日志'));
        }

        if (reqBody.peopleType == 'resident') {
            faceLogs = faceLogs.filter(x => x.credentialNo != null && x.credentialNo != '');
        }

        if (reqBody.peopleType == 'stranger') {
            faceLogs = faceLogs.filter(x => x.credentialNo == null || x.credentialNo == '');
        }

        //所有证件种类
        var credentialTypes = Array.from(new Set(faceLogs.map(x => x.credentialType)));
        credentialTypes = credentialTypes.filter(x => x != '0');

        //所有人口信息
        var peopleList = [];
        for (let i = 0; i < credentialTypes.length; i++) {
            let credentialType = credentialTypes[i];
            let credentialNos = Array.from(new Set(faceLogs.filter(x => x.credentialType == credentialType).map(x => x.credentialNo)));
            let peoples = await peopleDal.getByCredentialNosType(credentialNos, credentialType);
            peopleList = peopleList.concat(peoples);
        }

        var peopleHouses = await peopleHouseDal.getByPeopleIDs(Array.from(new Set(peopleList.map(x => x.peopleID))))

        //获取smallVideoUrl
        var villageResources = await resourceDal.getByBusinessIDs('smallVideo', 'url', [faceInfo.villageID]);
        var smallVideoUrl = '';
        if (villageResources != null && villageResources.length > 0) {
            smallVideoUrl = villageResources[0].filePath;
        } else {
            var resources = await resourceDal.getBusinessType('smallVideo');
            smallVideoUrl = resources[0].filePath;
        }

        for (let i = 0; i < faceLogs.length; i++) {
            let faceLog = faceLogs[i];
            let people = cFun.firstOrDefault(peopleList.filter(x => x.credentialNo == faceLog.credentialNo));

            if (people != null) {
                var peopleHouse = cFun.firstOrDefault(peopleHouses.filter(x => x.peopleID == people.peopleID));
            }
            var resFace = {
                faceUrl: faceLog.faceUrl,
                bkgUrl: faceLog.bkgUrl,
                peopleName: people == null ? '' : people.peopleName,
                houseNo: peopleHouse == null ? '' : peopleHouse.houseNo,
                faceCaptureTime: faceLog.faceCaptureTime,
                inout: faceInfo.in_outType == 0 ? '进' : '出',
                video: deviceHelper.buildSmallVideoUrl(smallVideoUrl,
                    camera.cameraID, cFun.timestamp(faceLog.faceCaptureTime))
            }

            resBody.faceLogs.push(resFace);
        }


        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getFaceLogs = getFaceLogs;

var getFaceCameras =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;
        var resBody = {
            cameras: []
        };

        if (reqBody.deviceID != null) {
            var faceInfo = await faceDal.getByDeviceID(reqBody.deviceID);
            if (faceInfo != null) {
                var faceList = await faceDal.getByIoID(faceInfo.ioID);
            }
            if (faceList != null && faceList.length > 0) {
                var deviceIDs = faceList.map(x => x.deviceID);
            }

            var allFaceCameras = await cameraDal.getByDeviceIDs(deviceIDs)
        } else {
            var allFaceCameras = await cameraDal.getByUseType('2');
            if (allFaceCameras == null || allFaceCameras.length == 0) {
                return res.json(cFun.responseStatus(0, '不存在人脸卡口摄像机'));
            }

            var deviceIDs = Array.from(new Set(allFaceCameras.map(x => x.deviceID)));
        }

        var devices = await deviceDal.getByDeviceIDs(deviceIDs);
        if (devices == null || devices.length == 0) {
            return res.json(cFun.responseStatus(0, '不存在人脸卡口摄像机'));
        }

        for (let i = 0; i < allFaceCameras.length; i++) {
            let camera = allFaceCameras[i];
            let device = cFun.firstOrDefault(devices.filter(x => x.deviceID == camera.deviceID &&
                reqBody.villageIDs.filter(y => y == x.villageID).length > 0));
            if (device != null) {
                resBody.cameras.push({
                    cameraID: camera.cameraID,
                    deviceID: camera.deviceID,
                    streamSource: camera.streamSource,
                    name: device.name,
                    villageID: device.villageID
                });
            }
        }
        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getFaceCameras = getFaceCameras;

var getFaceCapturePictures =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;
        var resBody = {
            faceLogs: []
        };

        var device = await deviceDal.getByDeviceID(reqBody.deviceID);
        if (device == null) {
            return res.json(cFun.responseStatus(-1, '不存在此设备'));
        }

        var faceInfos = [];
        var faceLogs = [];
        if (cFun.removeSpace(device.type) == 'camera') {

            var faceInfo = await faceDal.getByDeviceID(reqBody.deviceID);
            if (faceInfo == null) {
                return res.json(cFun.responseStatus(-1, '不存在此人脸卡口'));
            }

            faceInfos.push(faceInfo);
            faceLogs = await faceLogDal.getByFaceID(faceInfo.faceID);

        } else if (cFun.removeSpace(device.type) == 'access') {

            var access = await accessDal.getByDeviceID(reqBody.deviceID);
            if (access == null) {
                return res.json(cFun.responseStatus(-1, '无此门禁设备'));
            }

            var cameras = [];
            if (!cFun.isNullOrEmpty(access.inCameraID)) {
                let camera = await cameraDal.getByCameraID(access.inCameraID);
                cameras.push(camera);
            }
            if (!cFun.isNullOrEmpty(access.outCameraID)) {
                let camera = await cameraDal.getByCameraID(access.outCameraID);
                cameras.push(camera);
            }
            if (cameras.length == 0) {
                return res.json(cFun.responseStatus(0, '门禁设备无摄像机'));
            }

            faceInfos = await faceDal.getByDeviceIDs(cameras.map(x => x.deviceID));
            if (faceInfos == null || faceInfos.length == 0) {
                return res.json(cFun.responseStatus(0, '无人脸卡口'));
            }

            faceLogs = await faceLogDal.getByFaceIDs(faceInfos.map(x => x.faceID));
        }

        if (faceLogs == null || faceLogs.length == 0) {
            return res.json(cFun.responseStatus(0, '无人脸通行日志'));
        }

        //所有证件种类
        var credentialTypes = Array.from(new Set(faceLogs.map(x => x.credentialType)));
        credentialTypes = credentialTypes.filter(x => x != '0');

        //所有人口信息
        var peopleList = [];
        for (let i = 0; i < credentialTypes.length; i++) {
            let credentialType = credentialTypes[i];
            let credentialNos = Array.from(new Set(faceLogs.filter(x => x.credentialType == credentialType).map(x => x.credentialNo)));
            let peoples = await peopleDal.getByCredentialNosType(credentialNos, credentialType);
            peopleList = peopleList.concat(peoples);
        }

        var peopleHouses = await peopleHouseDal.getByPeopleIDs(Array.from(new Set(peopleList.map(x => x.peopleID))))

        for (let i = 0; i < faceLogs.length; i++) {
            let faceLog = faceLogs[i];
            let people = cFun.firstOrDefault(peopleList.filter(x => x.credentialNo == faceLog.credentialNo));
            if (people != null) {
                var peopleHouse = cFun.firstOrDefault(peopleHouses.filter(x => x.peopleID == people.peopleID));
            }
            let face = faceInfos.filter(x => x.faceID == faceLog.faceID)[0];
            var resFace = {
                faceUrl: faceLog.faceUrl,
                bkgUrl: faceLog.bkgUrl,
                peopleName: people == null ? '' : people.peopleName,
                houseNo: peopleHouse == null ? '' : peopleHouse.houseNo,
                faceCaptureTime: faceLog.faceCaptureTime,
                inout: face.in_outType == 0 ? '进' : '出',
                stranger: 1
            }

            if (resFace.peopleName != '') {
                resFace.stranger = 0;
            }

            resBody.faceLogs.push(resFace);
        }

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getFaceCapturePictures = getFaceCapturePictures;

var getFaceStatic =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;
        var resBody = {
            faceLogs: []
        };

        var faceInfo = await faceDal.getByDeviceID(reqBody.deviceID);
        if (faceInfo == null) {
            return res.json(cFun.responseStatus(-1, '不存在人脸卡口'));
        }

        var allFaceInfos = await faceDal.getByIoID(faceInfo.ioID);

        var inFaceInfos = allFaceInfos.filter(x => x.in_outType == 0).map(x => x.faceID);
        var outFaceInfos = allFaceInfos.filter(x => x.in_outType == 1).map(x => x.faceID);

        var inNum = 0;
        if (inFaceInfos != null && inFaceInfos.length > 0) {
            inNum = await statisticSql.人脸卡口通行数量(inFaceInfos);
        }

        var outNum = 0
        if (outFaceInfos != null && outFaceInfos.length > 0) {
            outNum = await statisticSql.人脸卡口通行数量(outFaceInfos);
        }


        return res.json(cFun.responseStatus(0, 'success', {
            faceStatic: {
                inNum: inNum,
                outNum: outNum
            }
        }));
    });
module.exports.getFaceStatic = getFaceStatic;