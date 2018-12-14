const cFun = require("../../../utils/commonFunc");
const gatewayDal = require("../../../dals/f_face_gatewayDal");
const middleServerDal = require("../../../dals/f_middle_serverDal");
const requestUtil = require("../../../utils/sendRequest");

var heartbeat = cFun.awaitHandlerFactory(async (req, res, next) => {
    
    var reqBody = req.body;
    if(!reqBody.faceGWID){
        return res.json(cFun.responseStatus(-1 , "缺少人脸网关ID"))
    }

    var faceGWID = reqBody.faceGWID;

    var gateways = await gatewayDal.getByFaceGWID(faceGWID);
    if(!gateways){
        return res.json(cFun.responseStatus(-2 , "没有找到匹配的人脸网关"));
    }
    var middleServers = await middleServerDal.getByID(gateways.middleServerID)
    if(!middleServers){
        return res.json(cFun.responseStatus(-3 , "未找到物联网关"));
    }

    var sendBody = {
        channel : [{
            ip : gateways.ip,
            port : gateways.port
        }]
    }

    requestUtil.requestAPI("POST" , middleServers.ip , middleServers.port , "/faceGW/openDoor",sendBody);
    
    return res.json(cFun.responseStatus(0, 'success'));
});
module.exports.heartbeat = heartbeat;