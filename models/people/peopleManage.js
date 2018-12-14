const peopleDal = require('../dals/p_peopleDal');
const cFun = require('../utils/commonFunc');
const dateFormat = require('../utils/dateFormat');
const peopleHouseDal = require('../dals/p_people_houseDal');
const sendToMinio = require('../utils/sendToMinio');
const PeopleEntity = require('../entitys/p_peopleEntity');
const PeopleHouseEntity = require('../entitys/p_people_houseEntity');
const uuid = require("uuid");
const config = require('../config');
var bluerequest = require('request');
var getHouseUserByVillageID = cFun.awaitHandlerFactory(async (req, res, next) => {//根据小区ID获取所有的住户
    var reqBody = req.body;
    let houseUser = null;
    let count = 0;
    houseUser = await peopleDal.getHouseUserByVillageID(Number(reqBody.pageNum), Number(reqBody.pageSize), reqBody.villageIDs);
    count = await peopleHouseDal.getPeopleIDByVillageIDCountsum(reqBody.villageIDs);//总条数
    return res.json(cFun.responseStatus(0, 'success', {
        houseUser: houseUser, count: count
    }));

});
module.exports.getHouseUserByVillageID = getHouseUserByVillageID;
var insertPeopleInfo = cFun.awaitHandlerFactory(async (req, res, next) => {//采集人口信息
    var reqBody = req.body;

    let peopleEntity = new PeopleEntity();
    let peopleHouseEntity = new PeopleHouseEntity();
    var idcord = await peopleDal.getCredentialNo(reqBody.credentialNo);
    if (idcord.length > 0) {

        return res.json(cFun.responseStatus(2, '此用户已存在！'));
    }
    peopleEntity.peopleID = cFun.guid();
    peopleHouseEntity.phID = cFun.guid();
    peopleHouseEntity.peopleID = peopleEntity.peopleID;

    peopleHouseEntity.villageID = reqBody.villageID;
    peopleHouseEntity.buildingID = reqBody.buildingID;
    peopleHouseEntity.buildingNo = reqBody.buildingNo;
    peopleHouseEntity.houseNo = reqBody.houseNo;
    peopleHouseEntity.houseID = reqBody.houseID;
    peopleHouseEntity.createType = reqBody.createType;
    peopleHouseEntity.workState = reqBody.workState;
    peopleHouseEntity.relationshipWithHouseHold = reqBody.relationshipWithHouseHold;
    peopleHouseEntity.personType = reqBody.personType;
    peopleHouseEntity.sourceType = reqBody.sourceType;
    peopleHouseEntity.resideMode = reqBody.resideMode;
    peopleHouseEntity.isChildren = reqBody.isChildren;
    peopleHouseEntity.isFocus = reqBody.isFocus;
    peopleHouseEntity.isAged = reqBody.isAged;//
    peopleHouseEntity.isCare = reqBody.isCare;
    peopleHouseEntity.isHouse = reqBody.isHouse;
    peopleHouseEntity.isOperation = reqBody.isOperation;
    peopleHouseEntity.isDelete = 0;
    peopleHouseEntity.lastOpenDoorTime = cFun.formatDateTime(new Date());

    peopleEntity.peopleType = reqBody.peopleType;
    peopleEntity.credentialType = reqBody.credentialType;
    peopleEntity.credentialTypeCN = reqBody.credentialTypeCN;
    peopleEntity.credentialNo = reqBody.credentialNo;
    peopleEntity.peopleName = reqBody.peopleName;
    peopleEntity.gender = reqBody.gender;
    peopleEntity.genderCode = reqBody.genderCode;
    peopleEntity.nation = reqBody.nation;
    peopleEntity.nationCode = reqBody.nationCode;
    peopleEntity.birthDate = reqBody.birthDate;
    peopleEntity.origin = reqBody.origin;
    peopleEntity.originCode = reqBody.originCode;
    peopleEntity.domiclle = reqBody.domiclle;
    peopleEntity.domiclleCode = reqBody.domiclleCode;
    peopleEntity.domiclleRoadName = reqBody.domiclleRoadName;
    peopleEntity.domiclleRoadCode = reqBody.domiclleRoadCode;
    peopleEntity.domiclleDetailAddress = reqBody.domiclleDetailAddress;
    peopleEntity.domiclleAddress = reqBody.domiclleAddress;
    peopleEntity.residence = reqBody.residence;
    peopleEntity.residenceCode = reqBody.residenceCode;
    peopleEntity.residenceRoadName = reqBody.residenceRoadName;
    peopleEntity.residenceRoadCode = reqBody.residenceRoadCode;
    peopleEntity.residenceDetailAddress = reqBody.residenceDetailAddress;
    peopleEntity.residenceAddress = reqBody.residenceAddress;
    peopleEntity.education = reqBody.education;
    peopleEntity.educationCode = reqBody.educationCode;
    peopleEntity.political = reqBody.political;
    peopleEntity.political_Code = reqBody.political_Code;
    peopleEntity.maritialStatus = reqBody.maritialStatus;
    peopleEntity.maritalStatusCode = reqBody.maritalStatusCode;
    peopleEntity.spouseName = reqBody.spouseName;
    peopleEntity.spouseNo = reqBody.spouseNo;
    peopleEntity.nationality = reqBody.nationality;
    peopleEntity.nationalityCode = reqBody.nationalityCode;
    peopleEntity.entryTime = reqBody.entryTime;
    peopleEntity.surnameEng = reqBody.surnameEng;
    peopleEntity.nameEng = reqBody.nameEng;
    peopleEntity.phoneNo = reqBody.phoneNo;



    let headPicName = "face" + "/" + dateFormat.getDate(new Date()) + "/" + uuid.v4() + ".jpg";
    sendToMinio.put("blueplus", headPicName, new Buffer(reqBody.headPic, "base64"));
    let idPicName = "face" + "/" + dateFormat.getDate(new Date()) + "/" + uuid.v4() + ".jpg";
    sendToMinio.put("blueplus", idPicName, new Buffer(reqBody.idPic, "base64"));
    let headPicAdd = "http://47.75.190.168:9000/blueplus/" + headPicName;
    let idPicAdd = "http://47.75.190.168:9000/blueplus/" + idPicName;
    peopleEntity.headPic = headPicAdd;
    peopleEntity.idPic = idPicAdd;
    peopleEntity.livePic = reqBody.livePic;
    peopleEntity.source = reqBody.source;
    peopleEntity.isDeleted = 0;
    peopleEntity.faceID = cFun.guid();
    await peopleDal.insert(peopleEntity);
    await peopleHouseDal.insert(peopleHouseEntity);
    let phID = peopleHouseEntity.phID;
    let peopleID = peopleEntity.peopleID;
    let fId = peopleEntity.faceID;
    var obj = { peopleID :  peopleEntity.peopleID, faceID: fId, buildingID: reqBody.buildingID, command: 1 ,phID : peopleHouseEntity.phID , headPic: reqBody.headPic };
    bluerequest({
        url: "http://" + config().host.hostName + ":" + config().host.port + "/api/datain/face/pic/addormodify",
        method: "POST",
        json: true,
        headers: {
            "content_type": "application/json"
        },
        body: obj
    }, function (error, response, body) {
        if (!error) {
            console.log("发送给蓝加平台成功");
        }
    })
    return res.json(cFun.responseStatus(0, 'success', {
        phID: phID,
        peopleID, peopleID
    }));
});
module.exports.insertPeopleInfo= insertPeopleInfo;
var insertPeopleHouseInfoList= cFun.awaitHandlerFactory(async (req, res, next) => {//批量新增房屋人口信息
    var reqBody = req.body;
    var peopleHouseEntityList=reqBody.peopleHouseEntityList;
    for (const item of peopleHouseEntityList) {
        let peopleHouseEntity = new PeopleHouseEntity();
        peopleHouseEntity.phID = cFun.guid();
        peopleHouseEntity.peopleID = item.peopleID;
        peopleHouseEntity.villageID = item.villageID;
        peopleHouseEntity.buildingID = item.buildingID;
        peopleHouseEntity.buildingNo = item.buildingNo;
        peopleHouseEntity.houseNo = item.houseNo;
        peopleHouseEntity.houseID = item.houseID;
        peopleHouseEntity.createType = item.createType;
        peopleHouseEntity.workState = item.workState;
        peopleHouseEntity.relationshipWithHouseHold = item.relationshipWithHouseHold;
        peopleHouseEntity.personType = item.personType;
        peopleHouseEntity.sourceType = item.sourceType;
        peopleHouseEntity.resideMode = item.resideMode;
        peopleHouseEntity.isChildren = item.isChildren;
        peopleHouseEntity.isFocus = item.isFocus;
        peopleHouseEntity.isAged = item.isAged;//
        peopleHouseEntity.isCare = item.isCare;
        peopleHouseEntity.isHouse = item.isHouse;
        peopleHouseEntity.isOperation = item.isOperation;
        peopleHouseEntity.isDelete = 0;
        peopleHouseEntity.lastOpenDoorTime = cFun.formatDateTime(new Date());
        await peopleHouseDal.insert(peopleHouseEntity);
    }
   
    return res.json(cFun.responseStatus(0, 'success'));
});
module.exports.insertPeopleHouseInfoList = insertPeopleHouseInfoList;

var delsPeopleHouseInfo= cFun.awaitHandlerFactory(async (req, res, next) => {//批量删除房屋人口信息
    var reqBody = req.body;
    var peopleHouseIds=reqBody.peopleHouseIds;
    for (const item of peopleHouseIds) {
        await peopleHouseDal.delete(item);
    }
    return res.json(cFun.responseStatus(0, 'success'));
});
module.exports.delsPeopleHouseInfo = delsPeopleHouseInfo;


var delPeopleInfo = cFun.awaitHandlerFactory(async (req, res, next) => { //删除住户信息
    var reqBody = req.body;

    var pe = await peopleDal.getByPeopleID(reqBody.peopleID);

    var peh = await peopleHouseDal.getByID(reqBody.phID);

    if (pe.length != null || peh.length != null) {

        return res.json(cFun.responseStatus(2, '住户信息不存在！'));
    }
    pe.isDeleted = 1;//伪删除
    peh.isDelete = 1;//伪删除
    peopleDal.updateIsdel(pe);
    peopleHouseDal.updateHousep(peh);

    var obj = { peopleID :  pe.peopleID, faceID: pe.faceID, buildingID: pe.buildingID};
    bluerequest({
        url: "http://" + config().host.hostName + ":" + config().host.port + "/api/datain/face/delete",
        method: "POST",
        json: true,
        headers: {
            "content_type": "application/json"
        },
        body: obj
    }, function (error, response, body) {
        if (!error) {
            console.log("发送给蓝加平台成功");
        }
    })

    return res.json(cFun.responseStatus(0, 'success'));

});
module.exports.delPeopleInfo = delPeopleInfo;

var delsPeopleInfo = cFun.awaitHandlerFactory(async (req, res, next) => {//批量删除住户信息
    var reqBody = req.body;
    var peopleIDs = reqBody.peopleIDs;
    var phIDs = reqBody.phIDs;
    for (const key1 of peopleIDs) {
        var pe = await peopleDal.getByPeopleID(key1);
        if (pe != null) {
            pe.isDeleted = 1;//伪删除
            let del = peopleDal.updateIsdel(pe);
            console.log(del + ".......")
        }
    }
    for (const key2 of phIDs) {

        var peh = await peopleHouseDal.getByID(key2);
        if (peh != null) {
            peh.isDelete = 1;//伪删除
            let dels = peopleHouseDal.updateHousep(peh);
            console.log(dels + "!!!!!")
        }

    }
    return res.json(cFun.responseStatus(0, 'success'));

});
module.exports.delsPeopleInfo = delsPeopleInfo;

var updatePeopleInfo = cFun.awaitHandlerFactory(async (req, res, next) => {//修改采集人口信息
    var reqBody = req.body;

    let peopleEntity = await peopleDal.getByPeopleID(reqBody.peopleID);
    let peopleHouseEntity = await peopleHouseDal.getByHouseID(reqBody.phID);
    if (peopleEntity == null || peopleHouseEntity == null) {

        return res.json(cFun.responseStatus(2, '住户不存在！'));
    }

    peopleHouseEntity.buildingID = reqBody.buildingID;
    peopleHouseEntity.buildingNo = reqBody.buildingNo;
    peopleHouseEntity.houseNo = reqBody.houseNo;
    peopleHouseEntity.houseID = reqBody.houseID;

    peopleHouseEntity.createType = reqBody.createType;
    peopleHouseEntity.workState = reqBody.workState;
    peopleHouseEntity.relationshipWithHouseHold = reqBody.relationshipWithHouseHold;
    peopleHouseEntity.personType = reqBody.personType;
    peopleHouseEntity.sourceType = reqBody.sourceType;
    peopleHouseEntity.resideMode = reqBody.resideMode;
    peopleHouseEntity.isChildren = reqBody.isChildren;
    peopleHouseEntity.isFocus = reqBody.isFocus;
    peopleHouseEntity.isAged = reqBody.isAged;//
    peopleHouseEntity.isCare = reqBody.isCare;
    peopleHouseEntity.isHouse = reqBody.isHouse;
    peopleHouseEntity.isOperation = reqBody.isOperation;
    // peopleHouseEntity.isDelete = 0;
    // peopleHouseEntity.lastOpenDoorTime = cFun.formatDateTime(new Date());

    peopleEntity.peopleType = reqBody.peopleType;
    peopleEntity.credentialType = reqBody.credentialType;
    peopleEntity.credentialTypeCN = reqBody.credentialTypeCN;
    peopleEntity.credentialNo = reqBody.credentialNo;
    peopleEntity.peopleName = reqBody.peopleName;
    peopleEntity.gender = reqBody.gender;
    peopleEntity.genderCode = reqBody.genderCode;
    peopleEntity.nation = reqBody.nation;
    peopleEntity.nationCode = reqBody.nationCode;
    peopleEntity.birthDate = reqBody.birthDate;
    peopleEntity.origin = reqBody.origin;
    peopleEntity.originCode = reqBody.originCode;
    peopleEntity.domiclle = reqBody.domiclle;
    peopleEntity.domiclleCode = reqBody.domiclleCode;
    peopleEntity.domiclleRoadName = reqBody.domiclleRoadName;
    peopleEntity.domiclleRoadCode = reqBody.domiclleRoadCode;
    peopleEntity.domiclleDetailAddress = reqBody.domiclleDetailAddress;
    peopleEntity.domiclleAddress = reqBody.domiclleAddress;
    peopleEntity.residence = reqBody.residence;
    peopleEntity.residenceCode = reqBody.residenceCode;
    peopleEntity.residenceRoadName = reqBody.residenceRoadName;
    peopleEntity.residenceRoadCode = reqBody.residenceRoadCode;
    peopleEntity.residenceDetailAddress = reqBody.residenceDetailAddress;
    peopleEntity.residenceAddress = reqBody.residenceAddress;
    peopleEntity.education = reqBody.education;
    peopleEntity.educationCode = reqBody.educationCode;
    peopleEntity.political = reqBody.political;
    peopleEntity.political_Code = reqBody.political_Code;
    peopleEntity.maritialStatus = reqBody.maritialStatus;
    peopleEntity.maritalStatusCode = reqBody.maritalStatusCode;
    peopleEntity.spouseName = reqBody.spouseName;
    peopleEntity.spouseNo = reqBody.spouseNo;
    peopleEntity.nationality = reqBody.nationality;
    peopleEntity.nationalityCode = reqBody.nationalityCode;
    peopleEntity.entryTime = reqBody.entryTime;
    peopleEntity.surnameEng = reqBody.surnameEng;
    peopleEntity.nameEng = reqBody.nameEng;
    peopleEntity.phoneNo = reqBody.phoneNo;
    peopleEntity.headPic = reqBody.headPic;
    peopleEntity.idPic = reqBody.idPic;
    peopleEntity.livePic = reqBody.livePic;
    peopleEntity.source = reqBody.source;
    // peopleEntity.isDeleted = 0;
    await peopleDal.updateInfo(peopleEntity);
    await peopleHouseDal.update(peopleHouseEntity);
    return res.json(cFun.responseStatus(0, 'success'));
});
module.exports.updatePeopleInfo = updatePeopleInfo;

var getPeopleLike = cFun.awaitHandlerFactory(async (req, res, next) => {//根据住户信息模糊搜索
    var reqBody = req.body;
    var peoplelists = null;
    peoplelists = await peopleDal.getByPeopleLike(Number(reqBody.pageNum), Number(reqBody.pageSize), reqBody.villageID, reqBody.peopleInfo);
    let peopleCount = await peopleDal.getByPeopleLikeCount(reqBody.villageID, reqBody.peopleInfo);
    return res.json(cFun.responseStatus(0, 'success', {
        peoplelists: peoplelists,
        peopleCount: peopleCount
    }));
});
module.exports.getPeopleLike = getPeopleLike;

var getPeopleAdvancedLike = cFun.awaitHandlerFactory(async (req, res, next) => {//根据住户信息高级搜索
    var reqBody = req.body;
    var peopleAdvancedlists = await peopleDal.getPeopleAdvancedLike(Number(reqBody.pageNum), Number(reqBody.pageSize),
        reqBody.villageID, reqBody.peopleName, reqBody.genderCode, reqBody.credentialNo, reqBody.phoneNo, reqBody.nation,
        reqBody.insertTime, reqBody.houseNo, reqBody.buildingID, reqBody.resideMode, reqBody.isChildren, reqBody.isAged,
        reqBody.isFocus, reqBody.isCare, reqBody.isHouse);
    let peopleAdvancedCount = await peopleDal.getPeopleAdvancedLikeCount(
        reqBody.villageID, reqBody.peopleName, reqBody.genderCode, reqBody.credentialNo, reqBody.phoneNo, reqBody.nation,
        reqBody.insertTime, reqBody.houseNo, reqBody.buildingID, reqBody.resideMode, reqBody.isChildren, reqBody.isAged,
        reqBody.isFocus, reqBody.isCare, reqBody.isHouse);
    return res.json(cFun.responseStatus(0, 'success', {
        peopleAdvancedlists: peopleAdvancedlists,
        peopleAdvancedCount: peopleAdvancedCount
    }));
});
module.exports.getPeopleAdvancedLike = getPeopleAdvancedLike;

var getHouseListByPeopleId = cFun.awaitHandlerFactory(async (req, res, next) => {//根据人员ID获取房屋列表
    var reqBody = req.body;
    houseList = await peopleHouseDal.getByPeopleIDs(reqBody.peopleID);
    return res.json(cFun.responseStatus(0, 'success', {
        houseList: houseList
    }));

});
module.exports.getHouseListByPeopleId = getHouseListByPeopleId;  