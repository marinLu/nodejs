const cFun = require('../utils/commonFunc');
const alarmLogDal = require('../dals/e_alarm_logDal');
const senseAlarmOptionDal = require('../dals/e_sense_alarm_optionDal');
const senseAlarmFlowDal = require('../dals/e_sense_alarm_flowDal');
const userDal = require('../dals/s_userDal');


var getAlarmFlows = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;

    var senseAlarm = await alarmLogDal.getByAlarmID(reqBody.alarmID);
    if (senseAlarm == null) {
        return res.json(cFun.responseStatus(-1, '未找到该报警信息'));
    }

    var alarmOption = await senseAlarmOptionDal.getByOptionID(senseAlarm.optionID);
    if (alarmOption == null) {
        return res.json(cFun.responseStatus(-1, '未找到报警推送流程'));
    }

    var flowInfo = await senseAlarmFlowDal.getByID(alarmOption.flowID);
    if (flowInfo == null) {
        return res.json(cFun.responseStatus(-1, '未找到报警推送流程'));
    }

    var rule = cFun.jsonTryParse(flowInfo.flowRule);
    if (rule == null) {
        return res.json(cFun.responseStatus(-1, '未找到报警推送流程'));
    }

    var resFlows = [];
    for (let i = 0; i < rule.flows.length; i++) {
        const flow = rule.flows[i];

        var resUser = [];
        if (flow.userIDs != null && flow.userIDs.length > 0) {

            for (let j = 0; j < flow.userIDs.length; j++) {

                let user = await userDal.getByID(flow.userIDs[j]);

                if (user != null) {
                    resUser.push({
                        name: user.displayName,
                        phone: user.phoneTel,
                        position: user.position
                    });
                }

            }
        }


        if (i == 0) {
            resFlows.push({
                no: flow.no,
                name: flow.name,
                countdown: flow.time,
                startTime: senseAlarm.alarmTime,
                duty: flow.duty,
                users: resUser
            });
        } else {
            let startTime = cFun.addSeconds(resFlows[i - 1].startTime, resFlows[i - 1].countdown);
            resFlows.push({
                no: flow.no,
                name: flow.name,
                countdown: flow.time,
                startTime: startTime,
                duty: flow.duty,
                users: resUser
            });
        }


    }

    for (let i = 0; i < resFlows.length; i++) {
        resFlows[i].startTime = cFun.formatDateTime(resFlows[i].startTime);
    }

    var resBody = {
        flowName: flowInfo.flowName,
        timeout: cFun.formatDateTime(cFun.addSeconds(senseAlarm.alarmTime, rule.timeout)),
        flows: resFlows,
        currentFlowNo: 0
    };

    if (!cFun.isNullOrEmpty(senseAlarm.flowLog)) {
        var flowLogEntity = cFun.jsonTryParse(senseAlarm.flowLog);
        if (flowLogEntity != null) {
            resBody.currentFlowNo = flowLogEntity.currentFlowNo;
        }
    }

    return res.json(cFun.responseStatus(0, 'success', resBody));

});
module.exports.getAlarmFlows = getAlarmFlows;

var updateAlarmCurrentFlow = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;

    var alarm = await alarmLogDal.getByAlarmID(reqBody.alarmID);
    if (alarm == null) {
        return res.json(cFun.responseStatus(-1, '不存在此报警信息'));
    }

    if (Number(reqBody.flowNo) <= 0) {
        return res.json(cFun.responseStatus(-1, '要更新到的flowNo错误'));
    }

    if (cFun.isNullOrEmpty(alarm.flowLog)) { //第一阶段也未推送
        alarm.flowLog = JSON.stringify({
            currentFlowNo: 0,
            currentStartTime: cFun.formatDateTime(),
            hasPushFlowNo: -1
        });
    } else {
        var flowLogEntity = cFun.jsonTryParse(alarm.flowLog);
        if (flowLogEntity == null) {
            return res.json(cFun.responseStatus(-1, '读取当前流程错误，更改流程失败'));
        }

        flowLogEntity.currentFlowNo = Number(reqBody.flowNo);
        flowLogEntity.currentStartTime = cFun.formatDateTime();
        alarm.flowLog = JSON.stringify(flowLogEntity);
    }

    alarmLogDal.update(alarm);
    return res.json(cFun.responseStatus(0, 'success'));

});
module.exports.updateAlarmCurrentFlow = updateAlarmCurrentFlow;

var getCurrentFlowNo = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;

    var alarm = await alarmLogDal.getByAlarmID(reqBody.alarmID);
    if (alarm == null) {
        return res.json(cFun.responseStatus(-1, '不存在此报警信息'));
    }

    if (cFun.isNullOrEmpty(alarm.flowLog)) { //第一阶段也未推送
        return res.json(cFun.responseStatus(0, 'success', {
            currentFlowNo: 0
        }))
    }

    var flowLogEntity = cFun.jsonTryParse(alarm.flowLog);
    if (flowLogEntity == null) {
        return res.json(cFun.responseStatus(-1, '读取当前流程错误，更改流程失败'));
    }
    return res.json(cFun.responseStatus(0, 'success', {
        currentFlowNo: flowLogEntity.currentFlowNo
    }));

});
module.exports.getCurrentFlowNo = getCurrentFlowNo;