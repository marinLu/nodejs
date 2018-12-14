const cFun = require('../utils/commonFunc');
const alarmLogDal = require('../dals/e_alarm_logDal');
const device = require('../dals/e_deviceDal');
const AlarmLogEntity = require('../entitys/e_alarm_logEntity');
const config = require('../config');
const mqtt = require('mqtt');
const deviceAlarmEntity = require('../mqttEntitys/deviceAlarmEntity');
const villageDal = require('../dals/b_villageDal');
const toChi = require('../utils/numChinese');
const deviceEventDal = require('../dals/e_device_event_logDal');
const DeviceEventEntity = require('../entitys/e_device_event_logEntity');
const senseAlarmModelDal = require('../dals/e_sense_alarm_modelDal');
const senseAlarmOptionDal = require('../dals/e_sense_alarm_optionDal');
const openByMqtt = require('../openData/openByMqtt');

var nbdevicealarm = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;
    console.log(JSON.stringify(reqBody));
    var deviceList = await device.getByCodes(reqBody.deviceNos); //查询deviceNos对应的e_device设备
    if (deviceList == null || deviceList.length == 0) {
        return res.json(cFun.responseStatus(-1, '没有相关设备'));
    }

    var alarmType = reqBody.alarmType;
    var alarmTypeName = reqBody.alarmTypeName;
    var deviceType = reqBody.deviceType;

    //获取model
    var models = await senseAlarmModelDal.getByModelType('deviceAlarm'); //查询所有的e_sense_alarm_model中类型为设备报警的
    var modelID = mathAlarmModel(models, deviceType, alarmType) //取出匹配到的modelID

    if (modelID != '') {
        var options = await senseAlarmOptionDal.getByModelID(modelID); //取出modelID对应的e_sense_alarm_option
    }

    for (let i = 0; i < deviceList.length; i++) {
        let device = deviceList[i];

        var Intervals = config().deviceAlarmTimeInterval; //报警时间间隔

        var timeInterval = 60;
        if (Intervals[alarmType] != null) {
            timeInterval = Intervals[alarmType];
        }

        var deviceEventEntity = new DeviceEventEntity();
        deviceEventEntity.eventID = cFun.guid();
        deviceEventEntity.deviceType = deviceType;
        deviceEventEntity.deviceID = device.deviceID;
        deviceEventEntity.eventTime = reqBody.alarmTime;
        deviceEventEntity.eventType = alarmType;


        deviceEventDal.insert(deviceEventEntity);

        if (options == null || options.length == 0) {
            return res.json(cFun.responseStatus(-1, 'options为空'));
        }

        var option = options.filter(x => x.villageID == device.villageID)[0];
        if (option == null) {
            option = options.filter(x => cFun.isNullOrEmpty(x.villageID));
            if (option == null) {
                return res.json(cFun.responseStatus(-1, 'option为空'));;
            }
        }

        if (alarmType == "doorOpen") {
            var alarmLogs = await alarmLogDal.query("select * from e_alarm_log where alarmType = 'doorOpen' and deviceID = '" + device.deviceID + "' and isDeal = 0 order by insertTime Desc");
            for (var itemAlarmLog of alarmLogs) {
                itemAlarmLog.isDeal = 1;
                alarmLogDal.update(itemAlarmLog);
            }
        }

        var entity = new AlarmLogEntity();

        entity.alarmID = cFun.guid();
        entity.deviceID = device.deviceID;
        entity.deviceType = deviceType;
        entity.alarmType = alarmType;
        entity.alarmTypeName = alarmTypeName;
        entity.villageID = device.villageID;
        entity.alarmLevel = getAlarmLevel(alarmType);
        entity.alarmLevelName = getAlarmLevelName(entity.alarmLevel);
        entity.alarmCount = 1;
        entity.alarmState = 0;
        entity.alarmTime = reqBody.alarmTime;
        entity.longitude = device.longitude;
        entity.latitude = device.latitude;
        entity.optionID = option.optionID;
        entity.longitude = device.longitude;
        entity.latitude = device.latitude;
        entity.processDeadline = cFun.formatDateTime(cFun.addSeconds(reqBody.alarmTime, 60 * 60));

        alarmLogDal.insert(entity);

        //openData
        openByMqtt.openAlarm(entity);

        //mqttEntity
        var nbalarm = new deviceAlarmEntity();
        nbalarm.alarmID = entity.alarmID;
        nbalarm.deviceType = deviceType;
        nbalarm.deviceID = device.deviceID;
        nbalarm.buildingID = device.buildingID;
        nbalarm.deviceName = device.name;

        var villageInfo = await villageDal.getByVillageID(device.villageID);
        if (villageInfo == null) {
            return res.json(cFun.responseStatus(-1, '数据异常'));
        }

        nbalarm.villageID = villageInfo.villageID;
        nbalarm.villageName = villageInfo.name;
        nbalarm.address = nbalarm.villageName;


        nbalarm.houseID = device.houseID;
        if (device.houseID != null && device.houseID != '') {
            var house = await alarmLogDal.query("select * from b_house where houseID = '" + device.houseID + "'");
            if (house != null && house.length >= 1) {
                nbalarm.houseNo = house[0].houseNo;
                nbalarm.floor = house[0].floor;
                nbalarm.buildingNo = house[0].buildingNo;
            }
        } else {
            if (nbalarm.buildingID != null || nbalarm.buildingID != '') {
                var buildingInfo = await alarmLogDal.query("select * from b_building where buildingID = '" + device.buildingID + "'");
                if (buildingInfo != null && buildingInfo.length >= 1) {
                    nbalarm.buildingNo = buildingInfo[0].buildingNo;
                }
            }
        }

        if (nbalarm.buildingNo != null && nbalarm.buildingNo != '') {

            nbalarm.address += nbalarm.buildingNo + '号';
        }

        if (nbalarm.houseNo != null && nbalarm.houseNo != '') {
            nbalarm.address += nbalarm.houseNo;
        }
        nbalarm.alarmContent = nbalarm.address + ' ' + alarmTypeName;

        nbalarm.alarmTime = cFun.formatDateTime(reqBody.alarmTime, 'yyyy-MM-dd HH:mm:ss');
        nbalarm.isDeal = 0;
        nbalarm.alarmState = 0;
        nbalarm.alarmType = alarmType;
        nbalarm.alarmTypeName = alarmTypeName;
        nbalarm.alarmCount = 1;
        nbalarm.alarmLevel = getAlarmLevel(alarmType);
        nbalarm.alarmLevelName = getAlarmLevelName(nbalarm.alarmLevel);

        var beforeTime = cFun.formatDateTime(Number(new Date(reqBody.alarmTime)) - timeInterval * 1000);

        var alarmInfo = await alarmLogDal.query("select * from e_alarm_log where deviceID = '" + device.deviceID + "' and alarmType = '" + alarmType + "' and alarmTime >= '" + beforeTime + "' order by insertTime desc", "");
        if (alarmInfo != null && alarmInfo.length > 0) {
            alarmInfo[0].alarmCount++;
            alarmLogDal.update(alarmInfo[0]);
            nbalarm.alarmCount = alarmInfo[0].alarmCount;
        }
        sendMqttAlarm(nbalarm);
    }


    return res.json(cFun.responseStatus(0, 'success'));

});

var mathAlarmModel = function (models, deviceType, alarmType) {
    for (let i = 0; i < models.length; i++) {
        let modelRuleEntity = cFun.jsonTryParse(models[i].modelRule); //取出规则
        if (modelRuleEntity != null && modelRuleEntity.length > 0) {
            for (let j = 0; j < modelRuleEntity.length; j++) {
                if (cFun.removeSpace(modelRuleEntity[j].deviceType) ==
                    cFun.removeSpace(deviceType) &&
                    cFun.removeSpace(modelRuleEntity[j].eventType) ==
                    cFun.removeSpace(alarmType)) {
                    return models[i].modelID;
                }
            }
        }
    }

    return '';
}

var sendMqttAlarm = function (nbalarm) {
    var mqttClient = mqtt.connect(process.env.MQTT_HOST);
    mqttClient.on('connect', function () {
        console.log('connected');
        mqttClient.publish('/web/event/map/nbdevicealarm', JSON.stringify(nbalarm), {
            qos: 1,
            retain: false
        });

    });
}

var getAlarmLevel = function (type) {
    return config().alarmLevel[type];
};
var getAlarmLevelName = function (level) {
    if (level != null)
        return toChi.numberToChinese(level) + '级报警';
    return '一级报警';
};


module.exports.nbdevicealarm = nbdevicealarm;