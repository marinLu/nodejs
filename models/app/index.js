var express = require('express');
var router = express.Router();
module.exports = router;

const home=require('./home');
router.post("/getAppGlobalConfig",home.getAppGlobalConfig);
router.post("/pushRegistrationID",home.pushRegistrationID);

const event=require('./event');
router.post("/getAccessEventList",event.getAccessEventList);
router.post("/getSmokeDetectorEventList",event.getSmokeDetectorEventList);
router.post("/getParkingEventList",event.getParkingEventList);
router.post("/accessProcessReport",event.accessProcessReport);
router.post("/parkingProcessReport",event.parkingProcessReport);
router.post("/smokeDetectorProcessReport",event.smokeDetectorProcessReport);
router.post("/getEventNameList",event.getEventNameList);

const createCard=require('./createCard');
router.post("/getCardAreaList",createCard.getCardAreaList);
router.post("/getBuildingList",createCard.getBuildingList);
router.post("/getHouseList",createCard.getHouseList);
router.post("/getHousePeopleList",createCard.getHousePeopleList);
router.post("/createCard",createCard.createCard);

const alarm=require('./alarm');
router.post("/getAlarmModels",alarm.getAlarmModels);
router.post("/getAlarmList",alarm.getAlarmList);
router.post("/alarmProcessReport",alarm.alarmProcessReport);