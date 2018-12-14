const cFun = require('../utils/commonFunc');
const alarmLogDal = require('../dals/e_alarm_logDal');
const userDal = require('../dals/s_userDal');
const pushLogDal = require('../dals/e_sense_alarm_push_logDal');
const PushLogEntity = require('../entitys/e_sense_alarm_push_logEntity');
const senseAlarmOptionDal = require('../dals/e_sense_alarm_optionDal');
const senseModelDal = require('../dals/e_sense_alarm_modelDal');
const mqtt = require('mqtt');
const config = require('../config')();

var push = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;

    var alarm = await alarmLogDal.getByAlarmID(reqBody.alarmID);
    if (alarm == null) {
        return res.json(cFun.responseStatus(-1, '未找到该报警信息'));
    }

    var alarmOption = await senseAlarmOptionDal.getByOptionID(alarm.optionID);
    if (alarmOption == null) {
        return res.json(cFun.responseStatus(-1, '未找到报警配置'));
    }

    var model = await senseModelDal.getByModelID(alarmOption.modelID);
    if (model == null) {
        return res.json(cFun.responseStatus(-1, '未找到报警模型'));
    }

    var user = await userDal.getByPhoneTel(reqBody.phoneNo);
    if (user == null) {
        return res.json(cFun.responseStatus(-1, '未找到推送用户'));
    }

    var pushLogEntity = new PushLogEntity();
    pushLogEntity.alarmPushID = cFun.guid();
    pushLogEntity.alarmID = reqBody.alarmID;
    pushLogEntity.userID = user.userID;
    pushLogEntity.pushType = reqBody.pushType;
    pushLogEntity.status = -1;

    var jumpParamValue = {};
    if (alarm.alarmType == 'pass') {
        jumpParamValue.jumpParam = 'alarmNotify';
        jumpParamValue.modelID = model.modelID;
        jumpParamValue.modelName = model.modelName;
        jumpParamValue.groupName = model.groupName;
    } else {
        jumpParamValue.jumpParam = alarm.alarmType;
    }

    var alarmContentEntity = cFun.jsonTryParse(alarm.alarmContent);

    var pushEntity = {
        title: alarmContentEntity == null ? alarm.alarmTypeName : alarmContentEntity.alarmTitle,
        alertContent: alarmContentEntity == null ? alarm.alarmContent : alarmContentEntity.alarmDetail,
        jumpParamValue: jumpParamValue
    };


    pushLogEntity.pushMessage = JSON.stringify(pushEntity);
    pushLogDal.insert(pushLogEntity)

    var mqttClient = mqtt.connect(process.env.MQTT_HOST);
    mqttClient.on('connect', function () {
        console.log('connected');
        mqttClient.publish('/service/inner/push', JSON.stringify(pushLogEntity), {
            qos: 1,
            retain: false
        });

    });

    return res.json(cFun.responseStatus(0, 'success'));

});
module.exports.push = push;