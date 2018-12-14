const cFun = require('../utils/commonFunc');
const alarmLogDal = require('../dals/e_alarm_logDal');
const senseAlarmOptionDal = require('../dals/e_sense_alarm_optionDal');
const senseAlarmFlowDal = require('../dals/e_sense_alarm_flowDal');
const userDal = require('../dals/s_userDal');
const houseDal = require('../dals/b_houseDal');
const buildingDal = require('../dals/b_buildingDal');
const villageDal = require('../dals/b_villageDal');
const senseAlarmModelDal = require('../dals/e_sense_alarm_modelDal');
const relationDeviceDal = require('../dals/e_sense_alarm_deviceDal');
const deviceDal = require('../dals/e_deviceDal');
const cameraDal = require('../dals/e_cameraDal');
const ProcessedContentEntity = require('blueplus-dals').processedContent;
const dictionaryDal = require('../dals/s_dictionaryDal');
const openByMqtt = require('../openData/openByMqtt');


var getRelateDevices = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;
    var fireCameraDeviceIDs = []; //配置的小区火警关联摄像机


    if (reqBody.alarmID == null) {
        var relationDevices = await relationDeviceDal.getByDeviceScence(reqBody.deviceID);
    } else {
        var alarmLog = await alarmLogDal.getByAlarmID(reqBody.alarmID);
        if (alarmLog == null) {
            return res.json(cFun.responseStatus(-1, '不存在此报警事件'));
        }

        var village = await villageDal.getByVillageID(alarmLog.villageID)
        if (village == null) {
            return res.json(cFun.responseStatus(-1, '此报警事件错误'));
        }

        if (village.remark != null && village.remark != '') {
            var villageRemark = cFun.jsonTryParse(village.remark);
            if (villageRemark != null && villageRemark.fireCameras != '') {
                fireCameraDeviceIDs = villageRemark.fireCameras;
            }
        }

        var senseAlarmOption = await senseAlarmOptionDal.getByOptionID(alarmLog.optionID);
        if (senseAlarmOption == null) {
            return res.json(cFun.responseStatus(-1, '报警事件无配置'));
        }

        var senseAlarmModel = await senseAlarmModelDal.getByModelID(senseAlarmOption.modelID);
        if (senseAlarmModel == null) {
            return res.json(cFun.responseStatus(-1, '报警事件无配置'));
        }

        var relationDevices = await relationDeviceDal.getByDeviceScence(reqBody.deviceID, senseAlarmModel.sceneID);
    }

    if (relationDevices == null || relationDevices.length == 0) {
        return res.json(cFun.responseStatus(0, '无关联设备'));
    }

    var relDeviceIDs = Array.from(new Set(relationDevices.map(x => x.relDeviceID)));
    if (relDeviceIDs != null && relDeviceIDs.length > 0) {
        relDeviceIDs = relDeviceIDs.concat(fireCameraDeviceIDs);
        var cameras = await cameraDal.getByDeviceIDs(relDeviceIDs);
    }

    var devices = await deviceDal.getByDeviceIDs(relDeviceIDs);
    var resRelateDevices = []
    for (let i = 0; i < relDeviceIDs.length; i++) {
        let relDeviceID = relDeviceIDs[i];
        let device = devices.filter(x => x.deviceID == relDeviceID)[0];
        let camera = cameras.filter(x => x.deviceID == relDeviceID)[0];

        var relDevice = {
            deviceID: relDeviceID,
            name: device.name,
            type: device.type
        }

        if (camera != null) {
            relDevice.streamSource = camera.streamSource;
        }

        resRelateDevices.push(relDevice);
    }

    var resBody = {
        relateDevices: resRelateDevices
    }

    return res.json(cFun.responseStatus(0, 'success', resBody));
})
module.exports.getRelateDevices = getRelateDevices;

var alarmProcessReport = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;

    var alarmLog = await alarmLogDal.getByAlarmID(reqBody.alarmID);
    if (alarmLog == null) {
        return res.json(cFun.responseStatus(-1, '未找到该报警'));
    }

    if (alarmLog.isDeal == 1) {
        return res.json(cFun.responseStatus(0, '该报警已处理'));
    }

    if (cFun.removeSpace(alarmLog.alarmType) != 'fire') {
        //
        if (reqBody.status == null || Number(reqBody.status) == 0) {
            if (cFun.isNullOrEmpty(alarmLog.flowLog)) {
                alarmLog.flowLog = JSON.stringify({
                    currentFlowNo: 1,
                    currentStartTime: cFun.formatDateTime(),
                    hasPushFlowNo: -1
                });
            } else {
                var flowLogEntity = cFun.jsonTryParse(alarmLog.flowLog);
                if (flowLogEntity == null) {
                    return res.json(cFun.responseStatus(-1, '读取当前流程错误，更改流程失败'));
                }

                flowLogEntity.currentFlowNo = 1;
                flowLogEntity.currentStartTime = cFun.formatDateTime();
                alarmLog.flowLog = JSON.stringify(flowLogEntity);
            }

            alarmLog.alarmState = 4;
            alarmLogDal.update(alarmLog);

            return res.json(cFun.responseStatus(0, 'success'));
        } else if (Number(reqBody.status) == 1) {
            if (cFun.isNullOrEmpty(alarmLog.flowLog)) {
                alarmLog.flowLog = JSON.stringify({
                    currentFlowNo: 2,
                    currentStartTime: cFun.formatDateTime(),
                    hasPushFlowNo: 2
                });
            } else {
                var flowLogEntity = cFun.jsonTryParse(alarmLog.flowLog);
                if (flowLogEntity == null) {
                    return res.json(cFun.responseStatus(-1, '读取当前流程错误，更改流程失败'));
                }

                flowLogEntity.currentFlowNo = 2;
                flowLogEntity.hasPushFlowNo = 2;
                flowLogEntity.currentStartTime = cFun.formatDateTime();
                alarmLog.flowLog = JSON.stringify(flowLogEntity);
            }
        }
    }

    alarmLog.alarmState = 2;
    alarmLog.isDeal = 1;

    var processedContent = new ProcessedContentEntity();
    processedContent.userID = reqBody.head.userID;
    processedContent.remark = reqBody.remark;
    processedContent.resultType = reqBody.reasonType;
    alarmLog.processedContent = JSON.stringify(processedContent);

    alarmLog.processedTime = cFun.formatDateTime();
    alarmLogDal.update(alarmLog);

    openByMqtt.openAlarmResult(alarmLog);
    
    return res.json(cFun.responseStatus(0, 'success'));
})
module.exports.alarmProcessReport = alarmProcessReport;

var getAlarmTypes = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;

    var deviceTypes = await dictionaryDal.getByPath('db/e_device/type');

    var alarmTypes = [];
    for (let i = 0; i < deviceTypes.length; i++) {
        let deviceType = deviceTypes[i];
        alarmTypes.push({
            name: cFun.removeSpace(deviceType.typeName),
            type: cFun.removeSpace(deviceType.name)
        })
    }

    var resBody = {
        alarmTypes: alarmTypes
    }

    return res.json(cFun.responseStatus(0, 'success', resBody));
})
module.exports.getAlarmTypes = getAlarmTypes;

var getAlarmReasons = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;

    var dictionarys = await dictionaryDal.getByPath('alarmReason/' + reqBody.alarmType);
    if (dictionarys == null || dictionarys.length == 0) {
        return res.json(cFun.responseStatus(0, 'success', {
            alarmReasons: [{
                    name: '误报',
                    type: 'falseAlarm'
                },
                {
                    name: '人为',
                    type: 'manMade'
                }
            ]
        }));
    }

    var alarmReasons = [];
    for (let i = 0; i < dictionarys.length; i++) {
        let dictionary = dictionarys[i];
        alarmReasons.push({
            name: dictionary.typeName,
            type: dictionary.name
        })
    }

    var resBody = {
        alarmReasons: alarmReasons
    }

    return res.json(cFun.responseStatus(0, 'success', resBody));
})
module.exports.getAlarmReasons = getAlarmReasons;