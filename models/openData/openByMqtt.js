const mqtt = require('mqtt');
const mqttOption = {
    qos: 1,
    retain: false
};
const _ = require('lodash');
const config=require('../config');

const deviceDal = require('../dals/e_deviceDal');
const cFun = require('../utils/commonFunc');
const villageDal = require('../dals/b_villageDal');
const streetDal = require('../dals/b_streetDal');
const committeeDal = require('../dals/b_committeeDal');
const buildingDal = require('../dals/b_buildingDal');
const houseDal = require('../dals/b_houseDal');
const userDal = require('../dals/s_userDal');
const dictionaryDal = require('../dals/s_dictionaryDal');
const departmentDal = require('../dals/s_departmentDal');
const authorityDal = require('../dals/s_authorityDal');
const alarmLogDal=require('../dals/e_alarm_logDal');



/**
 * 事件基础信息
 * @param {*} alarm 
 */
var openAlarm = async function (alarm, bigType = 'alarm', simType = '') {

    if (!cFun.isNullOrEmpty(alarm.deviceID)) {
        var device = await deviceDal.getByDeviceID(alarm.deviceID);

        if (device != null) {
            var building = await buildingDal.getByID(device.buildingID);
            var house = await houseDal.getByHouseID(device.houseID);
        }
    }

    var village = await villageDal.getByVillageID(alarm.villageID);
    var street = await streetDal.getByStreetID(village.streetID);
    var committee = await committeeDal.getByCommitteeID(village.committeeID);

    //组装报警发生地址
    var address = village.name;
    if (building != null && !cFun.isNullOrEmpty(building.buildingNo)) {
        address += building.buildingNo + '号';
    }
    if (house != null && !cFun.isNullOrEmpty(house.houseNo)) {
        address += house.houseNo;
    }

    var alarmReasonDic = [];
    if (alarm.isDeal != 0) {

        let dictionarys = await dictionaryDal.getLikePath('alarmReason');
        if (dictionarys == null || dictionarys.length == 0) {
            alarmReasonDic.push({
                name: 'falseAlarm',
                typeName: '误报'
            });

            alarmReasonDic.push({
                name: 'manMade',
                typeName: '人为'
            });
        } else {
            for (let i = 0; i < dictionarys.length; i++) {
                alarmReasonDic.push({
                    name: dictionarys[i].name,
                    typeName: dictionarys[i].typeName
                })
            }
        }
    }

    //已处理
    if (alarm.isDeal == 1) {
        alarm.processedUser = '';
        alarm.processedTime = cFun.formatDateTime(alarm.processedTime);

        var alarmProcessEntity = cFun.jsonTryParse(alarm.processedContent);
        if (alarmProcessEntity != null) {

            if (alarmProcessEntity.userID != null && alarmProcessEntity.userID != '') {

                //user 获取
                let user = await userDal.getByID(alarmProcessEntity.userID);
                if (user != null) {
                    alarm.processedUser = user.displayName;
                    alarm.processedUserPh = user.phoneTel;

                    var userDept = await departmentDal.getByDepartmentID(user.departmentID);
                    if (userDept != null) {
                        alarm.processedUserDept = userDept.name;
                    }
                }
            }

            var processedResult = alarmReasonDic.filter(x => x.name == alarmProcessEntity.resultType)[0];
            alarm.processedResult = processedResult == null ? '' : processedResult.typeName;
            alarm.processedRemark = alarmProcessEntity.remark;
        }
    }

    let entity = {
        TASKNUM: alarm.alarmID,
        DISCOVERYTIME: alarm.alarmTime,
        EXPECTTIME: alarm.processDeadline,
        DEVICECODE: device == null ? '' : device.code,
        STREETNAME: street.name,
        STREETCODE: street.streetNo,
        COMMUNITYNAME: committee.name,
        COMMUNITYCODE: committee.committeeNo,
        VILLAGENAME: village.name,
        VILLAGECODE: village.villageNo,
        ADDRESS: address,
        DISPOSEPEOPLE: alarm.processedUser == null ? '' : alarm.processedUser,
        DISPOSEDEPT: alarm.processedUserDept == null ? '' : alarm.processedUserDept,
        DISPOSEPHONE: alarm.processedUserPh == null ? '' : alarm.processedUserPh,
        ALARMBIGTYPE: bigType,
        ALARMSIMTYPE: buildSimType(alarm.alarmType),
        ALARMCHILDTYPE: alarm.alarmType,
        ALARMNAME: alarm.alarmTypeName,
        DESCRIPTION: alarm.alarmTypeName,
        X: alarm.longitude,
        Y: alarm.latitude,
        INFOSOURCE: 2
    };

    if (device != null) {
        entity.DESCRIPTION = village.name + device.name + alarm.alarmTypeName;
    }

    let mqttClient = mqtt.connect(process.env.MQTT_HOST);
    mqttClient.on('connect', function () {
        console.log('push success');
        mqttClient.publish('/open/event/info', JSON.stringify(entity), mqttOption);
        console.log(JSON.stringify(entity));
        mqttClient.end();

    });
}
module.exports.openAlarm = openAlarm;

/**
 * 事件处置推送MQ
 * @param {*} alarm 
 */
var openAlarmResult = async function (alarm) {

    if (alarm == null || alarm.isDeal == 0 || cFun.isNullOrEmpty(alarm.processedContent)) {
        return;
    }

    let processedEntity = cFun.jsonTryParse(alarm.processedContent);
    if (processedEntity == null) {
        return;
    }

    let userInfo = await userDal.getByID(processedEntity.userID);
    if (userInfo == null) {
        return;
    }

    let department = await departmentDal.getByDepartmentID(userInfo.departmentID);

    let entity = {
        TASKNUM: alarm.alarmID,
        DISPOSETIME: alarm.processedTime,
        PEOPLE: userInfo.displayName,
        DEPT: department == null ? '' : department.name,
        PHONE: userInfo.phoneTel,
        CONENT: processedEntity.remark,
        STATUS: STATUS(alarm.alarmState),
    };

    let mqttClient = mqtt.connect(process.env.MQTT_HOST);
    mqttClient.on('connect', function () {
        console.log('publish success')
        mqttClient.publish('/open/event/result', JSON.stringify(entity), mqttOption);
        console.log(JSON.stringify(entity));
        mqttClient.end();
    });
}
module.exports.openAlarmResult = openAlarmResult;

var openLocation = async function (userID,
    longitude, latitude) {

    let authoritys = await authorityDal.getByUserID(userID)
    let userInfo = await userDal.getByID(userID)

    if (authoritys == null || authoritys.length == 0 || userInfo == null) {
        return;
    }

    let department = await departmentDal.getByDepartmentID(userInfo.departmentID);
    let streetAuthority = _.find(authoritys, x => cFun.isStreetCode(x.areaCode));

    let entity = {
        PEOPLECODE: userID,
        NAME: userInfo.displayName,
        PHONE: userInfo.phoneTel,
        DEPT: department != null ? department.name : '',
        STREETNAME: '',
        STREETCODE: '',
        X: longitude,
        Y: latitude,
        TASKNUM: ''
    };

    if (streetAuthority != null) {
        entity.STREETCODE = streetAuthority.areaCode;

        let streetInfo = await streetDal.getByStreetNo(streetAuthority.areaCode);
        if (streetInfo != null) {
            entity.STREETCODE = streetInfo.streetNo;
        }
    }

    let mqttClient = mqtt.connect(process.env.MQTT_HOST);
    mqttClient.on('connect', function () {
        mqttClient.publish('/open/app/location', JSON.stringify(entity), mqttOption);

        mqttClient.end();
    });
}
module.exports.openLocation = openLocation;

var STATUS = function (alarmState) {
    switch (alarmState) {
        case 0:
            return 0;
        case 1:
            return 2;
        case 2:
            return 2;
        case 3:
            return 2;
        case 4:
            return 1;
        default:
            return 0;
    }
}

var buildSimType = function (type) {
    let publicSafe = ['fire', 'voltageAlert', 'waterPressureAlert', 'gasAlert'];
    if (publicSafe.indexOf(type) >= 0) {
        return 'publicSafe';
    }

    let publicManage = ['doorOpen', 'parkCar', 'chargeAlert', 'manholeCoverOpen', 'waterLevelAlert', 'fireCockOpen', 'waterOut'];
    if (publicManage.indexOf(type) >= 0) {
        return 'publicManage';
    }

    let publicService = ['tempAlert'];
    if (publicService.indexOf(type) >= 0) {
        return 'publicService';
    }
}

// var test = async function () {
//     var alarm=await alarmLogDal.getByAlarmID('7e30c400b01f11e8b6635db0eaaba7b1');
//     openAlarm(alarm)
// }
// test();