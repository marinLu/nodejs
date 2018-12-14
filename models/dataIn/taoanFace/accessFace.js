const crypto = require("crypto-js");
const dahuaConfig = require("../../../config/dahuaConfig");
const config = require("../../config");
const sendRequest = require("../../utils/sendRequest");
const cFun = require("../../utils/commonFunc");
const sendToMinio = require("../../utils/sendToMinio");
const dateFormat = require("../../utils/dateFormat");
const e_faceDal = require("../../dals/e_faceDal");
const e_face_logDal = require("../../dals/e_face_logDal");
const e_deviceLog = require("../../dals/e_deviceDal");
const s_resource = require("../../dals/s_resourceDal");
const e_face_logEntity = require("../../entitys/e_face_logEntity");
const uuid = require("uuid");
const sendMQ = require("../../utils/sendMQ");
const util = require("util");

var accessFace = cFun.awaitHandlerFactory(async (req, res, next) => {
    var reqBody = req.body;
    console.log(reqBody);
    if (!reqBody) {
        return res.json(cFun.responseStatus(-1, "缺少消息体"));
    }

    if (!reqBody.thirdCameraID || !reqBody.faceCaptureTime || !reqBody.faceUrl || !reqBody.bkgUrl) {
        return res.json(cFun.responseStatus(-2, "请求体缺少必要的相关信息，请求体内容：" + util.inspect(reqBody)))
    }

    var thirdCameraID = reqBody.thirdCameraID;
    var faceCaptureTime = reqBody.faceCaptureTime;
    var faceUrl = reqBody.faceUrl;
    var bkgUrl = reqBody.bkgUrl;

    var faces = await e_face_logDal.query("select * from e_face where thirdCameraID = '" + thirdCameraID + "'");
    if (!faces || faces.length == 0) {
        return res.json(cFun.responseStatus(-3, "没有找到对应的e_face"))
    }

    var cameras = await e_deviceLog.query("select * from e_device where deviceID = '"+faces[0].deviceID+"'");
    if(!cameras || cameras.length == 0){
        return res.json(cFun.responseStatus(-5 , "e_device中没找到camera记录信息"))
    }


    var faceLogRecode = new e_face_logEntity();
    faceLogRecode.faceLogID = cFun.guid();
    faceLogRecode.faceID = faces[0].faceID;
    faceLogRecode.credentialNo = reqBody.credentialNo || 0;
    faceLogRecode.credentialType = reqBody.credentialNo ? 1 : 0;
    faceLogRecode.faceCaptureTime = faceCaptureTime;
    faceLogRecode.faceUrl = faceUrl;
    faceLogRecode.bkgUrl = bkgUrl;
    e_face_logDal.insert(faceLogRecode);

    var data = {
        backgroundPic: faceLogRecode.bkgUrl,//大图片
        faceUrl: faceLogRecode.faceUrl,//小图片
        Stranger: faceLogRecode.credentialType, //0 非 1 是
        passTime: dateFormat.changeDateFullFormat(faceLogRecode.faceCaptureTime),//时间 yyyy-MM-dd HH:mm:ss
        deviceId: faces[0].deviceID,
        similarity:undefined,
        
        villageID: cameras[0].villageID,
        Location:  cameras[0].name,
        Longitude: cameras[0].longitude,//baidu
        Latitude: cameras[0].latitude,
        coordinate:"84",
        
        lastLocation: undefined,
        lastBackgroundPic:  undefined,//大图片
        lastFaceUrl:  undefined,//小图片
        lastPassTime:  undefined,//时间 yyyy-MM-dd HH:mm:ss
        
    };

    sendMQ('/web/event/map/faceLog' , data);

    return res.json(cFun.responseStatus(0, "success"))
})
module.exports.accessFace = accessFace;

