var express = require('express');
var router = express.Router();
module.exports = router;
const cFun = require('../utils/commonFunc');
const statisticDal = require('../dals/e_statisticsDal');

const getByPaths=require('./getByPaths');
router.post("/getByPaths", getByPaths.getByPaths);


var homePageStat = require('./homePageStat.js');
router.post("/getRealTimeAlarmStatistics", homePageStat.getRealTimeAlarmStatistics);
router.post("/getRealTimeCars", homePageStat.getRealTimeCars);
router.post("/getRealTimePeoples", homePageStat.getRealTimePeoples);
router.post("/getRealTimeHouses", homePageStat.getRealTimeHouses);
router.post("/getRealTimeAlarmSense", homePageStat.getRealTimeAlarmSense);
router.post("/getAlarmSense", homePageStat.getAlarmSense);
router.post("/getSenseCars", homePageStat.getSenseCars);
router.post("/getSenseCarInOut", homePageStat.getSenseCarInOut);