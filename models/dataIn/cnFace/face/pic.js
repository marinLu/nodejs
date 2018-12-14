const cFun = require("../../../utils/commonFunc");
const peopleDal = require("../../../dals/p_peopleDal");
const deviceDal = require("../../../dals/e_deviceDal");
const accessDal = require("../../../dals/e_accessDal");
const peopleHouseDal = require("../../../dals/p_people_houseDal");
const sendRequest = require("../../../utils/sendRequest");
const config= require("../../../config");

var addOrModify = cFun.awaitHandlerFactory(async (req, res, next) => {
    // { peopleID :  peopleEntity.peopleID, faceID: fId, buildingID: reqBody.buildingID, command: 1 ,phID : peopleHouseEntity.phID , headPic: reqBody.headPic };
    var reqBody = req.body;
    
    if (!reqBody.command) {
        return res.json(cFun.responseStatus(-1, "缺少命令参数"));
    }
    var command = reqBody.command;
    
    if (!reqBody.faceID) {
        return res.json(cFun.responseStatus(-2, "缺少人员信息"))
    }
    var faceID = reqBody.faceID;
    var peopleID = reqBody.peopleID;
    var faceContent = reqBody.headPic;
    var buildingID = reqBody.buildingID;
    var houseID = reqBody.phID;
    
    var house = await peopleHouseDal.getByID(houseID);
    if(!house){
        return res.json(cFun.responseStatus(-3,"未找到房屋信息"));
    }

    var device = await deviceDal.query(`select * from e_device where type = "access" buildingID = ${buildingID}`);
    if(!device){
        return res.json(cFun.responseStatus(-3, "未找到设备"));
    }
    
    var access = await accessDal.getByDeviceID(device[0].deviceID);
    if(!access){
        return res.json(cFun.responseStatus(-3 , "未找到设备"))
    }
    
    var deviceMAC = access.faceGatewayMac.replace(/:/g, "");
    var people = await peopleDal.getByPeopleID(peopleID);
    if (!people) {
        return res.json(cFun.responseStatus(-5, "未找到对应的人员信息"))
    }
    
    var sendAddPicBody = {
        deviceMAC : deviceMAC,
        faceID: faceID,
        faceContent: faceContent,
        credentialType: people.credentialType,
        credentialNo: people.credentialNo
    }
    
    res.json(cFun.responseStatus(0, 'success'));

    if (command == 1) {//增加人脸
        var responseData = await sendRequest.requestAPI("POST", config().wangliConfig.gateWay.host, config().wangliConfig.gateWay.port, "/face/pic/add", sendAddPicBody);
        house.faceSendStatus = 0;
        peopleHouseDal.update(house);
    } else if (command == 2) {
        var sendRemovePicBody = {
            faceID: faceID
        }
        var responseData = await sendRequest.requestAPI("POST",  config().wangliConfig.gateWay.host, config().wangliConfig.gateWay.port, "/face/Delete", sendRemovePicBody);
        if(responseData == -1){
            return
        }
        responseData = sendRequest.requestAPI("POST",  config().wangliConfig.gateWay.host, config().wangliConfig.gateWay.port, "/face/pic/add", sendAddPicBody);
        if(responseData == -1){
            house.faceSendStatus = 0;
        }else{
            house.faceSendStatus = 1;
        }
        peopleHouseDal.update(house);
    }

});
module.exports.addOrModify = addOrModify;


var Delete = cFun.awaitHandlerFactory(async (req, res, next) => {

    // var obj = { peopleID :  pe.peopleID, faceID: pe.faceID, buildingID: pe.buildingID};

    var reqBody = req.body;

    if (!reqBody.peopleID) {
        return res.json(cFun.responseStatus(-2, "缺少人员信息"))
    }
    var peopleID = reqBody.peopleID;


    var sendRemovePicBody = {
        faceID: faceID
    }

    var people = await peopleDal.getByPeopleID(peopleID);
    if (!people) {
        return res.json(cFun.responseStatus(-3, "未找到对应的人员信息"))
    }
    var peopleHouse = await peopleHouseDal.getByPeopleID(peopleID);
    if (!peopleHouse) {
        return res.json(cFun.responseStatus(-4, "未找到人员对应的房屋信息"))
    }

    sendRequest.requestAPI("POST", config().wangliConfig.gateWay.host, config().wangliConfig.gateWay.port, "/face/pic/Delete", sendRemovePicBody);

    res.json(cFun.responseStatus(0, 'success'));


});
module.exports.delete = Delete;
