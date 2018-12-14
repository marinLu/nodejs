const cFun = require('../utils/commonFunc');
const userDal = require('../dals/s_userDal');
const departmentDal = require('../dals/s_departmentDal');
const mqtt = require('mqtt');
const config = require('../config')();
const PushLogEntity = require('../entitys/e_sense_alarm_push_logEntity');
const pushLogDal = require('../dals/e_sense_alarm_push_logDal');


var infoReport = cFun.awaitHandlerFactory(async (req, res, next) => {
        var reqBody = req.body;
        if (reqBody.code == 'urinalysisPush') {
                return urinalysisPush(reqBody, res);
        }
        return res.json(cFun.responseStatus(0, 'success'));
});
module.exports.infoReport = infoReport;


var urinalysisPush = async function (reqBody, res) {
        var dataEntity = cFun.jsonTryParse(reqBody.data);
        if (dataEntity == null) {
                return res.json(cFun.responseStatus(-1, 'data 为空'));
        }

        var department = await departmentDal.getCode('drugOfficial');
        if (department == null) {
                return res.json(cFun.responseStatus(-1, '未找到相关通知人信息'));
        }

        var users = await userDal.getByDepartmentID(department.departmentID);
        if (users == null) {
                return res.json(cFun.responseStatus(-1, '未找到推送用户'));
        }

        for (let i = 0; i < users.length; i++) {
                let user = users[i];
                let pushLogEntity = new PushLogEntity();
                pushLogEntity.alarmPushID = cFun.guid();
                pushLogEntity.alarmID = cFun.guid();
                pushLogEntity.userID = user.userID;
                pushLogEntity.pushType = 1;
                pushLogEntity.status = 0;

                let jumpParamValue = {};
                jumpParamValue.jumpParam = 'urinalysis';

                let pushEntity = {
                        title: dataEntity.alarmTitle,
                        alertContent: dataEntity.alarmContent,
                        jumpParamValue: jumpParamValue
                };


                pushLogEntity.pushMessage = JSON.stringify(pushEntity);
                pushLogDal.insert(pushLogEntity)

              
                var mqttClient = mqtt.connect(process.env.MQTT_HOST);
                mqttClient.on('connect', function () {
                        let message=JSON.stringify(pushLogEntity);

                        console.log('connected');
                        console.log(message)
                        mqttClient.publish('/service/inner/push', message, {
                                qos: 1,
                                retain: false
                        });
                });
        }

        return res.json(cFun.responseStatus(0, 'success'));
}