var express = require('express');
var router = express.Router();
module.exports = router;


const area = require('./area');

router.post(
    "/getBuildingList",
    area.getBuildingList
);

router.post(
    "/getBuildingPeopleCount",
    area.getBuildingPeopleCount
);

router.post(
    "/getBuildingPeopleInfo",
    area.getBuildingPeopleInfo
);

router.post(
    "/getParkingList",
    area.getParkingList
);

router.post(
    "/getPeoplePass",
    area.getPeoplePass
);

router.post(
    "/getBikeshedList",
    area.getBikeshedList
);


const inOut = require('./inOut');
router.post(
    "/getInOutList",
    inOut.getInOutList
);

router.post(
    "/getInOutDeviceList",
    inOut.getInOutDeviceList
);
router.post('/modifyInout', inOut.modifyInout);
router.post('/getInoutInfo', inOut.getInoutInfo);

