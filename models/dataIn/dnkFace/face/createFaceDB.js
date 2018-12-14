const cFun = require("../../../utils/commonFunc");
const faceGWDal = require("../../../dals/f_face_gatewayDal");
const sendRequest = require("../../../utils/sendRequest");
const middleServerDal = require("../../../dals/f_middle_serverDal");

//待使用该接口
var createFaceDB = cFun.awaitHandlerFactory(async (req, res, next) => {
    
    var reqBody = req.body;
    if(!reqBody){
        return res.json(cFun.responseStatus(-1 , "缺少消息体"))
    }

    if(!reqBody.buildingID){
        return res.json(cFun.responseStatus(-2 , "缺少楼栋ID信息"));
    }

    var faceGW = await faceGWDal.getByBuildingID(reqBody.buildingID);
    if(!faceGW){
        return res.json(cFun.responseStatus(-3 , "未找到楼栋对应的人脸网关"));
    }

    var middleServer = await middleServerDal.getByID(faceGW.middleServerID);

    var sendBody = {
        channel : [{
            ip : faceGW.ip,
            port :faceGW.port
        }]
    }
    var responseData = await sendRequest.requestAPI("POST" , middleServer.ip , middleServer.port , "/faceGW/createFaceDB" , sendBody );
    
    if(responseData.responseStatus.resultCode == 0){
        return res.json(cFun.responseStatus(0, 'success'));
    }else{
        return res.json(cFun.responseStatus(-4 , "底层设备创建数据库失败"))
    }

});
module.exports.createFaceDB = createFaceDB;