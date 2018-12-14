const cFun = require('../utils/commonFunc');
const alarmLogDal = require('../dals/e_alarm_logDal');
const buildingDal = require('../dals/b_buildingDal');
const villageDal = require('../dals/b_villageDal');
const peopleHouseDal = require('../dals/p_people_houseDal');
const deviceDal = require('../dals/e_deviceDal');
const houseDal = require('../dals/b_houseDal');
const peopleDal = require('../dals/p_peopleDal');
const ProcessedContent = require('blueplus-dals').processedContent;
const openByMqtt = require('../openData/openByMqtt');

var getAccessEventList =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var villageIDs = reqBody.villageIDs;
        var deviceTypes = 'access';
        var alarmTypes = 'doorOpen';
        var isDeal = [getProcessState(reqBody.status)];
        var pageNum = reqBody.pageNum;
        var pageSize = reqBody.pageSize;

        var deviceAlarmList = await alarmLogDal.getAlarmList(villageIDs, deviceTypes,
            alarmTypes, null, pageNum, pageSize, null, null, null, isDeal);

        if (deviceAlarmList == null || deviceAlarmList.length == 0) {
            return res.json(cFun.responseStatus(0, '无事件'));
        }

        var buildingIDs = Array.from(new Set(deviceAlarmList.map(x => x.buildingID)));
        if (buildingIDs == null || buildingIDs.length == 0) {
            return res.json(cFun.responseStatus(-1, '无楼栋信息'));
        }

        var buildingList = await buildingDal.getByBuildingIDs(buildingIDs);
        var villageInfos = await villageDal.getByVillageIDs(reqBody.villageIDs);

        if (buildingList == null || villageInfos == null) {
            return res.json(cFun.responseStatus(-1, '无楼栋信息'));
        }

        var resEvents = [];
        for (let i = 0; i < deviceAlarmList.length; i++) {
            let deviceAlarm = deviceAlarmList[i];

            var buildingInfo = cFun.firstOrDefault(buildingList.filter(x => x.buildingID == deviceAlarm.buildingID));
            var villageInfo = cFun.firstOrDefault(villageInfos.filter(x => x.villageID == buildingInfo.villageID));

            var event = {
                eventID: deviceAlarm.alarmID,
                status: deviceAlarm.isDeal == 0 ? 0 : 2,
                villageName: villageInfo.name,
                buildingNo: buildingInfo != null ? buildingInfo.buildingNo : '',
                createTime: cFun.formatDateTime(deviceAlarm.alarmTime),
                options: [],
                resultContent: '',
                resultType: [],
                countdown: 0
            };

            if (event.status == 0) {
                event.options = [{
                        name: '接单',
                        code: 'select'
                    },
                    {
                        name: '五分钟后接单',
                        code: 'selectAfter'
                    },
                ]
            } else {
                if (deviceAlarm.processedContent != null &&
                    deviceAlarm.processedContent != '') {

                    var processedContentEntity = cFun.jsonTryParse(deviceAlarm.processedContent);
                    if (processedContentEntity != null) {
                        event.resultContent = processedContentEntity.remark == null ? '' : processedContentEntity.remark;

                        if (processedContentEntity.resultType != null && processedContentEntity.resultType != '') {
                            event.resultType = [accessResultType(processedContentEntity.resultType)];
                        }
                    }
                }
            }

            resEvents.push(event);
        }

        var resBody = {
            events: resEvents
        };

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getAccessEventList = getAccessEventList;

var accessResultType = function (resultType) {
    if (resultType == 'manMade') {
        return 1;
    }

    if (resultType == 'specialScene') {
        return 2;
    }

    if (resultType == 'timeout') {
        return 3;
    }

    return 1;
}


var getProcessState = function (status) {
    switch (status) {
        case 0:
            return 0;
        case 2:
            return 1;
    }
}

var getSmokeDetectorEventList =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var villageIDs = reqBody.villageIDs;
        var deviceTypes = 'smokeDetector';
        var alarmTypes = 'fire';
        var isDeal = [getProcessState(reqBody.status)];
        var pageNum = reqBody.pageNum;
        var pageSize = reqBody.pageSize;

        var deviceAlarmList = await alarmLogDal.getAlarmList(villageIDs, deviceTypes,
            alarmTypes, null, pageNum, pageSize, null, null, null, isDeal);

        if (deviceAlarmList == null || deviceAlarmList.length == 0) {
            return res.json(cFun.responseStatus(0, '无事件'));
        }

        var buildingIDs = deviceAlarmList.map(x => x.buildingID);
        if (buildingIDs == null || buildingIDs.length == 0) {
            return res.json(cFun.responseStatus(-1, '无楼栋信息'));
        }

        var buildingList = await buildingDal.getByBuildingIDs(buildingIDs);
        var villageInfos = await villageDal.getByVillageIDs(reqBody.villageIDs);

        if (buildingList == null || villageInfos == null) {
            return res.json(cFun.responseStatus(-1, '无楼栋信息'));
        }

        var deviceIDs = Array.from(new Set(deviceAlarmList.map(x => x.deviceID)));
        var deviceList = await deviceDal.getByDeviceIDs(deviceIDs);

        var houseIDs = Array.from(new Set(deviceList.map(x => x.houseID)));
        var houseList = await houseDal.getByHouseIDs(houseIDs);
        var peopleHouseList = await peopleHouseDal.getByHouseIDs(houseIDs)
        var peopleList = await peopleDal.getByPeopleIDs(Array.from(new Set(peopleHouseList.map(x => x.peopleID))));

        var resEvents = [];
        for (let i = 0; i < deviceAlarmList.length; i++) {
            let deviceAlarm = deviceAlarmList[i];

            var buildingInfo = cFun.firstOrDefault(buildingList.filter(x => x.buildingID == deviceAlarm.buildingID));
            var houseID = deviceList.filter(x => x.deviceID == deviceAlarm.deviceID)[0].houseID
            var houseInfo = houseList.filter(x => x.houseID == houseID)[0];
            var villageInfo = cFun.firstOrDefault(villageInfos.filter(x => x.villageID == deviceAlarm.villageID));

            if (houseInfo != null) {
                var residentList = await peopleHouseList.filter(x => x.houseID == houseInfo.houseID);
            }

            var event = {
                eventID: deviceAlarm.alarmID,
                status: deviceAlarm.isDeal == 0 ? 0 : 2,
                villageName: villageInfo == null ? '' : villageInfo.name,
                buildingNo: buildingInfo != null ? buildingInfo.buildingNo : '',
                createTime: cFun.formatDateTime(deviceAlarm.alarmTime),
                houseNo: houseInfo == null ? '' : houseInfo.houseNo,
                people: [],
                residentNum: residentList == null ? 0 : residentList.length,
                tag: [],
                resultContent: '',
                resultType: []
            };

            if (residentList != null) {
                //详细住户信息
                for (let i = 0; i < residentList.length; i++) {
                    let residentInfo = residentList[i];
                    let peopleInfo = peopleList.filter(x => x.peopleID == residentInfo.peopleID)[0];
                    event.people.push({
                        name: peopleInfo.peopleName,
                        phone: peopleInfo.phoneNo,
                        relation: residentInfo.relationshipWithHouseHold == null ? 0 : residentInfo.relationshipWithHouseHold
                    })

                    //Tag
                    event.tag = cFun.union(event.tag, buildPeopleTag(residentInfo))
                }
            }


            //已处理
            if (event.status == 2) {
                if (deviceAlarm.processedContent != null &&
                    deviceAlarm.processedContent != '') {

                    let processedContent = cFun.jsonTryParse(deviceAlarm.processedContent);
                    if (processedContent != null) {
                        event.resultContent = processedContent.remark;

                        if (processedContent.resultType != null && processedContent.resultType != '') {
                            event.resultType = [smokeDetectorResultType(processedContent.resultType)];
                        }
                    }
                }
            }

            resEvents.push(event);
        }

        var resBody = {
            events: resEvents
        };

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getSmokeDetectorEventList = getSmokeDetectorEventList;

var smokeDetectorResultType = function (resultType) {
    if (resultType == 'falseAlarm') {
        return 1;
    }

    if (resultType == 'alarm') {
        return 2;
    }

    if (resultType == 'timeout') {
        return 3;
    }

    return 1;
}

var buildPeopleTag = function (peopleHouseInfo) {
    if (peopleHouseInfo == null) {
        return '';
    }

    var tags = [];
    if (peopleHouseInfo.isChildren == 1) {
        tags.push('儿童');
    }
    if (peopleHouseInfo.isAged == 1) {
        tags.push('老年人');
    }
    if (peopleHouseInfo.isCare == 1) {
        tags.push('关爱人员');
    }

    return tags;
}

var getParkingEventList =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var villageIDs = reqBody.villageIDs;
        var alarmTypes = ['parkingCarExceed'];
        var isDeal = [getProcessState(reqBody.status)];
        var pageNum = reqBody.pageNum;
        var pageSize = reqBody.pageSize;



        var senseAlarmList = await alarmLogDal.getAlarmList(villageIDs, null,
            alarmTypes, null, pageNum, pageSize, null, null, null, isDeal);

        if (senseAlarmList == null || senseAlarmList.length == 0) {
            return res.json(cFun.responseStatus(0, '无事件'));
        }

        var villageInfos = await villageDal.getByVillageIDs(reqBody.villageIDs);
        if (villageInfos == null || villageInfos.length == 0) {
            return res.json(cFun.responseStatus(-1, '无停车场信息'));
        }

        var resEvents = [];
        for (let i = 0; i < senseAlarmList.length; i++) {
            let senseAlarm = senseAlarmList[i];
            let villageInfo = villageInfos.filter(x => x.villageID == senseAlarm.villageID)[0];
            let alarmContent = cFun.jsonTryParse(senseAlarm.alarmContent);

            if (alarmContent == null) {
                continue;
            }
            var event = {
                eventID: senseAlarm.alarmID,
                status: senseAlarm.isDeal == 0 ? 0 : 2,
                villageName: villageInfo.name,
                creatTime: cFun.formatDateTime(senseAlarm.alarmTime),
                title: alarmContent.alarmTitle,
                ratio: alarmContent.ratio,
                describe: '请酌情处理外来车辆',
                resultType: []
            }

            resEvents.push(event);
        }

        var resBody = {
            events: resEvents
        };

        return res.json(cFun.responseStatus(0, 'success', resBody));
    });
module.exports.getParkingEventList = getParkingEventList;

var accessProcessReport =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var senseAlarmLog = await alarmLogDal.getByAlarmID(reqBody.eventID);
        if (senseAlarmLog == null) {
            return res.json(cFun.responseStatus(-1, '不存在此门禁事件'));
        }

        if (senseAlarmLog.isDeal == 1) {
            return res.json(cFun.responseStatus(-1, '已处理'));
        }

        var processedContent = new ProcessedContent();
        processedContent.userID = reqBody.head.userID;
        processedContent.resultType = accessProcessResultType(reqBody.resultType);
        processedContent.remark = reqBody.result;
        processedContent.sceneType = reqBody.sceneType;

        senseAlarmLog.processedContent = JSON.stringify(processedContent);
        senseAlarmLog.processedTime = cFun.formatDateTime();
        senseAlarmLog.alarmState = 2;
        senseAlarmLog.isDeal = 1;
        alarmLogDal.update(senseAlarmLog);

        openByMqtt.openAlarmResult(senseAlarmLog);

        return res.json(cFun.responseStatus(0, 'success'));
    });
module.exports.accessProcessReport = accessProcessReport;

var accessProcessResultType = function (resultType) {
    if (resultType == 1) {
        return 'manMade';
    }

    if (resultType == 2) {
        return 'alarm';
    }

    return 'manMade';
}

var parkingProcessReport =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var senseAlarmLog = await alarmLogDal.getByAlarmID(reqBody.eventID);
        if (senseAlarmLog == null) {
            return res.json(cFun.responseStatus(-1, '不存在此事件'));
        }

        if (senseAlarmLog.isDeal == 1) {
            return res.json(cFun.responseStatus(-1, '已处理'));
        }

        var processedContent = new ProcessedContent();
        processedContent.userID = reqBody.head.userID;

        senseAlarmLog.isDeal = 1;
        senseAlarmLog.alarmState = 2;
        senseAlarmLog.processedContent = JSON.stringify(processedContent);
        senseAlarmLog.processedTime = cFun.formatDateTime();

        alarmLogDal.update(senseAlarmLog);

        openByMqtt.openAlarmResult(senseAlarmLog);
        return res.json(cFun.responseStatus(0, 'success'));
    });
module.exports.parkingProcessReport = parkingProcessReport;

var smokeDetectorProcessReport =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var senseAlarmLog = await alarmLogDal.getByAlarmID(reqBody.eventID);
        if (senseAlarmLog == null) {
            return res.json(cFun.responseStatus(-1, '不存在此烟感事件'));
        }

        if (senseAlarmLog.isDeal == 1) {
            return res.json(cFun.responseStatus(-1, '已处理'));
        }

        var processedContent = new ProcessedContent();
        processedContent.userID = reqBody.head.userID;
        processedContent.resultType = smokeDetectorProcessResultType(reqBody.resultType);
        processedContent.remark = reqBody.result;

        senseAlarmLog.processedContent = JSON.stringify(processedContent);
        senseAlarmLog.processedTime = cFun.formatDateTime();
        senseAlarmLog.alarmState = 2;
        senseAlarmLog.isDeal = 1;
        alarmLogDal.update(senseAlarmLog);

        openByMqtt.openAlarmResult(senseAlarmLog);
        return res.json(cFun.responseStatus(0, 'success'));
    });
module.exports.smokeDetectorProcessReport = smokeDetectorProcessReport;

var smokeDetectorProcessResultType = function (resultType) {
    if (resultType == 1) {
        return 'falseAlarm';
    }

    if (resultType == 2) {
        return 'alarm';
    }

    return 'alarm';
}

var getEventNameList =
    cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var smokeDetectorUnsolveNum = await alarmLogDal.countUnsolveNum(['fire'], ['smokeDetector'],
         reqBody.villageIDs,null);
        var smokeDetector = {
            name: '烟感',
            code: 'smokeDetector',
            unsolveNum: smokeDetectorUnsolveNum
        };

        var doorOpenUnsolveNum = await alarmLogDal.countUnsolveNum(['doorOpen'], ['access'],
         reqBody.villageIDs,null);
        var doorOpen = {
            name: '门未关',
            code: 'doorOpen',
            unsolveNum: doorOpenUnsolveNum
        };

        var parkingCarExceedUnsolveNum = await alarmLogDal.countUnsolveNum(['parkingCarExceed'], null,
         reqBody.villageIDs,null);
        var parkingCarExceed = {
            name: '小区停车',
            code: 'parkingCarExceed',
            unsolveNum: parkingCarExceedUnsolveNum
        };

        var resEvents = [];
        resEvents.push(smokeDetector);
        resEvents.push(doorOpen);
        resEvents.push(parkingCarExceed);

        var reqBody = {
            events: resEvents
        }

        return res.json(cFun.responseStatus(0, 'success', reqBody));
    });
module.exports.getEventNameList = getEventNameList;