const cFun = require("../../../utils/commonFunc");
const requestUtil = require("../../../utils/sendRequest");
const gatewayDal = require("../../../dals/f_face_gatewayDal");
const middleServerDal = require("../../../dals/f_middle_serverDal");

var version = cFun.awaitHandlerFactory(async (req, res, next) => {
    
    /**
     * 如何由前端定位到人脸网关
     */

    var faceGWID = req.query.faceGWID;
    if(!faceGWID){
        return res.json(cFun.responseStatus(-1 , "缺少人脸网关ID"))
    }

    var gateways = await gatewayDal.getByFaceGWID(faceGWID);
    if(!gateways){
        return res.json(cFun.responseStatus(-2 , "没有找到匹配的人脸网关"));
    }
    var middleServers = await middleServerDal.getByID(gateways.middleServerID)
    if(!middleServers){
        return res.json(cFun.responseStatus(-3 , "未找到物联网关"));
    }

    
    var sendBody = {
        channel:{
            ip : gateways.ip,
            port : gateways.port
        }
    }
    
    var responseData = await requestUtil.requestAPI("GET" , middleServers.ip , middleServers.port , "/faceGW/version" , sendBody);
    
    console.log("收到底层设备版本号：");
    console.log(responseData);
    return res.json(cFun.responseStatus(0 , "success"));
    
});
module.exports.version = version;