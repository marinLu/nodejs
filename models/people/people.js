const peopleDal = require('../dals/p_peopleDal');
const cFun = require('../utils/commonFunc');
const peopleHouseDal = require('../dals/p_people_houseDal');
const resourceDal = require('../dals/s_resourceDal');
const redis = require('blueplus-redis');
const redisKey = require('../utils/redisKey');
const verifyAuthority = require('../authority/verifyAuthority');
const PeopleEntity = require('../entitys/p_peopleEntity');
const PeopleHouseEntity = require('../entitys/p_people_houseEntity');


var getPeopleInfo = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;
    var userFunctions = await redis.getAsync(redisKey.userAuthorityFunctions);

    if (cFun.isNullOrEmpty(reqBody.phID)) {
        var people = await peopleDal.getByPeopleID(reqBody.peopleID);
    } else {
        var people = await peopleDal.getByPeopleIDHouse(reqBody.peopleID, reqBody.phID);
    }

    if (people == null) {
        return res.json(-1, '不存在此人员信息');
    }
    var peoplePicUrl = '';
    var peopleHouse = await peopleHouseDal.getByPeopleID(reqBody.peopleID);
    if (peopleHouse == null) {
        var resources = await resourceDal.getBusinessType('peoplePic');
        peoplePicUrl = resources[0].filePath;
    } else {
        //获取peoplePicUrl
        var villageResources = await resourceDal.getByBusinessIDs('peoplePic', 'url', [peopleHouse.villageID]);
        if (villageResources != null && villageResources.length > 0) {
            peoplePicUrl = villageResources[0].filePath;
        } else {
            var resources = await resourceDal.getBusinessType('peoplePic');
            peoplePicUrl = resources[0].filePath;
        }
    }
    if (!cFun.isNullOrEmpty(people.headPic)) {
        people.headPic = peoplePicUrl + people.headPic;
    }
    people.credentialNo = cFun.maskCredentialNo(people.credentialNo, verifyAuthority.viewCredentialNo(userFunctions));
    people.peopleName = cFun.maskPeopleName(people.peopleName, verifyAuthority.viewPeopleName(userFunctions));
    people.phoneNo = cFun.maskPhoneNo(people.phoneNo, verifyAuthority.viewMobile(userFunctions));
    return res.json(cFun.responseStatus(0, 'success', {
        peopleInfo: people
    }));
});
module.exports.getPeopleInfo = getPeopleInfo;

var add = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;

    var people = new PeopleEntity();
    people.peopleID = cFun.guid();
    peopleDal.insert(people);

    return res.json(cFun.responseStatus(0, 'success'));

});
module.exports.add = add;