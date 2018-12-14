const cFun = require("../../../utils/commonFunc");
const faceLogDal = require("../../../dals/e_face_logDal");
const faceLogEntity = require("../../../entitys/e_face_logEntity");
const faceDal = require("../../../dals/e_faceDal");
const villageDal = require("../../../dals/b_villageDal");
const peopleDal = require("../../../dals/p_peopleDal");
// const dateFormat = require("../../../utils/dateFormat");
// const faceTopicDal = require("../../../dals/f_face_topicDal");

var uploadAccessLog = cFun.awaitHandlerFactory(async (req, res, next) => {
    
    var reqBody = req.body;

    if(!reqBody.faceCapture || !reqBody.doorCapture ){
        return res.json(cFun.responseStatus(-1 , "消息体中缺少人脸图片或背景图片"));
    }

    var faceCapture = reqBody.faceCapture;
    var doorCapture = reqBody.doorCapture;
    var timeStamp = reqBody.timeStamp;
    var similarity = reqBody.similarity;
    var faceID = reqBody.faceID;            //faceID需要由底层向上传入，或者传入相关字段到数据库中查询e_face找到faceID也可以
    var cameraIP = reqBody.cameraIP;
    var credentialNo = reqBody.credentialNo;
    var deviceID = reqBody.DeviceID;

    var peoples = await peopleDal.query(`select * from p_people where faceID = "${faceID}" or credentialNo = "${credentialNo}"`);
    if(!peoples || peoples.length == 0){
        return res.json(cFun.responseStatus(-3 , "未找到该人身份信息"))
    }

    if(!cameraIP){
        return res.json(cFun.responseStatus(-4 , "缺少人脸摄像头IP"));
    }
    
    var faces = await faceDal.query(`select * from e_face where deviceID = "${deviceID}")`);
    if(!faces || faces.length == 0){
        return res.json(cFun.responseStatus(-5 , "未找到对应的人脸设备"))
    }

    var faceLogRecode = new faceLogEntity();
    faceLogRecode.faceLogID = cFun.guid();
    faceLogRecode.faceID = faces[0].faceID;
    faceLogRecode.credentialNo = credentialNo ? credentialNo : "";
    faceLogRecode.credentialType = credentialNo ? 1 : 0;
    faceLogRecode.faceSimilarity = similarity;
    faceLogRecode.faceCaptureTime = timeStamp;
    faceLogRecode.faceUrl = faceCapture;
    faceLogRecode.bkgUrl = doorCapture;

    faceLogDal.insert(faceLogRecode)

    var village = await villageDal.getByVillageID(faces[0].villageID);
    if(!village || village.length == 0){
        return res.json(cFun.responseStatus(-4 , "没有找到小区信息"));
    }

    // var lastLocation = null;
    // var lastBackgroundPic = null;
    // var lastFaceUrl = null;
    // var lastPassTime = null;

    var lastFaceLogs;
    if(credentialNo){
        lastFaceLogs = await faceLogDal.query(`select * from e_face_log where credentialNo = "${credentialNo}" order by faceCaptureTime asc`);
    }
    if(lastFaceLogs && lastFaceLogs.length > 0){
        lastFaceUrl = lastFaceLogs[0].faceUrl;
        lastBackgroundPic = lastFaceLogs[0].bkgUrl;
        lastPassTime = lastFaceLogs[0].faceCaptureTime;

        var faces = await faceDal.query(`select * from e_face where faceID = "${lastFaceLogs[0].faceID}"`);
        if(faces && faces.length > 0){
            lastLocation = faces[0].channelNo;
        }
    }

    // var faceTopic = await faceTopicDal.getByVillageID();

    // var data = {
    //     backgroundPic: faceLogRecode.bkgUrl,//大图片
    //     faceUrl: faceLogRecode.faceUrl,//小图片
    //     Stranger: faceLogRecode.credentialType, //0 非 1 是
    //     passTime: dateFormat.changeDateFullFormat(timeStamp),//时间 yyyy-MM-dd HH:mm:ss
    //     deviceId: faceRecode[0].deviceID,
    //     similarity:similarity || null,
        
    //     villageID: faceRecode[0].villageID,
    //     Location:  village.name,
    //     Longitude: village.longitude,//baidu
    //     Latitude: village.latitude,
    //     coordinate:"84",
        
    //     lastLocation: lastLocation,
    //     lastBackgroundPic:  lastBackgroundPic,//大图片
    //     lastFaceUrl:  lastFaceUrl,//小图片
    //     lastPassTime:  lastPassTime,//时间 yyyy-MM-dd HH:mm:ss
        
    // };

    // sendMQ(faceTopic.topicName , data);

    return res.json(cFun.responseStatus(0 , "success"));

});
module.exports.uploadAccessLog = uploadAccessLog;