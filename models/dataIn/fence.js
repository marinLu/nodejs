const cFun = require('../utils/commonFunc');
const alarmLogDal = require('../dals/e_alarm_logDal');
const device = require('../dals/e_deviceDal');
const AlarmLogEntity = require('../entitys/e_alarm_logEntity');
const config=require('../config');
const deviceDal = require('../dals/e_deviceDal');
var fenceAlarm = cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;

        var deviceList = await device.getByCodes(reqBody.deviceNos);
        if (deviceList == null || deviceList.length == 0) {
            return res.json(cFun.responseStatus(-1, '没有相关设备'));
        }

        var alarmType = getFenceAlarmType(reqBody.type);
        var fenceTimeInterval=config().deviceAlarmTimeInterval.fence;

        var deviceAlarmList = [];
        for (let i = 0; i < deviceList.length; i++) {
            let device = deviceList[i];

            var deviceAlarmLogs = await alarmLogDal.getByDevice(device.deviceID, alarmType,(new Date()).ad);

            var entity = new AlarmLogEntity();

            entity.alarmID = cFun.guid();
            entity.deviceID = device.deviceID;
            entity.deviceType = 'fence';
            entity.alarmType = alarmType;
            entity.alarmTypeName = getFenceAlarmTypeName(reqBody.type);
            entity.alarmLevel = getAlarmLevel();
            entity.alarmLevelName = getAlarmLevelName();
            entity.alarmCount = 1;
            entity.alarmState = 0;
            entity.alarmTime = reqBody.alarmTime;
            entity.longitude=device.longitude;
            entity.latitude=device.latitude;

            alarmLogDal.insert(entity);
            
        }

        return res.json(cFun.responseStatus(0, 'success'));
    
});
module.exports.fenceAlarm = fenceAlarm;

var getFenceAlarmType = function (type) {
    switch (type) {
        case 1:
            return 'break';
        case 2:
            return 'invasion';
        default:
            return '';
    }
};

var getFenceAlarmTypeName = function (type) {
    switch (type) {
        case 1:
            return '断线';
        case 2:
            return '入侵';
        default:
            return '';
    }
};

var getAlarmLevel = function (type) {
    return '1';
};
var getAlarmLevelName = function (type) {
    return '一级报警';
};
var updateDevice = cFun.awaitHandlerFactory(async (req, res, next) => {//更改摄像头表状态
    var reqBody = req.body;
    var deviceInfo = await deviceDal.getByDeviceID(reqBody.deviceID);
    if (deviceInfo == null) {
        return res.json(cFun.responseStatus(-1, '没有相关的设备信息'));
    }
    deviceInfo.state = reqBody.state;
    deviceInfo.stateTime=cFun.formatDateTime(new Date()),
    deviceDal.update(deviceInfo);
    return res.json(cFun.responseStatus(0, 'success'));
});
module.exports.updateDevice = updateDevice;