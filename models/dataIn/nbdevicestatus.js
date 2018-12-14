const cFun = require('../utils/commonFunc');
const deviceOpsLogDal = require('../dals/e_device_ops_logDal');
const deviceDal = require('../dals/e_deviceDal');
const DeviceOpsLogEntity = require('../entitys/e_device_ops_logEntity');
const deviceEntity = require('../entitys/e_deviceEntity');
const config = require('../config');
const alarmLogDal = require('../dals/e_alarm_logDal');

var nbdeviceOps = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;
    console.log(JSON.stringify(reqBody));
    var deviceList = await deviceDal.getByCodes(reqBody.deviceNos);
    if (deviceList == null || deviceList.length == 0) {
        return res.json(cFun.responseStatus(-1, '没有相关设备'));
    }


    var deviceType = deviceList[0].type;


    for (let i = 0; i < deviceList.length; i++) {
        let device = deviceList[i];

        var Intervals = config().deviceOpsTimeInterval;

        var timeInterval = 60;
        if (Intervals != null && Intervals[deviceType] != null) {
            timeInterval = Intervals[deviceType];
        }

        var beforeTime = cFun.formatDateTime(Number(new Date()) - timeInterval * 1000);

        var alarmInfo = await deviceOpsLogDal.query("select * from e_device_ops_log where deviceID = '" + device.deviceID + "' and  deviceType = '" + deviceType + "' and alarmTime >= '" + beforeTime + "' order by insertTime desc", "");
        if (alarmInfo != null && alarmInfo.length > 0) {
            alarmInfo[0].opsCount++;
            deviceOpsLogDal.update(alarmInfo[0]);

            return res.json(cFun.responseStatus(0, 'success'));
        }

        var entity = new DeviceOpsLogEntity();

        entity.opsID = cFun.guid();
        entity.deviceID = device.deviceID;
        entity.deviceType = deviceType;
        entity.deviceState = reqBody.deviceState;
        entity.isOnline = reqBody.isOnline;
        entity.opsType = reqBody.opsType;
        entity.opsTypeName = reqBody.opsTypeName;
        entity.opsCount = 1;
        entity.alarmTime = reqBody.alarmTime;

        deviceOpsLogDal.insert(entity);





        device.stateTime = parseInt(Number(new Date(new Date().toLocaleString)) / 1000);
        device.state = reqBody.deviceState.toString() == "0" ? 2 : 1;
        deviceDal.update(device);

        //如果是门禁  把该门禁的报警处理
        if (deviceType == 'access') {

        }


    }


    return res.json(cFun.responseStatus(0, 'success'));

});




module.exports.nbdeviceOps = nbdeviceOps;


var nbdevicealarmRecovery = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;
    console.log(JSON.stringify(reqBody));
    var deviceList = await deviceDal.getByCodes(reqBody.deviceNos);
    if (deviceList == null || deviceList.length == 0) {
        return res.json(cFun.responseStatus(-1, '没有相关设备'));
    }




    for (let i = 0; i < deviceList.length; i++) {
        let device = deviceList[i];


        for (let i = 0; i < deviceList.length; i++) {
            let device = deviceList[i];

            var alarmLogs = await alarmLogDal.query("select * from e_alarm_log where  deviceID = '" + device.deviceID + "' and isDeal = 0 order by insertTime Desc");
            for (var itemAlarmLog of alarmLogs) {
                itemAlarmLog.isDeal = 1;
                alarmLogDal.update(itemAlarmLog);
            }

            device.stateTime = parseInt(Number(new Date(new Date().toLocaleString)) / 1000);
            device.state = 1;
            deviceDal.update(device);

        }
    }


    return res.json(cFun.responseStatus(0, 'success'));

});




module.exports.nbdevicealarmRecovery = nbdevicealarmRecovery;


var dooralarmRecovery = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;
    console.log(JSON.stringify(reqBody));
    var deviceList = await deviceDal.getByCodes(reqBody.deviceNos);
    if (deviceList == null || deviceList.length == 0) {
        return res.json(cFun.responseStatus(-1, '没有相关设备'));
    }







    for (let i = 0; i < deviceList.length; i++) {
        let device = deviceList[i];

        var alarmLogs = await alarmLogDal.query("select * from e_alarm_log where  deviceID = '" + device.deviceID + "' and isDeal = 0 order by insertTime Desc");
        for (var itemAlarmLog of alarmLogs) {
            itemAlarmLog.isDeal = 1;
            itemAlarmLog.processedContent = "门已关，系统自动处理。";
            itemAlarmLog.processedTime = cFun.formatDateTime();
            itemAlarmLog.alarmState = 2;
            alarmLogDal.update(itemAlarmLog);
        }

    }



    return res.json(cFun.responseStatus(0, 'success'));

});




module.exports.dooralarmRecovery = dooralarmRecovery;
