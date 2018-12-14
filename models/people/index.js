var express = require('express');
var router = express.Router();
module.exports = router;


const people = require('./people');
router.post('/getPeopleInfo', people.getPeopleInfo);
router.post('/add', people.add);


const peopleManage = require('./peopleManage');
router.post('/getHouseUserByVillageID', peopleManage.getHouseUserByVillageID);
router.post('/insertPeopleInfo', peopleManage.insertPeopleInfo);
router.post('/delPeopleInfo', peopleManage.delPeopleInfo);
router.post('/delsPeopleInfo', peopleManage.delsPeopleInfo);
router.post('/updatePeopleInfo', peopleManage.updatePeopleInfo);
router.post('/getPeopleLike', peopleManage.getPeopleLike);
router.post('/getPeopleAdvancedLike', peopleManage.getPeopleAdvancedLike);
router.post('/insertPeopleHouseInfoList', peopleManage.insertPeopleHouseInfoList);
router.post('/delsPeopleHouseInfo', peopleManage.delsPeopleHouseInfo);
router.post('/getHouseListByPeopleId', peopleManage.getHouseListByPeopleId);


const peopletag= require('./peopleLabel');
router.post('/getPeopletag', peopletag.getPeopletag);
router.post('/updateAddPeopletag', peopletag.updateAddPeopletag);