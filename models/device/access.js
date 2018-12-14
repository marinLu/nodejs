const cFun = require('../utils/commonFunc');
const accessDal = require('../dals/e_accessDal');
const cameraDal = require('../dals/e_cameraDal');
const accessLogDal = require('../dals/e_access_logDal');
const peopleDal = require('../dals/p_peopleDal');
const resourceDal = require('../dals/s_resourceDal');
const dictionaryDal = require('../dals/s_dictionaryDal');
const dictionary = require('../utils/dictionary');
const deviceDal = require('../dals/e_deviceDal');
const faceLogDal = require('../dals/e_face_logDal');
const statictisDal = require('../dals/e_statisticsDal');
const peopleHouseDal = require('../dals/p_people_houseDal');
const deviceHelper = require('./helper');
const houseDal = require('../dals/b_houseDal');
const log = require('../log/logRecord');
const statisticSql = require('../statistic/statisticSql');


var getAccessInfo =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var accessInfo = await accessDal.getByDeviceID(reqBody.deviceID)
        if (accessInfo == null) {
            return res.json(cFun.responseStatus(0, '没有相关的设备信息'));
        }

        var cameraIDs = [];
        if (accessInfo.inCameraID != null && accessInfo.inCameraID != '') {
            cameraIDs.push(accessInfo.inCameraID);
        }
        if (accessInfo.outCameraID != null && accessInfo.outCameraID != '') {
            cameraIDs.push(accessInfo.outCameraID);
        }

        var cameraInfos = [];
        if (cameraIDs.length > 0) {
            var cameras = await cameraDal.getByCameraIDs(cameraIDs);
            var cameraDevices = await deviceDal.getByDeviceIDs(cameras.map(x => x.deviceID));
            if (cameras != null && cameras.length > 0) {
                for (let i = 0; i < cameras.length; i++) {
                    let device = cameraDevices.filter(x => x.deviceID == cameras[i].deviceID)[0];

                    var cameraInfo = {
                        inOutFlag: cameras[i].inOutFlag,
                        cameraName: device.name,
                        cameraID: cameras[i].cameraID,
                        cameraDeviceID: cameras[i].deviceID,
                        streamSource: cameras[i].streamSource
                    };

                    //先 门外 再 门内
                    if (cameras[i].inOutFlag == 0) {
                        cameraInfos.unshift(cameraInfo);
                    } else {
                        cameraInfos.push(cameraInfo);
                    }
                }
            }
        }

        var resBody = {
            accessInfo: {
                accessID: accessInfo.doorID,
                accessName: accessInfo.accessName,
                type: accessInfo.type,
                lockState: accessInfo.lockState
            },
            cameraInfos: cameraInfos
        };
        return res.json(
            cFun.mergeJson(cFun.responseStatus(0, 'success'), resBody)
        );
    });
module.exports.getAccessInfo = getAccessInfo;


var getAccessLogs =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var startTime = reqBody.startTime;
        var endTime = reqBody.endTime;
        var peopleType = reqBody.peopleType;
        var deviceID = '';


        if (!cFun.isNullOrEmpty(reqBody.deviceID)) {
            deviceID = reqBody.deviceID;
        } else if (!cFun.isNullOrEmpty(reqBody.buildingID)) {
            var accessInfos = await deviceDal.getByBuildingIDType(reqBody.buildingID, 'access');
            if (accessInfos == null || accessInfos.length == 0) {
                return res.json(cFun.responseStatus(-1, '无门禁设备'));
            }

            deviceID = accessInfos[0].deviceID;
        }

        var accessLogList = await accessLogDal.getAccessLogs(deviceID, startTime, endTime, peopleType, Number(reqBody.pageNum), Number(reqBody.pageSize));
        if (accessLogList == null || accessLogList.length == 0) {
            return res.json(cFun.responseStatus(0, '没有相关的通行信息'));
        }

        var peopleList = [];
        var credentialTypes = Array.from(new Set(accessLogList.map(x => x.credentialType)));

        for (let i = 0; i < credentialTypes.length; i++) {
            let credentialType = credentialTypes[i];

            if (credentialType == '' || credentialType == '0') {
                continue;
            }

            let credentialNos = accessLogList.filter(x => x.credentialType == credentialType).map(x => x.credentialNo)
            credentialNos = credentialNos.filter(x => !cFun.isNullOrEmpty(x));

            if (credentialNos.length > 0) {
                let peoples = await peopleDal.getByCredentialNosType(Array.from(new Set(credentialNos)), credentialType);
                peopleList = peopleList.concat(peoples);
            }
        }

        var openTypeDictions = await dictionaryDal.getByPath('db/e_access_log/openType');

        var accessInfo = await accessDal.getByDeviceID(deviceID);
        var accessCameras = [];
        if (!cFun.isNullOrEmpty(accessInfo.inCameraID)) {
            let camera = await cameraDal.getByCameraID(accessInfo.inCameraID);
            accessCameras.push(camera);
        }
        if (!cFun.isNullOrEmpty(accessInfo.outCameraID)) {
            let camera = await cameraDal.getByCameraID(accessInfo.outCameraID);
          
            accessCameras.push(camera);
        }

        //取小视频url
        var villageResources = await resourceDal.getByBusinessIDs('smallVideo', 'url', Array.from(new Set(accessLogList.map(x => x.villageID))));
        var smallVideoUrl = '';
        if (villageResources != null && villageResources.length > 0) {
            smallVideoUrl = villageResources[0].filePath;
        } else {
            var resources = await resourceDal.getBusinessType('smallVideo');
            smallVideoUrl = resources[0].filePath;
        }

        if (peopleList.length > 0) {
            var peopleHouses = await peopleHouseDal.getByPeopleIDs(Array.from(new Set(peopleList.map(x => x.peopleID))))
        }

        //门禁通行记录
        var accessLogs = [];
        for (let i = 0; i < accessLogList.length; i++) {
            const element = accessLogList[i];

            var name = '';
            var houseNo = '';
            var peoples = peopleList.filter(x => cFun.removeSpace(x.credentialNo) == cFun.removeSpace(element.credentialNo));
            if (peoples != null && peoples.length > 0) {
                name = peoples[0].peopleName;
                var peopleHouse = peopleHouses.filter(x => x.peopleID == peoples[0].peopleID)[0];

                if (peopleHouse != null) {
                    houseNo = peopleHouse.houseNo;
                }
            }

            // if (name == '') {
            //     continue;
            // }

            var accessLog = {
                name: name,
                time: element.openTime,
                houseNo: houseNo,
                type: dictionary(openTypeDictions, element.openType),
                inOut: '进',
                streamSource: '',
                inStreamSource: '',
                outStreamSource: ''
            };

            if (accessCameras.length > 0) {

                var inSmallVideoCamera = accessCameras.filter(x => x.inOutFlag == 0)[0];
                var outSmallVideoCamera = accessCameras.filter(x => x.inOutFlag == 1)[0];

                if (inSmallVideoCamera != null) {
                    var inSmallVideoCameraId = inSmallVideoCamera.cameraID;
                    accessLog.inStreamSource = deviceHelper.buildSmallVideoUrl(smallVideoUrl, inSmallVideoCameraId, cFun.timestamp(element.openTime))
                }

                if (outSmallVideoCamera != null) {
                    var outSmallVideoCameraId = outSmallVideoCamera.cameraID;
                    accessLog.outStreamSource = deviceHelper.buildSmallVideoUrl(smallVideoUrl, outSmallVideoCameraId, cFun.timestamp(element.openTime))

                }
            }


            accessLogs.push(accessLog);
        }

        var resBody = {
            accessLogs: accessLogs
        };

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getAccessLogs = getAccessLogs;

var getAccessStatic =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var deviceInfo = await deviceDal.getByDeviceID(reqBody.deviceID);
        if (deviceInfo == null) {
            return res.json(cFun.responseStatus(-1, '不存在此门禁设备'));
        }

        // var inNumData = await statictisDal.getByPathVillageID(deviceInfo.buildingID + 'inNum', deviceInfo.villageID);
        // var outNumData = await statictisDal.getByPathVillageID(deviceInfo.buildingID + 'outNum', deviceInfo.villageID);
        // var visitNumData = await statictisDal.getByPathVillageID(deviceInfo.buildingID + 'visitNum', deviceInfo.villageID);
        // var resideNumData = await statictisDal.getByPathVillageID(deviceInfo.buildingID + 'resideNum', deviceInfo.villageID);

        // var inNum = staticProcessData(inNumData);
        // var outNum = staticProcessData(outNumData);
        // var visitNum = staticProcessData(visitNumData);
        // var resideNum = staticProcessData(resideNumData);
        var visitNum = await statisticSql.门禁访客数量(reqBody.deviceID);
        var resBody = {
            accessStatic: {
                inNum: 0,
                outNum: 0,
                visitNum: visitNum,
                resideNum: 0
            }
        };

        return res.json(
            cFun.mergeJson(cFun.responseStatus(0, 'success'), resBody)
        );
    });
module.exports.getAccessStatic = getAccessStatic;

var staticProcessData = function (numData) {
    if (numData != null) {
        let numEntity = cFun.jsonTryParse(numData.data);
        if (numEntity != null && numEntity.data != null) {
            return numEntity.data;
        }
    }

    return 0;
}


var changeAccessState = cFun.awaitHandlerFactory(async (req, res, next) => {
    let DeviceIDList = req.body.deviceIDList;
    for(let [index, elem] of DeviceIDList.entries())
    {
        // 开始更新
        accessDal.changeAccessState([elem, elem])
    }
    return res.json(cFun.responseStatus(0, 'success'));
})
module.exports.changeAccessState = changeAccessState