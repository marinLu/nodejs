const cFun = require('../utils/commonFunc');
const modelDal = require('../dals/e_sense_alarm_modelDal');
const alarmOptionDal = require('../dals/e_sense_alarm_optionDal');
const alarmLogDal = require('../dals/e_alarm_logDal');
const ProcessedContentEntity = require('blueplus-dals').processedContent;
const villageDal = require('../dals/b_villageDal');
const peopleDal = require('../dals/p_peopleDal');
const peopleHouseDal = require('../dals/p_people_houseDal');
const accessLogDal = require('../dals/e_access_logDal');

var getAlarmModels = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;

    if (reqBody.villageIDs == null) {
        reqBody.villageIDs = [];
    }

    var models = await modelDal.getByFunctionID();
    if (models == null || models.length == 0) {
        return res.json(cFun.responseStatus(0, '无事件模型'));
    }
    models = models.filter(x => x.groupName != null && x.groupName != '');
    var groupNames = Array.from(new Set(models.map(x => x.groupName)));
    if (groupNames == null || groupNames.length == 0) {
        return res.json(cFun.responseStatus(0, '无事件模型'));
    }

    var resGroups = [];
    for (let i = 0; i < groupNames.length; i++) {
        let groupName = groupNames[i];

        let groupModels = models.filter(x => x.groupName == groupName);
        if (groupModels.length > 0) {
         
            if (reqBody.villageIDs.length > 0) {
               var  groupUnsolveNum = await alarmLogDal.countUnsolveNumByModelIDs(groupModels.map(x => x.modelID), reqBody.villageIDs, null);
            }

            let groupInfo = {
                groupName: groupName,
                unsolveNum: groupUnsolveNum,
                models: []
            }

            for (let i = 0; i < groupModels.length; i++) {
                let groupModel = groupModels[i];

                if (reqBody.villageIDs.length > 0) {
                    var modelUnsolveNum = await alarmLogDal.countUnsolveNumByModelIDs([groupModel.modelID], reqBody.villageIDs, null);
                }

                groupInfo.models.push({
                    modelName: groupModel.modelName,
                    modelID: groupModel.modelID,
                    unsolveNum: modelUnsolveNum
                });
            }

            resGroups.push(groupInfo);
        }
    }

    return res.json(cFun.responseStatus(0, 'success', {
        groups: resGroups
    }))
});
module.exports.getAlarmModels = getAlarmModels;

var getAlarmList = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;

    var options = await alarmOptionDal.getByModelID(reqBody.modelID);
    if (options == null || options.length == 0) {
        return res.json(cFun.responseStatus(0, '无报警'));
    }

    options = options.filter(x => reqBody.villageIDs.filter(y => y == x.villageID).length > 0);
    if (options.length == 0) {
        return res.json(cFun.responseStatus(0, '无报警'));
    }

    var alarmList = await alarmLogDal.getAlarmListByOption(options.map(x => x.optionID),
        reqBody.villageIDs, reqBody.state,
        reqBody.pageNum, reqBody.pageSize);

    if (alarmList == null || alarmList.length == 0) {
        return res.json(cFun.responseStatus(0, '无报警'));
    }

    var villageIDs = Array.from(new Set(alarmList.map(x => x.villageID)));
    var villages = await villageDal.getByVillageIDs(villageIDs);


    var resAlarms = [];
    for (let i = 0; i < alarmList.length; i++) {
        let alarm = alarmList[i];
        var resAlarm = {
            alarmID: alarm.alarmID,
            alarmTime: cFun.formatDateTime(alarm.alarmTime),
            villageName: '',
            peopleName: '',
            buildingNo: '',
            houseNo: '',
            state: alarm.isDeal,
            trafficRecords: [],
            visitorRecords: [],
            tag: []
        };

        let village = villages.filter(x => x.villageID == alarm.villageID);
        if (village != null) {
            resAlarm.villageName = village.name;
        }

        if (alarm.alarmType == 'pass') {
            let alarmContent = cFun.jsonTryParse(alarm.alarmContent);
            if (alarmContent != null) {
                let people = await peopleDal.getByPeopleID(alarmContent.peopleID);
                if (people != null) {
                    //姓名
                    resAlarm.peopleName = people.peopleName;

                    //住址
                    let peopleHouse = await peopleHouseDal.getByPeopleID(people.peopleID);
                    if (peopleHouse != null) {
                        resAlarm.buildingNo = peopleHouse.buildingNo;
                        resAlarm.houseNo = peopleHouse.houseNo;
                    }

                    //通行记录
                    var accessLogs = await accessLogDal.getByCredentialTypeNo(people.credentialNo, people.credentialType);
                    accessLogs = accessLogs.splice(0, 10);
                    for (let i = 0; i < accessLogs.length; i++) {
                        let accessLog = accessLogs[i];
                        resAlarm.trafficRecords.push(accessLog.openTime);
                    }
                }
            }
            if (alarm.isDeal == 1) {

                let processedContent = cFun.jsonTryParse(alarm.processedContent);
                if (processedContent != null) {
                    resAlarm.resultType = alarmResultTypeConvert(processedContent.resultType);
                }

                if (resAlarm.resultType == 1) {
                    resAlarm.tag.push('可疑');
                }

            }

        }

        resAlarms.push(resAlarm);
    }

    return res.json(cFun.responseStatus(0, 'success', {
        alarms: resAlarms
    }))
});
module.exports.getAlarmList = getAlarmList;

var alarmProcessReport = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;

    var alarmLog = await alarmLogDal.getByAlarmID(reqBody.alarmID);
    if (alarmLog == null) {
        return res.json(cFun.responseStatus(-1, '无此报警数据'));
    }

    if (alarmLog.processedContent == null || alarmLog.processedContent == '' ||
        cFun.removeSpace(alarmLog.processedContent) == '') {
        var entity = new ProcessedContentEntity();
        entity.resultType = resultTypeConvert(reqBody.resultType);
        alarmLog.processedContent = JSON.stringify(entity);
    } else {
        var entity = cFun.jsonTryParse(alarmLog.processedContent);
        entity.resultType = resultTypeConvert(reqBody.resultType);
        alarmLog.processedContent = JSON.stringify(entity);
    }

    alarmLog.isDeal = 1;
    alarmLog.alarmState = 2;
    alarmLog.processedTime = cFun.formatDateTime();
    alarmLogDal.update(alarmLog);
    return res.json(cFun.responseStatus(0, 'success'));
});
module.exports.alarmProcessReport = alarmProcessReport;

var resultTypeConvert = function (resultType) {
    if (resultType == 1) {
        return 'markedSuspect';
    }

    if (resultType == 2) {
        return 'cancelMarked';
    }
}

var alarmResultTypeConvert = function (resultType) {
    if (resultType == 'markedSuspect') {
        return 1;
    }

    if (resultType == 'cancelMarked') {
        return 2;
    }
}