const cFun = require("../../../utils/commonFunc");
const doorStatusDal = require("../../../dals/e_door_statusDal");
const doorStatusEntity = require("../../../entitys/e_door_statusEntity");

var doorStatus = cFun.awaitHandlerFactory(async (req, res, next) => {
    
    var reqBody = req.body;
    if(!reqBody){
        return res.json(cFun.responseStatus(-1 , "缺少消息体"))
    }

    if(!reqBody.DeviceMAC || !reqBody.timeStamp || !reqBody.state){
        return res.json(cFun.responseStatus(-2 , "缺失重要信息(DeviceMAC or timeStamp or state)"));
    }

    var doorStatusRecode = new doorStatusEntity();
    doorStatusRecode.doorStatusID = cFun.guid();
    doorStatusRecode.deviceMAC = reqBody.DeviceMAC;
    doorStatusRecode.timeStamp = reqBody.timeStamp;
    doorStatusRecode.state = reqBody.state;

    doorStatusDal.insert(doorStatusRecode);

    return res.json(cFun.responseStatus(0 , "success"));

});
module.exports.doorStatus = doorStatus;