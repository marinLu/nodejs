var express = require('express');
var router = express.Router();
module.exports = router;

const alarm=require('./alarm');
router.post("/getRelateDevices",alarm.getRelateDevices);
router.post("/alarmProcessReport",alarm.alarmProcessReport);
router.post("/getAlarmTypes",alarm.getAlarmTypes);
router.post("/getAlarmReasons",alarm.getAlarmReasons);

const alarmModel=require('./alarmModel');
router.post('/getAlarmModels',alarmModel.getAlarmModels);
router.post('/getAllModels',alarmModel.getAllModels);

const flow=require('./flow');
router.post("/getAlarmFlows",flow.getAlarmFlows);
router.post("/updateAlarmCurrentFlow",flow.updateAlarmCurrentFlow);
router.post("/getCurrentFlowNo",flow.getCurrentFlowNo);

const getAlarm=require('./getAlarm');
router.post("/getAlarmList",getAlarm.getAlarmList);
router.post("/getAlarm",getAlarm.getAlarm);

const push=require('./push');
router.post("/push",push.push);
